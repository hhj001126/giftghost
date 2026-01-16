-- ============================================
-- Rate Limiting 表
-- ============================================

-- 删除旧表（如有必要）
DROP TABLE IF EXISTS rate_limits;

-- 创建 rate_limits 表
CREATE TABLE rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) NOT NULL UNIQUE,        -- 唯一键: "ratelimit:user:xxx" 或 "ratelimit:anon:ip:xxx:aid:xxx"
    request_count INTEGER DEFAULT 1,         -- 当日请求次数
    last_request TIMESTAMPTZ DEFAULT NOW(),  -- 最后请求时间
    date DATE DEFAULT CURRENT_DATE,          -- 记录日期
    created_at TIMESTAMPTZ DEFAULT NOW(),    -- 记录创建时间

    -- 索引
    CONSTRAINT valid_count CHECK (request_count >= 0)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON rate_limits(key);
CREATE INDEX IF NOT EXISTS idx_rate_limits_date ON rate_limits(date);

-- ============================================
-- 原子增加计数量的 RPC 函数
-- ============================================

CREATE OR REPLACE FUNCTION increment_rate_limit(
    p_key VARCHAR(100),
    p_date DATE
)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    -- 尝试更新现有记录
    UPDATE rate_limits
    SET request_count = request_count + 1,
        last_request = NOW()
    WHERE key = p_key AND date = p_date
    RETURNING request_count INTO v_count;

    -- 如果没有更新到，插入新记录
    IF v_count IS NULL THEN
        INSERT INTO rate_limits (key, request_count, date, last_request)
        VALUES (p_key, 1, p_date, NOW())
        RETURNING request_count INTO v_count;
    END IF;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 获取当前剩余次数
-- ============================================

CREATE OR REPLACE FUNCTION get_remaining_requests(
    p_key VARCHAR(100),
    p_date DATE,
    p_limit INTEGER
)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT request_count INTO v_count
    FROM rate_limits
    WHERE key = p_key AND date = p_date;

    IF v_count IS NULL THEN
        RETURN p_limit;
    END IF;

    RETURN GREATEST(0, p_limit - v_count);
END;
$$ LANGUAGE plpgsql;
