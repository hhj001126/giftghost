'use client';

/**
 * GiftGhost Tracking SDK
 *
 * 非侵入式埋点方案
 *
 * 使用方式:
 * - initTracker() - 初始化（只需一次）
 * - track(name, properties) - 手动埋点
 * - useAutoTrack() - 自动追踪页面浏览
 * - useTrackSceneTransition() - 自动追踪场景流转
 */

import { useEffect, useRef, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// ============ 核心类型 ============

export interface TrackEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
  sessionId: string;
  anonymousId: string;
}

export interface TrackerConfig {
  endpoint: string;
  batchSize?: number;
  flushInterval?: number;
  enableDebug?: boolean;
  enableAutoPageView?: boolean;
}

// ============ Tracker 类 ============

class Tracker {
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
      enableAutoPageView: true,
      ...config,
      endpoint: config.endpoint || '/api/track',
    } as Required<TrackerConfig>;

    this.sessionId = this.getOrCreateSessionId();
    this.anonymousId = this.getOrCreateAnonymousId();
    this.setupOnlineListener();
    this.startFlushTimer();
    this.initialized = true;

    this.debug('Tracker initialized', {
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
      // 上报失败，重新入队
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
   * 定时批量上报
   */
  private startFlushTimer(): void {
    if (typeof window === 'undefined') return;

    this.flushTimer = setInterval(() => {
      this.flush().catch(() => {});
    }, this.config.flushInterval);
  }

  /**
   * 网络状态监听
   */
  private setupOnlineListener(): void {
    if (typeof window === 'undefined') return;

    this.isOnline = navigator.onLine;

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.debug('Network online');
      this.flush().catch(() => {});
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.debug('Network offline');
    });
  }

  /**
   * 页面离开时强制上报
   */
  flushOnExit(): void {
    if (typeof window === 'undefined') return;

    const sendBeacon = () => {
      if (this.queue.length > 0) {
        navigator.sendBeacon?.(
          this.config.endpoint,
          JSON.stringify({ events: this.queue })
        );
      }
    };

    window.addEventListener('beforeunload', sendBeacon);
    window.addEventListener('pagehide', sendBeacon);
  }

  /**
   * 设置用户属性
   */
  setUserProperties(properties: Record<string, any>): void {
    Object.entries(properties).forEach(([key, value]) => {
      try {
        localStorage.setItem(`gg_user_prop_${key}`, JSON.stringify(value));
      } catch {
        // ignore
      }
    });
  }

  /**
   * 获取用户属性
   */
  getUserProperty(key: string): any {
    try {
      const value = localStorage.getItem(`gg_user_prop_${key}`);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }

  /**
   * 获取当前会话信息
   */
  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      anonymousId: this.anonymousId,
      queueLength: this.queue.length,
      isOnline: this.isOnline,
    };
  }

  /**
   * 清理属性中的敏感信息和特殊值
   */
  private sanitizeProperties(properties?: Record<string, any>): Record<string, any> {
    if (!properties) return {};

    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(properties)) {
      // 过滤 undefined 和函数
      if (value === undefined || typeof value === 'function') continue;

      // 过滤敏感字段
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('password') || lowerKey.includes('token')) continue;

      // 处理复杂对象
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
    if (typeof window === 'undefined') return 'server';

    try {
      let id = sessionStorage.getItem('gg_session_id');
      if (!id) {
        id = this.generateId();
        sessionStorage.setItem('gg_session_id', id);
      }
      return id;
    } catch {
      return this.generateId();
    }
  }

  /**
   * 获取/创建 Anonymous ID
   */
  private getOrCreateAnonymousId(): string {
    if (typeof window === 'undefined') return 'server';

    try {
      let id = localStorage.getItem('gg_anonymous_id');
      if (!id) {
        id = this.generateId();
        localStorage.setItem('gg_anonymous_id', id);
      }
      return id;
    } catch {
      return this.generateId();
    }
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private debug(...args: any[]): void {
    if (this.config.enableDebug) {
      console.log('[GiftGhost Tracker]', ...args);
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

let trackerInstance: Tracker | null = null;

export function initTracker(config?: Partial<TrackerConfig>): Tracker {
  if (trackerInstance) {
    return trackerInstance;
  }

  trackerInstance = new Tracker({
    endpoint: config?.endpoint || '/api/track',
    ...config,
  });

  // 页面离开时上报
  trackerInstance.flushOnExit();

  return trackerInstance;
}

export function getTracker(): Tracker {
  if (!trackerInstance) {
    return initTracker();
  }
  return trackerInstance;
}

// 便捷方法
export function track(name: string, properties?: Record<string, any>): void {
  getTracker().track(name, properties);
}

// 便捷方法：追踪页面浏览
export function trackPageView(properties?: Record<string, any>): void {
  if (typeof window === 'undefined') return;

  const tracker = getTracker();
  tracker.track('page_view', {
    url: window.location.pathname + window.location.search,
    title: document.title,
    referrer: document.referrer,
    ...properties,
  });
}

// 便捷方法：追踪用户行为
export function trackAction(
  action: string,
  properties?: Record<string, any>
): void {
  track('user_action', { action, ...properties });
}

// ============ Re-exports ============

export * from './useAutoTrack';
export * from './TraceContext';
export * from './trace-utils';
// Note: server exports are available via '@/tracker/server'
