// ============================================
// 类型定义统一导出 - GiftGhost
// ============================================

// 从 insight.ts 导出
export type { GiftRecommendation, InsightResult } from './insight';

// ============================================
// 场景类型定义
// ============================================

/**
 * 应用场景流转类型
 * - INTRO: 欢迎页面
 * - INPUT: 用户输入页面
 * - THINKING: AI 思考页面
 * - REVEAL: 结果展示页面
 */
export type Scene = 'INTRO' | 'INPUT' | 'THINKING' | 'REVEAL';

// ============================================
// 输入相关类型
// ============================================

/**
 * 输入模式类型
 * - LISTENER: 倾听模式（Memory Lane 描述式）
 * - INTERVIEW: 访谈模式（快问快答对话式）
 */
export type InputMode = 'LISTENER' | 'INTERVIEW';

/**
 * 用户输入数据
 */
export interface InputData {
  /** 输入模式 */
  mode: InputMode;
  /** 输入内容 */
  content: string;
}

// ============================================
// 通用 UI 组件类型
// ============================================

/**
 * 按钮尺寸
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * 按钮变体
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

/**
 * 卡片变体
 */
export type CardVariant = 'default' | 'elevated' | 'outlined';
