'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { generateTraceId, setTraceCookies, clearTraceCookie, getCookie } from './trace-utils';

/**
 * Trace Context
 *
 * 全局追踪上下文，管理当前会话的 trace_id
 * 使用方式类似于 i18n Context
 */

interface TraceContextValue {
  traceId: string | null;
  isNewTrace: boolean;
  startNewTrace: () => void;
  clearTrace: () => void;
}

const TraceContext = createContext<TraceContextValue | null>(null);

/**
 * 使用 Trace Context
 */
export function useTrace(): TraceContextValue {
  const context = useContext(TraceContext);
  if (!context) {
    throw new Error('useTrace must be used within a TraceProvider');
  }
  return context;
}

/**
 * Trace Provider Props
 */
interface TraceProviderProps {
  children: React.ReactNode;
  autoCreate?: boolean;
}

/**
 * Trace Provider
 */
export function TraceProvider({ children, autoCreate = true }: TraceProviderProps) {
  const [traceId, setTraceId] = useState<string | null>(null);
  const [isNewTrace, setIsNewTrace] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (!autoCreate) return;

    // 尝试从 cookie 读取
    const existingTraceId = getCookie('gg_trace_id');

    if (existingTraceId) {
      setTraceId(existingTraceId);
      setIsNewTrace(false);
    } else {
      // 创建新的 traceId
      const newTraceId = generateTraceId();
      setTraceId(newTraceId);
      setIsNewTrace(true);
      setTraceCookies(newTraceId);
    }
  }, [autoCreate]);

  const startNewTrace = useCallback(() => {
    const newTraceId = generateTraceId();
    setTraceId(newTraceId);
    setIsNewTrace(true);
    setTraceCookies(newTraceId);
    console.log('📍 New trace started:', newTraceId);
  }, []);

  const clearTrace = useCallback(() => {
    setTraceId(null);
    setIsNewTrace(false);
    clearTraceCookie();
  }, []);

  return (
    <TraceContext.Provider
      value={{
        traceId,
        isNewTrace,
        startNewTrace,
        clearTrace,
      }}
    >
      {children}
    </TraceContext.Provider>
  );
}

/**
 * 便捷 Hooks
 */
export function useTraceId(): string | null {
  const { traceId } = useTrace();
  return traceId;
}

export function useIsNewTrace(): boolean {
  const { isNewTrace } = useTrace();
  return isNewTrace;
}

export function useStartNewTrace(): () => void {
  const { startNewTrace } = useTrace();
  return startNewTrace;
}
