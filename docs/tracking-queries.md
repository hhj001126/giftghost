# GiftGhost 追踪数据查询指南

本文档提供查询用户完整会话链路的 SQL 示例，从输入开始到 AI 结果再到用户反馈。

---

## 数据架构

```
┌─────────────────────────────────────────────────────────────┐
│                    埋点层 (tracking_events)                  │
│  • page_view, scene_transition, click 等轻量事件             │
│  • 通过 trace_id 关联业务数据                                 │
└─────────────────────────────────────────────────────────────┘
                              │ trace_id
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    业务层                                     │
│  • ai_sessions      - AI 交互的完整记录                       │
│  • user_feedback    - 用户反馈记录                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 一、查询单个会话的完整链路

### 1.1 使用视图函数查询（推荐）

```sql
-- 查询单个 trace_id 的完整链路
SELECT * FROM get_full_trace('your-trace-id');
```

**返回结果：**

| event_order | event_type | event_name | event_timestamp | event_properties | ai_session | feedback_data |
|-------------|------------|------------|-----------------|------------------|------------|---------------|
| 1 | tracking | page_view | 2024-01-15 10:00:00 | {"url": "/", "from": null} | null | null |
| 2 | tracking | scene_transition | 2024-01-15 10:00:05 | {"from": "INPUT", "to": "THINKING"} | null | null |
| 3 | ai_session | ai_generation | 2024-01-15 10:00:10 | {"input_mode": "LISTENER", "persona": "..."} | {...} | null |
| 4 | feedback | user_feedback | 2024-01-15 10:00:15 | {"feedback_type": "like"} | null | {...} |

### 1.2 手动查询完整链路

```sql
-- 查询单个会话的完整时间线
SELECT
    ROW_NUMBER() OVER (ORDER BY te.timestamp) AS step,
    te.name AS event,
    te.timestamp,
    te.properties,
    ai.input_mode,
    ai.persona,
    ai.gift_item,
    fb.feedback_type
FROM tracking_events te
LEFT JOIN ai_sessions ai ON ai.trace_id = te.trace_id
LEFT JOIN user_feedback fb ON fb.trace_id = te.trace_id
WHERE te.trace_id = 'your-trace-id'
ORDER BY te.timestamp;
```

---

## 二、AI 会话查询

### 2.1 查询 AI 会话详情

```sql
-- 查询单个 AI 会话的完整信息
SELECT * FROM ai_sessions WHERE trace_id = 'your-trace-id';
```

**返回字段：**

| 字段 | 说明 |
|-----|------|
| trace_id | 追踪 ID |
| input_mode | 输入模式 (DETECTIVE/LISTENER/INTERVIEW) |
| input_content | 原始输入内容 |
| persona | 生成的用户画像 |
| pain_point | 痛点描述 |
| obsession | 执念描述 |
| gift_item | 推荐礼物 |
| gift_reason | 推荐理由 |
| gift_price_range | 价格区间 |
| response_time_ms | AI 响应耗时 |
| status | 状态 (pending/processing/completed/failed) |

### 2.2 按 Persona 统计好评率

```sql
-- 哪些 Persona 获得更多好评
SELECT
    ai.persona,
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE fb.feedback_type = 'like') AS likes,
    COUNT(*) FILTER (WHERE fb.feedback_type = 'dislike') AS dislikes,
    ROUND(
        COUNT(*) FILTER (WHERE fb.feedback_type = 'like')::DECIMAL
        / NULLIF(COUNT(*), 0) * 100,
        2
    ) AS like_rate
FROM ai_sessions ai
LEFT JOIN user_feedback fb ON fb.trace_id = ai.trace_id
WHERE ai.created_at >= NOW() - INTERVAL '7 days'
  AND ai.status = 'completed'
GROUP BY ai.persona
ORDER BY like_rate DESC
LIMIT 20;
```

### 2.3 AI 响应时间分布

```sql
-- AI 响应时间分布
SELECT
    FLOOR(response_time_ms / 1000) AS response_seconds,
    COUNT(*) AS count,
    REPEAT('█', (COUNT(*)::DECIMAL / 10)::INT) AS bar
FROM ai_sessions
WHERE status = 'completed'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY response_seconds
ORDER BY response_seconds;
```

---

## 三、用户反馈查询

### 3.1 查询反馈详情

```sql
-- 查询单个反馈的完整信息
SELECT * FROM user_feedback WHERE trace_id = 'your-trace-id';
```

**返回字段：**

| 字段 | 说明 |
|-----|------|
| trace_id | 关联的 AI 会话 |
| feedback_type | 反馈类型 (like/dislike) |
| feedback_score | 评分 (1-5) |
| feedback_reason | 反馈原因 |
| result_snapshot | 当时推荐的完整结果快照 |
| device_type | 设备类型 |

### 3.2 每日反馈统计

```sql
-- 最近 7 天每日反馈统计
SELECT * FROM get_feedback_quality(7) ORDER BY date DESC;
```

**返回结果：**

| date | total_traces | feedback_count | like_count | dislike_count | like_rate | feedback_rate |
|------|--------------|----------------|------------|---------------|-----------|---------------|
| 2024-01-15 | 150 | 45 | 38 | 7 | 84.44% | 30.00% |
| 2024-01-14 | 180 | 52 | 44 | 8 | 84.62% | 28.89% |

---

## 四、转化漏斗查询

### 4.1 基础漏斗

```sql
-- 查看转化漏斗（开始生成 -> AI 完成 -> 用户反馈）
SELECT * FROM get_trace_funnel(7) ORDER BY step_number;
```

**返回结果：**

| step_number | step_name | event_count | unique_traces | conversion_rate |
|-------------|-----------|-------------|---------------|-----------------|
| 1 | 开始生成 | 1000 | 1000 | 100.00% |
| 2 | AI 生成完成 | 850 | 850 | 85.00% |
| 3 | 用户反馈 | 200 | 200 | 23.53% |

### 4.2 按输入模式统计漏斗

```sql
-- 按输入模式统计转化率
SELECT
    ai.input_mode,
    COUNT(DISTINCT ai.trace_id) AS total,
    COUNT(DISTINCT ai.trace_id) FILTER (WHERE ai.status = 'completed') AS completed,
    COUNT(DISTINCT fb.trace_id) AS with_feedback,
    ROUND(
        COUNT(DISTINCT ai.trace_id) FILTER (WHERE ai.status = 'completed')::DECIMAL
        / COUNT(DISTINCT ai.trace_id) * 100,
        2
    ) AS completion_rate,
    ROUND(
        COUNT(DISTINCT fb.trace_id)::DECIMAL
        / NULLIF(COUNT(DISTINCT ai.trace_id) FILTER (WHERE ai.status = 'completed'), 0) * 100,
        2
    ) AS feedback_rate
FROM ai_sessions ai
LEFT JOIN user_feedback fb ON fb.trace_id = ai.trace_id
WHERE ai.created_at >= NOW() - INTERVAL '7 days'
GROUP BY ai.input_mode;
```

---

## 五、关联查询示例

### 5.1 查询某个用户的所有会话

```sql
-- 查询匿名用户的所有会话
SELECT
    ai.trace_id,
    ai.created_at,
    ai.input_mode,
    ai.persona,
    ai.gift_item,
    ai.response_time_ms,
    fb.feedback_type
FROM ai_sessions ai
LEFT JOIN user_feedback fb ON fb.trace_id = ai.trace_id
WHERE ai.anonymous_id = 'user-anonymous-id'
ORDER BY ai.created_at DESC
LIMIT 50;
```

### 5.2 查询差评会话详情（用于改进）

```sql
-- 查询所有差评会话的完整信息
SELECT
    ai.trace_id,
    ai.created_at,
    ai.input_mode,
    ai.input_content,
    ai.persona,
    ai.pain_point,
    ai.obsession,
    ai.gift_item,
    ai.gift_reason,
    fb.feedback_reason,
    fb.result_snapshot
FROM ai_sessions ai
JOIN user_feedback fb ON fb.trace_id = ai.trace_id
WHERE fb.feedback_type = 'dislike'
  AND ai.created_at >= NOW() - INTERVAL '7 days'
ORDER BY ai.created_at DESC;
```

### 5.3 查询高效会话（快速完成且好评）

```sql
-- 查询响应快且获得好评的会话
SELECT
    trace_id,
    created_at,
    input_mode,
    persona,
    gift_item,
    response_time_ms
FROM ai_sessions
WHERE status = 'completed'
  AND response_time_ms < 5000
  AND trace_id IN (
    SELECT trace_id FROM user_feedback WHERE feedback_type = 'like'
  )
ORDER BY response_time_ms ASC
LIMIT 20;
```

---

## 六、埋点事件查询

### 6.1 查询特定会话的埋点事件

```sql
-- 查询单个会话的所有埋点事件
SELECT
    name,
    timestamp,
    properties,
    device_type,
    browser
FROM tracking_events
WHERE trace_id = 'your-trace-id'
ORDER BY timestamp;
```

### 6.2 页面浏览统计

```sql
-- 最近 7 天页面浏览统计
SELECT
    properties->>'to' AS page,
    COUNT(*) AS views,
    COUNT(DISTINCT session_id) AS unique_sessions
FROM tracking_events
WHERE name = 'page_view'
  AND timestamp >= NOW() - INTERVAL '7 days'
GROUP BY page
ORDER BY views DESC;
```

### 6.3 场景流转统计

```sql
-- 场景流转路径分析
SELECT
    properties->>'from' AS from_scene,
    properties->>'to' AS to_scene,
    COUNT(*) AS transitions,
    AVG((properties->>'duration_ms')::INTEGER) AS avg_duration_ms
FROM tracking_events
WHERE name = 'scene_transition'
  AND timestamp >= NOW() - INTERVAL '7 days'
GROUP FROM from_scene, to_scene
ORDER BY transitions DESC;
```

---

## 七、Supabase JavaScript 查询示例

### 7.1 查询单个会话的完整链路

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, ...);

async function getSessionTrace(traceId: string) {
  // 查询 AI 会话
  const { data: aiSession } = await supabase
    .from('ai_sessions')
    .select('*')
    .eq('trace_id', traceId)
    .single();

  // 查询反馈
  const { data: feedback } = await supabase
    .from('user_feedback')
    .select('*')
    .eq('trace_id', traceId)
    .maybeSingle();

  // 查询埋点事件
  const { data: events } = await supabase
    .from('tracking_events')
    .select('*')
    .eq('trace_id', traceId)
    .order('timestamp', { ascending: true });

  return {
    aiSession,
    feedback,
    events,
  };
}
```

### 7.2 查询转化漏斗

```typescript
async function getFunnelStats(days: number = 7) {
  const { data, error } = await supabase
    .rpc('get_trace_funnel', { p_days: days });

  if (error) throw error;
  return data;
}
```

---

## 八、实时监控查询

```sql
-- 实时统计（过去 1 小时）
SELECT
    COUNT(DISTINCT ai.trace_id) AS active_sessions,
    COUNT(*) FILTER (WHERE ai.status = 'completed') AS completed,
    COUNT(*) FILTER (WHERE fb.feedback_type = 'like') AS likes,
    COUNT(*) FILTER (WHERE fb.feedback_type = 'dislike') AS dislikes,
    ROUND(AVG(ai.response_time_ms)) AS avg_response_ms
FROM ai_sessions ai
LEFT JOIN user_feedback fb ON fb.trace_id = ai.trace_id
WHERE ai.created_at >= NOW() - INTERVAL '1 hour';
```

---

## 九、数据保留策略

```sql
-- 归档 30 天前的数据到汇总表
SELECT archive_old_events();

-- 或直接删除旧数据（谨慎使用）
DELETE FROM tracking_events WHERE created_at < NOW() - INTERVAL '30 days';
DELETE FROM ai_sessions WHERE created_at < NOW() - INTERVAL '90 days';
DELETE FROM user_feedback WHERE created_at < NOW() - INTERVAL '90 days';
```
