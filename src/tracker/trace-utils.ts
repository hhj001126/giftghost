/**
 * Trace Utilities - Shared (Server + Client)
 *
 * 生成唯一的 trace_id，通用工具函数
 */

// ============ 类型定义 ============

export interface TraceContext {
  traceId: string;
  sessionId: string;
  anonymousId: string;
  userAgent?: string;
  deviceType: 'mobile' | 'desktop';
}

export interface AIGenerationData {
  input_mode: string;
  input_content: string;
  locale: string;
}

export interface AIGenerationResult {
  persona: string;
  pain_point: string;
  obsession: string;
  gift_item: string;
  gift_reason: string;
  gift_price_range?: string;
  gift_buy_link: string;
  response_time_ms: number;
}

export interface FeedbackData {
  feedback_type: 'like' | 'dislike';
  feedback_score?: number;
  feedback_reason?: string;
  result_snapshot: Record<string, any>;
}

// ============ Trace ID 生成 ============

/**
 * 生成唯一的 trace_id
 */
export function generateTraceId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ============ 设备类型解析 ============

export function parseDeviceType(userAgent?: string): 'mobile' | 'desktop' {
  if (!userAgent) return 'desktop';
  const ua = userAgent.toLowerCase();
  if (/mobile|android|pocket|psp|symbian|windows phone/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

export function sessionStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return !!window.sessionStorage;
  } catch {
    return false;
  }
}

// ============ Cookie 操作 ============

/**
 * 设置 Trace Cookie（用于客户端追踪）
 */
export function setTraceCookies(traceId: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `gg_trace_id=${traceId}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;

  if (!sessionStorageAvailable()) return;
  if (!sessionStorage.getItem('gg_session_id')) {
    const sessionId = generateTraceId();
    sessionStorage.setItem('gg_session_id', sessionId);
    document.cookie = `gg_session_id=${sessionId}; path=/; max-age=${60 * 30}; SameSite=Lax`;
  }
}

/**
 * 清除 Trace Cookie
 */
export function clearTraceCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = 'gg_trace_id=; path=/; max-age=0';
}

/**
 * 获取 Cookie 值
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}
