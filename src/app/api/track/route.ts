import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ============ 类型定义 ============

interface TrackingEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
  sessionId: string;
  anonymousId: string;
}

interface TrackingRequest {
  events: TrackingEvent[];
}

// ============ 辅助函数 ============

/**
 * 从 User-Agent 解析设备类型
 */
function parseDeviceType(userAgent?: string): 'mobile' | 'tablet' | 'desktop' {
  if (!userAgent) return 'desktop';

  const ua = userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)/i.test(ua)) return 'tablet';
  if (/mobile|android|pocket|psp|symbian|windows phone/i.test(ua)) return 'mobile';
  return 'desktop';
}

/**
 * 简化 IP 地址（用于隐私保护）
 */
function anonymizeIp(ip?: string): string | null {
  if (!ip) return null;
  // 只保留前两段
  const parts = ip.split('.');
  if (parts.length >= 2) {
    return `${parts[0]}.${parts[1]}.xxx.xxx`;
  }
  return 'xxx.xxx.xxx.xxx';
}

/**
 * 生成简洁的浏览器/平台信息
 */
function parseBrowserInfo(userAgent?: string): Record<string, string> {
  if (!userAgent) return { browser: 'Unknown', os: 'Unknown' };

  let browser = 'Unknown';
  let os = 'Unknown';

  // 检测浏览器
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Edge')) browser = 'Edge';

  // 检测操作系统
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

  return { browser, os };
}

/**
 * 清理事件属性（防止恶意数据）
 */
function sanitizeProperties(properties?: Record<string, any>): Record<string, any> {
  if (!properties) return {};

  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(properties)) {
    // 跳过 undefined
    if (value === undefined) continue;

    // 跳过函数
    if (typeof value === 'function') continue;

    // 处理对象
    if (typeof value === 'object' && value !== null) {
      try {
        const str = JSON.stringify(value);
        // 限制单个属性的大小
        if (str.length > 50000) {
          sanitized[key] = '[TRUNCATED]';
        } else {
          sanitized[key] = JSON.parse(str);
        }
      } catch {
        sanitized[key] = String(value);
      }
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

// ============ POST /api/track ============

export async function POST(request: NextRequest) {
  try {
    const body: TrackingRequest = await request.json();

    if (!body.events || !Array.isArray(body.events) || body.events.length === 0) {
      return NextResponse.json(
        { error: 'No events provided' },
        { status: 400 }
      );
    }

    // 限制单次请求的事件数量
    if (body.events.length > 100) {
      return NextResponse.json(
        { error: 'Too many events' },
        { status: 400 }
      );
    }

    // 获取请求元数据
    const userAgent = request.headers.get('user-agent') || undefined;
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || undefined;

    const { browser, os } = parseBrowserInfo(userAgent);
    const deviceType = parseDeviceType(userAgent);

    // 准备批量插入数据
    const supabase = await createClient();

    const records = body.events.map((event) => ({
      name: event.name,
      properties: sanitizeProperties(event.properties),
      timestamp: new Date(event.timestamp).toISOString(),
      session_id: event.sessionId,
      anonymous_id: event.anonymousId,
      // 元数据
      user_agent: userAgent?.slice(0, 500), // 限制长度
      device_type: deviceType,
      browser,
      os,
      ip_hash: anonymizeIp(ip),
      // 服务端信息
      received_at: new Date().toISOString(),
    }));

    // 批量写入 Supabase
    const { data, error } = await supabase
      .from('tracking_events')
      .insert(records)
      .select('id');

    if (error) {
      console.error('[Track API] Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Failed to store events' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: data?.length || records.length,
    });
  } catch (error) {
    console.error('[Track API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============ GET /api/track ============

export async function GET() {
  return NextResponse.json({
    service: 'GiftGhost Tracking API',
    version: '1.0.0',
    endpoints: {
      POST: 'Submit tracking events',
    },
  });
}
