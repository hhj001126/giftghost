'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getTracker } from './index';

// ============ 类型定义 ============

export interface AutoTrackOptions {
  excludePaths?: string[];
  additionalProperties?: Record<string, any>;
  enabled?: boolean;
}

export interface ExposureOptions {
  threshold?: number;
  duration?: number;
  once?: boolean;
  properties?: Record<string, any>;
}

// ============ 工具函数 ============

/**
 * 获取设备类型
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';

  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

/**
 * 检查路径是否应该被排除
 */
function shouldExcludePath(path: string, excludePaths?: string[]): boolean {
  if (!excludePaths || excludePaths.length === 0) return false;
  return excludePaths.some((p) => path.startsWith(p));
}

// ============ 自动追踪页面浏览 ============

/**
 * 自动追踪页面浏览
 *
 * 使用方式:
 * ```tsx
 * 'use client';
 * import { useAutoTrack } from '@/tracker';
 *
 * export default function Page() {
 *   useAutoTrack();
 *   return <div>Page content</div>;
 * }
 * ```
 */
export function useAutoTrack(options: AutoTrackOptions = {}): void {
  const {
    excludePaths,
    additionalProperties,
    enabled = true,
  } = options;

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previousPath = useRef<string | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const currentPath =
      pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

    // 首次渲染跳过
    if (isFirstRender.current) {
      isFirstRender.current = false;
      previousPath.current = currentPath;
      return;
    }

    // 跳过相同路径
    if (previousPath.current === currentPath) {
      return;
    }

    // 检查排除路径
    if (shouldExcludePath(currentPath, excludePaths)) {
      return;
    }

    const tracker = getTracker();
    tracker.track('page_view', {
      from: previousPath.current,
      to: currentPath,
      referrer: document.referrer,
      title: document.title,
      device_type: getDeviceType(),
      ...additionalProperties,
    });

    previousPath.current = currentPath;
  }, [pathname, searchParams, excludePaths, additionalProperties, enabled]);
}

// ============ 场景流转追踪 ============

/**
 * 自动追踪 React 组件/场景的可见性变化
 *
 * 使用方式:
 * ```tsx
 * const currentScene = 'INPUT';
 * useTrackVisibility('scene_input', currentScene === 'INPUT');
 * ```
 */
export function useTrackVisibility(
  name: string,
  isVisible: boolean,
  options?: {
    once?: boolean;
    properties?: Record<string, any>;
  }
): void {
  const hasTracked = useRef(false);
  const enterTime = useRef<number | null>(null);

  useEffect(() => {
    if (!isVisible) {
      hasTracked.current = false;
      enterTime.current = null;
      return;
    }

    if (options?.once && hasTracked.current) return;

    const tracker = getTracker();
    tracker.track(`${name}_visible`, {
      ...options?.properties,
    });

    hasTracked.current = true;
    enterTime.current = Date.now();
  }, [name, isVisible, options?.once, options?.properties]);
}

/**
 * 追踪场景流转（用于 Stage 组件）
 *
 * 使用方式:
 * ```tsx
 * const [scene, setScene] = useState('INTRO');
 * useTrackSceneTransition('stage', scene);
 * ```
 */
export function useTrackSceneTransition(
  context: string,
  currentScene: string,
  options?: {
    properties?: Record<string, any>;
  }
): void {
  const previousScene = useRef<string | null>(null);
  const enterTime = useRef<number>(Date.now());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (previousScene.current && previousScene.current !== currentScene) {
      const duration = Date.now() - enterTime.current;

      const tracker = getTracker();
      tracker.track('scene_transition', {
        context,
        from: previousScene.current,
        to: currentScene,
        duration_ms: duration,
        ...options?.properties,
      });
    }

    previousScene.current = currentScene;
    enterTime.current = Date.now();
  }, [context, currentScene, options?.properties]);
}

// ============ 曝光追踪 ============

/**
 * 追踪元素曝光
 *
 * 使用方式:
 * ```tsx
 * const ref = useTrackExposure('gift_card', { threshold: 0.5, duration: 1000 });
 * return <div ref={ref}>Gift Card</div>;
 * ```
 */
export function useTrackExposure(
  name: string,
  options: ExposureOptions = {}
): (node: HTMLElement | null) => void {
  const {
    threshold = 0.5,
    duration = 1000,
    once = true,
    properties,
  } = options;

  const hasTracked = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const elementRef = useCallback((node: HTMLElement | null) => {
    if (!node) {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            hasTracked.current = false;
            if (timerRef.current) {
              clearTimeout(timerRef.current);
              timerRef.current = null;
            }
            return;
          }

          // 延迟触发，确保用户停留了一定时间
          timerRef.current = setTimeout(() => {
            if (once && hasTracked.current) return;

            const tracker = getTracker();
            tracker.track(`${name}_exposure`, {
              visible_ratio: Math.round(entry.intersectionRatio * 100) / 100,
              duration_ms: duration,
              viewport_width: window.innerWidth,
              viewport_height: window.innerHeight,
              ...properties,
            });

            hasTracked.current = true;
          }, duration);
        });
      },
      {
        threshold,
        rootMargin: '0px',
      }
    );

    observer.observe(node);
    observerRef.current = observer;
  }, [name, threshold, duration, once, properties]);

  return elementRef;
}

// ============ 点击追踪 ============

/**
 * 追踪点击事件
 *
 * 使用方式:
 * ```tsx
 * const handleClick = trackClick('gift_button', { gift_id: '123' });
 * <button onClick={handleClick}>Click me</button>
 * ```
 */
export function useTrackClick<T extends HTMLElement>(
  name: string,
  options?: {
    properties?: Record<string, any>;
    preventDefault?: boolean;
  }
): (event: React.MouseEvent<T>) => void {
  return useCallback(
    (event: React.MouseEvent<T>) => {
      const tracker = getTracker();
      tracker.track(`${name}_click`, {
        target_tag: event.currentTarget.tagName.toLowerCase(),
        target_id: event.currentTarget.id || null,
        target_class: event.currentTarget.className || null,
        page_x: event.pageX,
        page_y: event.pageY,
        ...options?.properties,
      });

      if (options?.preventDefault) {
        event.preventDefault();
      }
    },
    [name, options]
  );
}

/**
 * 自动追踪所有子元素点击
 *
 * 使用方式:
 * ```tsx
 * const containerRef = useTrackChildClicks('gift_container');
 * return <div ref={containerRef}><button>1</button><button>2</button></div>;
 * ```
 */
export function useTrackChildClicks(
  containerName: string,
  options?: {
    selector?: string;
    properties?: Record<string, any>;
  }
): (node: HTMLElement | null) => void {
  const handlerRef = useRef<((event: MouseEvent) => void) | null>(null);

  return useCallback(
    (node: HTMLElement | null) => {
      if (!node) {
        if (handlerRef.current) {
          // Can't access node here since it's null, handler was set on previous node
          handlerRef.current = null;
        }
        return;
      }

      const selector = options?.selector || '[data-track]';

      const handler = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        const trackable = target.closest(selector);

        if (trackable) {
          const tracker = getTracker();
          tracker.track(`${containerName}_child_click`, {
            tag: trackable.tagName.toLowerCase(),
            text: trackable.textContent?.slice(0, 100),
            ...options?.properties,
          });
        }
      };

      node.addEventListener('click', handler);
      handlerRef.current = handler;
    },
    [containerName, options]
  );
}

// ============ 滚动追踪 ============

/**
 * 追踪滚动深度
 *
 * 使用方式:
 * ```tsx
 * useTrackScrollDepth('article_page', { checkpoints: [25, 50, 75, 100] });
 * ```
 */
export function useTrackScrollDepth(
  name: string,
  options: {
    checkpoints?: number[];
    properties?: Record<string, any>;
  } = {}
): void {
  const { checkpoints = [25, 50, 75, 100], properties } = options;
  const reachedCheckpoints = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reached = reachedCheckpoints.current;
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;

    const handleScroll = () => {
      const scrollPercent = Math.min(
        100,
        Math.round((window.scrollY / totalHeight) * 100)
      );

      checkpoints.forEach((checkpoint) => {
        if (scrollPercent >= checkpoint && !reached.has(checkpoint)) {
          reached.add(checkpoint);

          const tracker = getTracker();
          tracker.track(`${name}_scroll_depth`, {
            depth: checkpoint,
            scroll_percent: scrollPercent,
            ...properties,
          });
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // 初始化检查

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [name, checkpoints, properties]);
}

// ============ 表单追踪 ============

/**
 * 追踪表单交互
 */
export function useTrackForm(
  formName: string,
  options?: {
    trackOnChange?: boolean;
    properties?: Record<string, any>;
  }
) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const tracker = getTracker();

  const trackFieldChange = useCallback(
    (fieldName: string, value: any) => {
      setFormData((prev) => {
        const newData = { ...prev, [fieldName]: value };
        return newData;
      });

      if (options?.trackOnChange) {
        tracker.track(`${formName}_field_change`, {
          field: fieldName,
          value: typeof value === 'string' ? value.slice(0, 100) : value,
          ...options?.properties,
        });
      }
    },
    [formName, options, tracker]
  );

  const trackFormSubmit = useCallback(
    (additionalData?: Record<string, any>) => {
      tracker.track(`${formName}_submit`, {
        fields_count: Object.keys(formData).length,
        ...formData,
        ...additionalData,
        ...options?.properties,
      });
    },
    [formName, formData, options, tracker]
  );

  return { trackFieldChange, trackFormSubmit, formData };
}

// ============ 计时追踪 ============

/**
 * 追踪操作耗时
 *
 * 使用方式:
 * ```tsx
 * const timer = useTrackTimer('ai_generation');
 * // ... 执行操作
 * timer.stop({ status: 'success' });
 * ```
 */
export function useTrackTimer(
  operationName: string,
  options?: {
    properties?: Record<string, any>;
  }
): {
  start: () => void;
  stop: (additionalProperties?: Record<string, any>) => void;
} {
  const startTime = useRef<number | null>(null);
  const tracker = getTracker();

  const start = useCallback(() => {
    startTime.current = Date.now();
  }, []);

  const stop = useCallback(
    (additionalProperties?: Record<string, any>) => {
      if (startTime.current === null) return;

      const duration = Date.now() - startTime.current;
      tracker.track(`${operationName}_duration`, {
        duration_ms: duration,
        ...options?.properties,
        ...additionalProperties,
      });

      startTime.current = null;
    },
    [operationName, options, tracker]
  );

  return { start, stop };
}
