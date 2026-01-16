/**
 * Rate Limiting Utility
 *
 * 防止 API 滥用，支持：
 * - 匿名用户限制（按 IP + Anonymous ID）
 * - 登录用户限制（按 User ID）
 * - 每日重置
 */

import { createClient } from '@/lib/supabase/server';

// ============ 配置 ============

const LIMITS = {
  anonymous: {
    maxRequests: 5,
    windowSeconds: 60, // 冷却时间
    resetAtMidnight: true,
  },
  user: {
    maxRequests: 10,
    windowSeconds: 60,
    resetAtMidnight: true,
  },
};

// ============ 类型 ============

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  limit: number;
}

interface RateLimitKey {
  type: 'anonymous' | 'user';
  ip?: string;
  anonymousId?: string;
  userId?: string;
}

// ============ 核心逻辑 ============

/**
 * 生成 rate limit key
 */
function generateKey(info: RateLimitKey): string {
  if (info.type === 'user' && info.userId) {
    return `ratelimit:user:${info.userId}`;
  }

  // 匿名用户：组合 IP + anonymousId
  const parts: string[] = [];
  if (info.ip) parts.push(`ip:${info.ip}`);
  if (info.anonymousId) parts.push(`aid:${info.anonymousId}`);
  return `ratelimit:anon:${parts.join(':')}`;
}

/**
 * 获取客户端 IP
 */
function getClientIP(headers: Headers): string | null {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    null
  );
}

// ============ In-Memory 快速检查 ============

const memoryCache = new Map<string, { count: number; windowEnd: number }>();

/**
 * 快速检查（内存缓存）
 */
function quickCheck(key: string, limit: number, windowSeconds: number): RateLimitResult | null {
  const now = Date.now();
  const cached = memoryCache.get(key);

  if (!cached) {
    // 首次请求
    memoryCache.set(key, { count: 1, windowEnd: now + windowSeconds * 1000 });
    return null; // 需要持久化
  }

  if (now > cached.windowEnd) {
    // 窗口已过，重置
    cached.count = 1;
    cached.windowEnd = now + windowSeconds * 1000;
    return null; // 需要持久化
  }

  if (cached.count >= limit) {
    // 超出限制
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(cached.windowEnd),
      limit,
    };
  }

  // 允许，更新计数
  cached.count++;
  return null; // 需要持久化
}

/**
 * 更新内存缓存
 */
function updateCache(key: string, count: number, windowSeconds: number): void {
  memoryCache.set(key, {
    count,
    windowEnd: Date.now() + windowSeconds * 1000,
  });
}

// ============ Supabase 持久化 ============

/**
 * 从 Supabase 获取当日计数
 */
async function getDbCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  key: string
): Promise<{ count: number; lastReset: Date } | null> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('rate_limits')
    .select('request_count, last_request')
    .eq('key', key)
    .eq('date', today)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    count: data.request_count,
    lastReset: new Date(data.last_request),
  };
}

/**
 * 增加请求计数
 */
async function incrementCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  key: string
): Promise<number> {
  const today = new Date().toISOString().split('T')[0];

  // Upsert
  const { data, error } = await supabase.rpc('increment_rate_limit', {
    p_key: key,
    p_date: today,
  });

  if (error) {
    // 如果 RPC 不存在，用备用方案
    const { data: existing } = await supabase
      .from('rate_limits')
      .select('request_count')
      .eq('key', key)
      .eq('date', today)
      .single();

    if (existing) {
      await supabase
        .from('rate_limits')
        .update({ request_count: existing.request_count + 1 })
        .eq('key', key)
        .eq('date', today);
      return existing.request_count + 1;
    } else {
      await supabase
        .from('rate_limits')
        .insert({ key, request_count: 1, date: today });
      return 1;
    }
  }

  return data;
}

// ============ 主接口 ============

/**
 * 检查并记录请求
 *
 * @param headers 请求头（用于获取 IP）
 * @param options.userId 登录用户 ID
 * @param options.anonymousId 匿名用户 ID
 * @returns RateLimitResult | null（null 表示允许通过，需要持久化计数）
 */
export async function checkRateLimit(
  headers: Headers,
  options: {
    userId?: string;
    anonymousId?: string;
  }
): Promise<RateLimitResult | null> {
  const isUser = !!options.userId;
  const type = isUser ? 'user' : 'anonymous';
  const config = LIMITS[type];
  const ip = getClientIP(headers);

  const key = generateKey({
    type,
    ip: isUser ? undefined : (ip || undefined),
    anonymousId: isUser ? undefined : (options.anonymousId || undefined),
    userId: options.userId,
  });

  // 1. 快速内存检查
  const quickResult = quickCheck(key, config.maxRequests, config.windowSeconds);
  if (quickResult) {
    return quickResult;
  }

  // 2. 需要持久化
  const supabase = await createClient();
  const dbCount = await getDbCount(supabase, key);

  if (dbCount) {
    // 已存在记录
    if (dbCount.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(new Date().setHours(24, 0, 0, 0)), // 明天0点
        limit: config.maxRequests,
      };
    }

    // 增加计数
    const newCount = await incrementCount(supabase, key);
    updateCache(key, newCount, config.windowSeconds);

    return {
      allowed: true,
      remaining: config.maxRequests - newCount,
      resetAt: new Date(new Date().setHours(24, 0, 0, 0)),
      limit: config.maxRequests,
    };
  }

  // 首次请求
  const newCount = await incrementCount(supabase, key);
  updateCache(key, newCount, config.windowSeconds);

  return {
    allowed: true,
    remaining: config.maxRequests - newCount,
    resetAt: new Date(new Date().setHours(24, 0, 0, 0)),
    limit: config.maxRequests,
  };
}

/**
 * 检查是否超出限制（只读，不记录）
 */
export async function peekRateLimit(
  headers: Headers,
  options: {
    userId?: string;
    anonymousId?: string;
  }
): Promise<RateLimitResult> {
  const isUser = !!options.userId;
  const type = isUser ? 'user' : 'anonymous';
  const config = LIMITS[type];
  const ip = getClientIP(headers);

  const key = generateKey({
    type,
    ip: isUser ? undefined : (ip || undefined),
    anonymousId: isUser ? undefined : (options.anonymousId || undefined),
    userId: options.userId,
  });

  // 检查内存缓存
  const cached = memoryCache.get(key);
  if (cached && Date.now() < cached.windowEnd) {
    return {
      allowed: cached.count < config.maxRequests,
      remaining: Math.max(0, config.maxRequests - cached.count),
      resetAt: new Date(cached.windowEnd),
      limit: config.maxRequests,
    };
  }

  // 检查数据库
  const supabase = await createClient();
  const dbCount = await getDbCount(supabase, key);

  if (!dbCount) {
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: new Date(new Date().setHours(24, 0, 0, 0)),
      limit: config.maxRequests,
    };
  }

  return {
    allowed: dbCount.count < config.maxRequests,
    remaining: Math.max(0, config.maxRequests - dbCount.count),
    resetAt: new Date(new Date().setHours(24, 0, 0, 0)),
    limit: config.maxRequests,
  };
}

/**
 * 获取剩余次数
 */
export async function getRemainingRequests(
  headers: Headers,
  options: {
    userId?: string;
    anonymousId?: string;
  }
): Promise<number> {
  const result = await peekRateLimit(headers, options);
  return result.remaining;
}
