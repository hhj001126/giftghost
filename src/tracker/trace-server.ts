/**
 * Trace Server - Server Only
 *
 * 服务端数据库操作
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { headers } from 'next/headers';
import {
  generateTraceId,
  parseDeviceType,
  type TraceContext,
  type AIGenerationData,
  type AIGenerationResult,
  type FeedbackData,
} from './trace-utils';

// ============ Trace Context (Server) ============

/**
 * 获取 Trace Context（服务端版本）
 */
export async function getTraceContext(): Promise<TraceContext> {
  const cookieStore = await cookies();
  const headersList = await headers();

  let anonymousId = cookieStore.get('gg_anonymous_id')?.value;
  if (!anonymousId) {
    anonymousId = generateTraceId();
  }

  let sessionId = cookieStore.get('gg_session_id')?.value;

  let traceId = cookieStore.get('gg_trace_id')?.value;
  if (!traceId) {
    traceId = generateTraceId();
  }

  const userAgent = headersList.get('user-agent') || undefined;
  const deviceType = parseDeviceType(userAgent);

  return {
    traceId,
    sessionId: sessionId || '',
    anonymousId,
    userAgent,
    deviceType,
  };
}

// ============ AI Session 操作 ============

/**
 * 创建 AI 会话记录
 */
export async function createAISession(
  data: {
    trace_id: string;
    input_mode: string;
    input_content: string;
    input_length: number;
    locale: string;
    session_id: string;
    anonymous_id: string;
  }
): Promise<string> {
  const supabase = await createClient();

  const { data: result, error } = await supabase
    .from('ai_sessions')
    .insert({
      trace_id: data.trace_id,
      input_mode: data.input_mode,
      input_content: data.input_content,
      input_preview: data.input_content.slice(0, 200),
      input_length: data.input_length,
      locale: data.locale,
      session_id: data.session_id,
      anonymous_id: data.anonymous_id,
      status: 'processing',
    })
    .select('id')
    .single();

  if (error) {
    console.error('[Trace] Failed to create AI session:', error);
    throw error;
  }

  return result.id;
}

/**
 * 更新 AI 会话结果
 */
export async function updateAISessionResult(
  trace_id: string,
  result: AIGenerationResult & { status: 'completed' | 'failed'; error_message?: string }
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('ai_sessions')
    .update({
      status: result.status,
      persona: result.persona,
      pain_point: result.pain_point,
      obsession: result.obsession,
      gift_item: result.gift_item,
      gift_reason: result.gift_reason,
      gift_price_range: result.gift_price_range,
      gift_buy_link: result.gift_buy_link,
      response_time_ms: result.response_time_ms,
      error_message: result.error_message,
      updated_at: new Date().toISOString(),
    })
    .eq('trace_id', trace_id);

  if (error) {
    console.error('[Trace] Failed to update AI session:', error);
    throw error;
  }
}

// ============ Feedback 操作 ============

/**
 * 创建用户反馈记录
 */
export async function createFeedbackRecord(
  data: {
    trace_id: string;
    ai_session_id: string;
    feedback_type: 'like' | 'dislike';
    feedback_score?: number;
    feedback_reason?: string;
    result_snapshot: Record<string, any>;
    device_type: 'mobile' | 'desktop';
    session_id: string;
    anonymous_id: string;
  }
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('user_feedback')
    .insert({
      trace_id: data.trace_id,
      ai_session_id: data.ai_session_id,
      feedback_type: data.feedback_type,
      feedback_score: data.feedback_score,
      feedback_reason: data.feedback_reason,
      result_snapshot: data.result_snapshot,
      device_type: data.device_type,
      session_id: data.session_id,
      anonymous_id: data.anonymous_id,
    });

  if (error) {
    console.error('[Trace] Failed to create feedback:', error);
    throw error;
  }
}

// ============ 查询操作 ============

/**
 * 获取完整链路数据
 */
export async function getFullTrace(traceId: string) {
  const supabase = await createClient();

  const { data: aiSession } = await supabase
    .from('ai_sessions')
    .select('*')
    .eq('trace_id', traceId)
    .single();

  if (!aiSession) return null;

  const { data: feedback } = await supabase
    .from('user_feedback')
    .select('*')
    .eq('trace_id', traceId)
    .maybeSingle();

  const { data: events } = await supabase
    .from('tracking_events')
    .select('*')
    .eq('trace_id', traceId)
    .order('timestamp', { ascending: true });

  return {
    ai_session: aiSession,
    feedback: feedback,
    events: events || [],
  };
}

/**
 * 获取转化漏斗数据
 */
export async function getFunnelMetrics(days: number = 7) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc('get_trace_funnel', { p_days: days });

  if (error) {
    console.error('[Trace] Failed to get funnel metrics:', error);
    throw error;
  }

  return data;
}

/**
 * 获取反馈质量数据
 */
export async function getFeedbackQuality(days: number = 7) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc('get_feedback_quality', { p_days: days });

  if (error) {
    console.error('[Trace] Failed to get feedback quality:', error);
    throw error;
  }

  return data;
}
