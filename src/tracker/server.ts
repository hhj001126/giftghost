/**
 * GiftGhost Tracking SDK - Server Side
 *
 * 用于追踪 Server Actions 和服务端事件
 *
 * 使用方式:
 * - startAISession() - 创建 AI 会话
 * - completeAISession() - 完成 AI 会话
 * - saveUserFeedback() - 保存用户反馈
 */

'use server';

import { headers, cookies } from 'next/headers';
import {
  getTraceContext,
  createAISession,
  updateAISessionResult,
  createFeedbackRecord,
} from './trace-server';
import { generateTraceId, setTraceCookies, clearTraceCookie, type AIGenerationData, type AIGenerationResult, type FeedbackData } from './trace-utils';
import { getServerTracker } from './tracker-shared';

// ============ 辅助函数 ============

/**
 * 获取请求元数据
 */
async function getRequestMetadata() {
  const headersList = await headers();
  const cookiesList = await cookies();

  return {
    userAgent: headersList.get('user-agent'),
    anonymousId: cookiesList.get('gg_anonymous_id')?.value,
    sessionId: cookiesList.get('gg_session_id')?.value,
  };
}

// ============ 追踪功能 ============

/**
 * 手动追踪服务端事件
 */
export async function trackServerEvent(
  name: string,
  properties?: Record<string, any>
): Promise<void> {
  const metadata = await getRequestMetadata();
  const tracker = getServerTracker();

  await tracker.track(name, {
    ...properties,
    sessionId: metadata.sessionId,
    anonymousId: metadata.anonymousId,
    userAgent: metadata.userAgent,
  });
}

/**
 * 追踪 AI 生成结果
 */
export async function trackAiGeneration(data: {
  mode: string;
  responseTimeMs: number;
  locale: string;
  success: boolean;
  persona?: string;
  giftItem?: string;
  error?: string;
}): Promise<void> {
  const metadata = await getRequestMetadata();
  const tracker = getServerTracker();

  await tracker.track('ai_generation', {
    input_mode: data.mode,
    response_time_ms: data.responseTimeMs,
    locale: data.locale,
    success: data.success,
    persona: data.persona,
    gift_item: data.giftItem,
    error: data.error,
    sessionId: metadata.sessionId,
    anonymousId: metadata.anonymousId,
    userAgent: metadata.userAgent,
  });
}

/**
 * 追踪用户反馈
 */
export async function trackFeedback(data: {
  sessionId: string;
  feedbackType: 'like' | 'dislike';
  giftItem: string;
  persona: string;
  deviceType: 'mobile' | 'desktop';
}): Promise<void> {
  const metadata = await getRequestMetadata();
  const tracker = getServerTracker();

  await tracker.track('user_feedback', {
    feedback_type: data.feedbackType,
    gift_item: data.giftItem,
    persona: data.persona,
    device_type: data.deviceType,
    sessionId: data.sessionId,
    anonymousId: metadata.anonymousId,
    userAgent: metadata.userAgent,
  });
}

/**
 * 追踪会话开始
 */
export async function trackSessionStart(data: {
  mode: string;
  locale: string;
  inputLength: number;
}): Promise<void> {
  const metadata = await getRequestMetadata();
  const tracker = getServerTracker();

  await tracker.track('session_start', {
    input_mode: data.mode,
    locale: data.locale,
    input_length: data.inputLength,
    sessionId: metadata.sessionId,
    anonymousId: metadata.anonymousId,
    userAgent: metadata.userAgent,
  });
}

// ============ 业务数据操作 ============

/**
 * 保存 AI 会话开始（创建记录）
 */
export async function startAISession(data: AIGenerationData): Promise<string> {
  const context = await getTraceContext();
  const traceId = context.traceId || generateTraceId();

  await createAISession({
    trace_id: traceId,
    input_mode: data.input_mode,
    input_content: data.input_content,
    input_length: data.input_content.length,
    locale: data.locale,
    session_id: context.sessionId,
    anonymous_id: context.anonymousId,
  });

  // 设置 cookie 以便客户端追踪
  setTraceCookies(traceId);

  // 追踪埋点事件
  const tracker = getServerTracker();
  await tracker.track('ai_session_start', {
    input_mode: data.input_mode,
    input_length: data.input_content.length,
    locale: data.locale,
    sessionId: context.sessionId,
    anonymousId: context.anonymousId,
    traceId,
  });

  return traceId;
}

/**
 * 完成 AI 会话（更新结果）
 */
export async function completeAISession(
  traceId: string,
  result: AIGenerationResult
): Promise<void> {
  const context = await getTraceContext();

  // 更新 AI 会话记录
  await updateAISessionResult(traceId, {
    ...result,
    status: 'completed',
  });

  // 追踪埋点事件
  const tracker = getServerTracker();
  await tracker.track('ai_generation_completed', {
    persona: result.persona,
    gift_item: result.gift_item,
    response_time_ms: result.response_time_ms,
    sessionId: context.sessionId,
    anonymousId: context.anonymousId,
    traceId,
  });
}

/**
 * 标记 AI 会话失败
 */
export async function failAISession(
  traceId: string,
  error: string,
  responseTimeMs: number
): Promise<void> {
  const context = await getTraceContext();

  await updateAISessionResult(traceId, {
    persona: '',
    pain_point: '',
    obsession: '',
    gift_item: '',
    gift_reason: '',
    gift_buy_link: '',
    response_time_ms: responseTimeMs,
    status: 'failed',
    error_message: error,
  });

  const tracker = getServerTracker();
  await tracker.track('ai_generation_failed', {
    error,
    response_time_ms: responseTimeMs,
    sessionId: context.sessionId,
    anonymousId: context.anonymousId,
    traceId,
  });
}

/**
 * 保存用户反馈
 */
export async function saveUserFeedback(
  traceId: string,
  data: FeedbackData
): Promise<void> {
  const context = await getTraceContext();

  // 获取 AI session ID
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: aiSession } = await supabase
    .from('ai_sessions')
    .select('id')
    .eq('trace_id', traceId)
    .single();

  if (!aiSession) {
    console.error('[Trace] AI session not found for trace_id:', traceId);
    return;
  }

  await createFeedbackRecord({
    trace_id: traceId,
    ai_session_id: aiSession.id,
    feedback_type: data.feedback_type,
    feedback_score: data.feedback_score,
    feedback_reason: data.feedback_reason,
    result_snapshot: data.result_snapshot,
    device_type: context.deviceType,
    session_id: context.sessionId,
    anonymous_id: context.anonymousId,
  });

  const tracker = getServerTracker();
  await tracker.track('user_feedback', {
    feedback_type: data.feedback_type,
    feedback_score: data.feedback_score,
    feedback_reason: data.feedback_reason,
    sessionId: context.sessionId,
    anonymousId: context.anonymousId,
    traceId,
  });
}

// ============ 导出 ============

export { getRequestMetadata };
