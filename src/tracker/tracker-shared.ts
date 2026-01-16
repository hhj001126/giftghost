/**
 * Server Tracker - Shared (Server + Client)
 *
 * 服务端追踪器，用于发送埋点事件
 */

import { getCookie } from './trace-utils';

// ============ 核心类型 ============

interface TrackEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
  sessionId: string;
  anonymousId: string;
  traceId?: string;
}

interface TrackerConfig {
  endpoint?: string;
  batchSize?: number;
  flushInterval?: number;
  enableDebug?: boolean;
}

// ============ Tracker 类 ============

export class ServerTracker {
  private config: Required<TrackerConfig>;
  private queue: TrackEvent[] = [];
  private sessionId: string;
  private anonymousId: string;
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private isOnline = true;
  private initialized = false;

  constructor(config: TrackerConfig) {
    this.config = {
      batchSize: 10,
      flushInterval: 5000,
      enableDebug: false,
      ...config,
      endpoint: config.endpoint || '/api/track',
    } as Required<TrackerConfig>;

    this.sessionId = this.getOrCreateSessionId();
    this.anonymousId = this.getOrCreateAnonymousId();
    this.initialized = true;

    this.debug('ServerTracker initialized', {
      sessionId: this.sessionId,
      anonymousId: this.anonymousId,
    });
  }

  /**
   * 追踪事件
   */
  track(name: string, properties?: Record<string, any>): void {
    if (!this.initialized) return;

    const event: TrackEvent = {
      name,
      properties: this.sanitizeProperties(properties),
      timestamp: Date.now(),
      sessionId: this.sessionId,
      anonymousId: this.anonymousId,
    };

    this.queue.push(event);
    this.debug('Event queued:', event.name, event.properties);

    if (this.queue.length >= this.config.batchSize) {
      this.flush().catch(() => {});
    }
  }

  /**
   * 批量上报
   */
  private async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      this.debug('Events flushed:', events.length);
    } catch (error) {
      this.debug('Flush failed, events requeued:', error);
      this.queue.unshift(...events);
    }
  }

  /**
   * 强制立即上报
   */
  async flushNow(): Promise<void> {
    await this.flush();
  }

  /**
   * 清理属性中的敏感信息
   */
  private sanitizeProperties(properties?: Record<string, any>): Record<string, any> {
    if (!properties) return {};

    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(properties)) {
      if (value === undefined || typeof value === 'function') continue;

      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('password') || lowerKey.includes('token')) continue;

      if (typeof value === 'object' && value !== null) {
        try {
          sanitized[key] = JSON.parse(JSON.stringify(value));
        } catch {
          sanitized[key] = String(value);
        }
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * 获取/创建 Session ID
   */
  private getOrCreateSessionId(): string {
    const id = getCookie('gg_session_id');
    return id || 'server';
  }

  /**
   * 获取/创建 Anonymous ID
   */
  private getOrCreateAnonymousId(): string {
    const id = getCookie('gg_anonymous_id');
    return id || 'unknown';
  }

  private debug(...args: any[]): void {
    if (this.config.enableDebug) {
      console.log('[ServerTracker]', ...args);
    }
  }

  /**
   * 销毁追踪器
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushNow().catch(() => {});
    this.initialized = false;
  }
}

// ============ 单例管理 ============

let serverTrackerInstance: ServerTracker | null = null;

export function getServerTracker(): ServerTracker {
  if (!serverTrackerInstance) {
    serverTrackerInstance = new ServerTracker({});
  }
  return serverTrackerInstance;
}
