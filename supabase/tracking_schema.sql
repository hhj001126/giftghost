-- GiftGhost Complete Data Schema
-- 埋点表 + 业务表，通过 trace_id 关联

-- ============================================
-- 1. 埋点事件表 - 轻量级事件日志
-- ============================================

CREATE TABLE IF NOT EXISTS tracking_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- 事件信息
    name VARCHAR(100) NOT NULL,                    -- 事件名称
    properties JSONB DEFAULT '{}',                 -- 事件属性

    -- 关联
    trace_id UUID,                                 -- 关联业务记录
    session_id VARCHAR(100),                       -- 会话 ID
    anonymous_id VARCHAR(100),                     -- 匿名用户 ID

    -- 设备/网络信息
    user_agent TEXT,
    device_type VARCHAR(20),
    browser VARCHAR(50),
    os VARCHAR(50),

    -- 索引
    INDEX idx_events_name (name),
    INDEX idx_events_trace (trace_id),
    INDEX idx_events_session (session_id),
    INDEX idx_events_anonymous (anonymous_id),
    INDEX idx_events_created (created_at DESC)
);

-- ============================================
-- 2. AI 会话表 - 完整的 AI 交互记录
-- ============================================

CREATE TABLE IF NOT EXISTS ai_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- 追踪关联
    trace_id UUID NOT NULL UNIQUE,                 -- 唯一追踪 ID
    anonymous_id VARCHAR(100),                     -- 匿名用户 ID
    session_id VARCHAR(100),                       -- 会话 ID

    -- 输入信息
    input_mode VARCHAR(20) NOT NULL,               -- DETECTIVE/LISTENER/INTERVIEW
    input_content TEXT NOT NULL,                   -- 原始输入内容
    input_preview VARCHAR(200),                    -- 输入预览（前 200 字符）
    input_length INTEGER,                          -- 输入长度
    locale VARCHAR(10) NOT NULL,                   -- 语言

    -- 输出信息
    persona VARCHAR(200),                          -- 生成的用户画像
    pain_point TEXT,                               -- 痛点描述
    obsession TEXT,                                -- 执念描述
    gift_item VARCHAR(500),                        -- 推荐礼物
    gift_reason TEXT,                              -- 推荐理由
    gift_price_range VARCHAR(100),                 -- 价格区间
    gift_buy_link TEXT,                            -- 购买链接

    -- AI 元数据
    ai_model VARCHAR(50) DEFAULT 'gpt-4o',
    response_time_ms INTEGER,                      -- 响应耗时
    prompt_tokens INTEGER,                         -- 使用的 token（预留）
    completion_tokens INTEGER,

    -- 状态
    status VARCHAR(20) DEFAULT 'pending',          -- pending/processing/completed/failed
    error_message TEXT,

    -- 索引
    INDEX idx_ai_sessions_trace (trace_id),
    INDEX idx_ai_sessions_anonymous (anonymous_id),
    INDEX idx_ai_sessions_session (session_id),
    INDEX idx_ai_sessions_created (created_at DESC),
    INDEX idx_ai_sessions_status (status),
    INDEX idx_ai_sessions_input_mode (input_mode)
);

-- ============================================
-- 3. 用户反馈表 - 完整的反馈记录
-- ============================================

CREATE TABLE IF NOT EXISTS user_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- 关联
    trace_id UUID NOT NULL,                        -- 关联 AI 会话
    ai_session_id UUID NOT NULL,                   -- 关联 AI 会话记录
    anonymous_id VARCHAR(100),
    session_id VARCHAR(100),

    -- 反馈内容
    feedback_type VARCHAR(20) NOT NULL,            -- like/dislike
    feedback_score INTEGER,                        -- 1-5 分评分（可选）
    feedback_reason TEXT,                          -- 反馈原因（可选）
    user_comment TEXT,                             -- 用户评论（可选）

    -- 设备信息
    device_type VARCHAR(20),

    -- 结果快照（方便分析，不关联查询）
    result_snapshot JSONB,                         -- 当时推荐的完整结果

    -- 索引
    INDEX idx_feedback_trace (trace_id),
    INDEX idx_feedback_ai_session (ai_session_id),
    INDEX idx_feedback_anonymous (anonymous_id),
    INDEX idx_feedback_created (created_at DESC),
    INDEX idx_feedback_type (feedback_type),
    CONSTRAINT valid_feedback_type CHECK (feedback_type IN ('like', 'dislike'))
);

-- ============================================
-- 4. 视图函数：获取完整链路
-- ============================================

CREATE OR REPLACE FUNCTION get_full_trace(p_trace_id UUID)
RETURNS TABLE (
    event_order BIGINT,
    event_type TEXT,
    event_name TEXT,
    event_timestamp TIMESTAMPTZ,
    event_properties JSONB,
    ai_session JSONB,
    feedback_data JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH events AS (
        SELECT
            ROW_NUMBER() OVER (ORDER BY timestamp) AS event_order,
            'tracking' AS event_type,
            name AS event_name,
            timestamp,
            properties,
            NULL::JSONB AS ai_session,
            NULL::JSONB AS feedback_data
        FROM tracking_events
        WHERE trace_id = p_trace_id
    ),
    ai AS (
        SELECT
            ROW_NUMBER() OVER () AS rn,
            'ai_session' AS event_type,
            'ai_generation' AS event_name,
            created_at AS timestamp,
            jsonb_build_object(
                'input_mode', input_mode,
                'persona', persona,
                'gift_item', gift_item,
                'response_time_ms', response_time_ms,
                'status', status
            ) AS properties,
            to_jsonb(ai_sessions) AS ai_session,
            NULL::JSONB AS feedback_data
        FROM ai_sessions
        WHERE trace_id = p_trace_id
    ),
    fb AS (
        SELECT
            ROW_NUMBER() OVER () AS rn,
            'feedback' AS event_type,
            'user_feedback' AS event_name,
            created_at AS timestamp,
            jsonb_build_object(
                'feedback_type', feedback_type,
                'feedback_score', feedback_score,
                'feedback_reason', feedback_reason
            ) AS properties,
            NULL::JSONB AS ai_session,
            to_jsonb(user_feedback) AS feedback_data
        FROM user_feedback
        WHERE trace_id = p_trace_id
    ),
    combined AS (
        SELECT * FROM events
        UNION ALL
        SELECT
            1000 + rn,
            event_type,
            event_name,
            timestamp,
            properties,
            ai_session,
            feedback_data
        FROM ai
        UNION ALL
        SELECT
            2000 + rn,
            event_type,
            event_name,
            timestamp,
            properties,
            ai_session,
            feedback_data
        FROM fb
    )
    SELECT
        ROW_NUMBER() OVER (ORDER BY timestamp) AS event_order,
        event_type,
        event_name,
        timestamp,
        properties,
        ai_session,
        feedback_data
    FROM combined
    ORDER BY timestamp;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. 分析函数：会话转化漏斗
-- ============================================

CREATE OR REPLACE FUNCTION get_trace_funnel(p_days INTEGER = 7)
RETURNS TABLE (
    step_number INT,
    step_name TEXT,
    event_count BIGINT,
    unique_traces BIGINT,
    conversion_rate DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH trace_starts AS (
        SELECT DISTINCT trace_id
        FROM ai_sessions
        WHERE created_at >= NOW() - INTERVAL '1 day' * p_days
    ),
    step_counts AS (
        SELECT 1 AS step, '开始生成' AS name, COUNT(*) AS cnt FROM trace_starts
        UNION ALL
        SELECT 2 AS step, 'AI 生成完成' AS name, COUNT(*) AS cnt
        FROM ai_sessions
        WHERE status = 'completed'
          AND created_at >= NOW() - INTERVAL '1 day' * p_days
          AND trace_id IN (SELECT trace_id FROM trace_starts)
        UNION ALL
        SELECT 3 AS step, '用户反馈' AS name, COUNT(*) AS cnt
        FROM user_feedback
        WHERE created_at >= NOW() - INTERVAL '1 day' * p_days
          AND trace_id IN (SELECT trace_id FROM trace_starts)
    )
    SELECT
        step,
        name AS step_name,
        cnt AS event_count,
        cnt AS unique_traces,
        ROUND(
            cnt::DECIMAL / (SELECT COUNT(*) FROM trace_starts) * 100,
            2
        ) AS conversion_rate
    FROM step_counts
    ORDER BY step;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. 反馈质量分析
-- ============================================

CREATE OR REPLACE FUNCTION get_feedback_quality(p_days INTEGER = 7)
RETURNS TABLE (
    date DATE,
    total_traces BIGINT,
    completed_count BIGINT,
    feedback_count BIGINT,
    like_count BIGINT,
    dislike_count BIGINT,
    completion_rate DECIMAL(5,2),
    like_rate DECIMAL(5,2),
    feedback_rate DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH daily AS (
        SELECT
            DATE(ai.created_at) AS date,
            ai.trace_id,
            ai.status,
            fb.feedback_type
        FROM ai_sessions ai
        LEFT JOIN user_feedback fb ON fb.trace_id = ai.trace_id
        WHERE ai.created_at >= NOW() - INTERVAL '1 day' * p_days
    )
    SELECT
        date,
        COUNT(DISTINCT trace_id) AS total_traces,
        COUNT(*) FILTER (WHERE status = 'completed') AS completed_count,
        COUNT(*) FILTER (WHERE feedback_type IS NOT NULL) AS feedback_count,
        COUNT(*) FILTER (WHERE feedback_type = 'like') AS like_count,
        COUNT(*) FILTER (WHERE feedback_type = 'dislike') AS dislike_count,
        ROUND(
            COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL
            / NULLIF(COUNT(DISTINCT trace_id), 0) * 100,
            2
        ) AS completion_rate,
        ROUND(
            COUNT(*) FILTER (WHERE feedback_type = 'like')::DECIMAL
            / NULLIF(COUNT(*) FILTER (WHERE feedback_type IS NOT NULL), 0) * 100,
            2
        ) AS like_rate,
        ROUND(
            COUNT(*) FILTER (WHERE feedback_type IS NOT NULL)::DECIMAL
            / NULLIF(COUNT(DISTINCT trace_id), 0) * 100,
            2
        ) AS feedback_rate
    FROM daily
    GROUP BY date
    ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. RLS 安全策略（可选）
-- ============================================

-- ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ai_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- 仅管理员可以访问
-- CREATE POLICY "Admin access" ON tracking_events FOR ALL USING (true);
-- CREATE POLICY "Admin access" ON ai_sessions FOR ALL USING (true);
-- CREATE POLICY "Admin access" ON user_feedback FOR ALL USING (true);
