# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GiftGhost is an AI-powered gift recommendation web app built with Next.js 16 App Router. The app guides users through an interactive flow (Intro → Input → Thinking → Reveal) to generate personalized gift suggestions based on social links, chat logs, or quick interviews.

## Common Commands

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

## Architecture

### Core Flow: Stage/Scene System

`src/components/stage/Stage.tsx` is the central orchestrator managing a scene state machine:

```typescript
type Scene = 'INTRO' | 'INPUT' | 'THINKING' | 'REVEAL';
```

Each scene is a separate component in `src/components/scenes/`. Transitions use `AnimatePresence` with Framer Motion for smooth animations.

### Server Actions

Main logic is in `src/app/actions.ts` - the `generateInsight()` server action:

1. **Rate limiting** (`src/lib/rate-limit.ts`) - Checks IP/anonymousId limits
2. **Tracking** (`src/tracker/server.ts`) - `startAISession()` creates trace_id
3. **AI** - Calls OpenAI GPT-4o with mode-specific prompts
4. **Tracking** - `completeAISession()` saves results

Three input modes: `DETECTIVE` (links), `LISTENER` (text), `INTERVIEW` (3 questions)

### Tracking System

Three-tier architecture:

| Layer | Files | Purpose |
|-------|-------|---------|
| Client | `tracker/index.ts`, `useAutoTrack.ts` | Batch events, send to `/api/track` |
| Server | `tracker/server.ts` | Server Action tracking |
| API | `app/api/track/route.ts` | Persist to Supabase `tracking_events` |

`TraceContext` (`tracker/TraceContext.tsx`) manages `trace_id` via cookies, linking all events in a session.

### i18n System

`src/i18n/I18nProvider.tsx` provides locale context. Three languages: `en`, `zh-CN`, `zh-HK`.

```typescript
const { t, locale } = useI18n();
t.stage.error.title  // Access translations
```

Translations in `src/i18n/locales/*.ts`. Error messages follow `t.stage.error.*` pattern.

### 多语言规则（强制要求）

**⚠️ 重要：所有用户可见的文本内容必须使用多语言系统，禁止硬编码任何文本。**

#### 强制规则

1. **禁止硬编码文本**
   - ❌ 错误：`<button>Submit</button>`
   - ✅ 正确：`<button>{t.input.submit}</button>`

2. **所有组件必须使用 `useI18n()`**
   - 所有业务组件和场景组件必须通过 `useI18n()` hook 获取翻译
   - 禁止通过 props 传递翻译字符串（避免 prop drilling）
   - 禁止在组件内部直接使用字符串字面量

3. **翻译文件必须同步更新**
   - 添加新功能时，必须同时更新三个语言文件：
     - `src/i18n/locales/en.ts`
     - `src/i18n/locales/zh-CN.ts`
     - `src/i18n/locales/zh-HK.ts`
   - 三个文件中的翻译 key 结构必须完全一致

4. **翻译 key 命名规范**
   - 遵循层级结构：`t.scene.component.key`
   - 示例：`t.input.modes.listener.label`
   - 错误消息：`t.stage.error.*`
   - 保持 key 名称语义清晰，便于维护

5. **特殊情况的处理**
   - **占位符文本**：必须使用翻译，如 `placeholder={t.input.placeholder}`
   - **错误消息**：必须使用翻译，如 `t.stage.error.rateLimit`
   - **按钮文本**：必须使用翻译，如 `{t.input.submit}`
   - **提示文本**：必须使用翻译，如 `{t.input.hint}`
   - **仅技术标识符**：如 `id`, `data-testid`, `className` 等可以保持英文

6. **代码审查检查点**
   - 检查所有新增组件是否使用 `useI18n()`
   - 检查是否存在硬编码的中文、英文或其他语言文本
   - 检查三个语言文件是否同步更新
   - 检查翻译 key 是否遵循命名规范

#### 示例

```typescript
// ✅ 正确示例
'use client';
import { useI18n } from '@/i18n';

export function SubmitButton() {
  const { t } = useI18n();
  return <button>{t.input.submit}</button>;
}

// ❌ 错误示例
export function SubmitButton() {
  return <button>提交</button>; // 硬编码文本
}

// ❌ 错误示例
export function SubmitButton({ label }: { label: string }) {
  return <button>{label}</button>; // 通过 props 传递文本
}
```

#### 翻译文件结构示例

```typescript
// src/i18n/locales/en.ts
export const en = {
  input: {
    submit: 'Submit',
    placeholder: 'Enter text...',
    // ...
  },
  stage: {
    error: {
      rateLimit: 'Too many requests',
      // ...
    },
  },
};

// src/i18n/locales/zh-CN.ts
export const zhCN = {
  input: {
    submit: '提交',
    placeholder: '请输入文本...',
    // ...
  },
  stage: {
    error: {
      rateLimit: '请求过于频繁',
      // ...
    },
  },
};

// src/i18n/locales/zh-HK.ts
export const zhHK = {
  input: {
    submit: '提交',
    placeholder: '請輸入文字...',
    // ...
  },
  stage: {
    error: {
      rateLimit: '請求過於頻繁',
      // ...
    },
  },
};
```

### Data Flow

```
User Input → Stage.tsx calls generateInsight() [Server Action]
    ↓
actions.ts: rate limit → startAISession() → OpenAI → completeAISession()
    ↓
Returns { persona, pain_point, obsession, gift_recommendation }
    ↓
Stage.tsx: THINKING → REVEAL
    ↓
RevealScene displays results
```

## Key Patterns

### Adding a New Error Type
1. Add translation to `src/i18n/locales/en.ts`, `zh-CN.ts`, `zh-HK.ts` under `stage.error`
2. Return `{ success: false, message: 'errorKey' }` from server actions
3. Handle in `Stage.tsx`: `if (response.message === 'errorKey') showTranslatedMessage()`

### Adding Tracking Events
1. Client: `import { track } from '@/tracker'; track('event_name', { ...properties })`
2. Server: Import from `@/tracker/server` and call tracking functions

### Database Schema
Tables in Supabase: `tracking_events`, `ai_sessions`, `user_feedback`, `rate_limits`. Schema files in `supabase/*.sql`.

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`
- `MOCK_MODE=true` (for testing without AI)

## Component Architecture

### Component Organization

项目采用三层组件架构：

1. **UI 组件层** (`src/components/ui/`) - 通用基础组件
   - `Button`, `Card`, `Badge`, `SceneWrapper` 等
   - 可复用的、无业务逻辑的纯展示组件

2. **业务组件层** (`src/components/business/`) - 场景相关的业务组件
   - 按场景分类：`intro/`, `input/`, `thinking/`, `reveal/`
   - 每个业务组件独立目录，包含 `ComponentName.tsx`, `ComponentName.module.scss`, `index.ts`
   - 封装特定业务逻辑和 UI 展示

3. **场景组件层** (`src/components/scenes/`) - 页面级场景组件
   - `IntroScene`, `InputScene`, `ThinkingScene`, `RevealScene`
   - 负责场景状态管理和业务组件组合

### 组件化规范

#### 1. 业务组件提取原则

**何时提取为业务组件：**
- 组件在场景中承担独立功能职责
- 组件有明确的输入输出接口
- 组件可能被复用或需要独立测试
- 组件代码超过 50 行或包含复杂逻辑

**业务组件目录结构：**
```
src/components/business/
├── intro/              # Intro 场景业务组件
│   ├── GiftBox/
│   ├── SparkleParticles/
│   └── AvatarGroup/
├── input/              # Input 场景业务组件
│   ├── ModeSelector/
│   ├── InputCard/
│   ├── URLFetchStatus/
│   ├── InterviewInput/
│   └── StandardInput/
├── thinking/           # Thinking 场景业务组件
│   ├── ThinkingGiftBox/
│   ├── Encouragement/
│   ├── ProgressSteps/
│   ├── ProgressBar/
│   └── FunFactCard/
└── reveal/            # Reveal 场景业务组件
    ├── CelebrationConfetti/
    ├── FeedbackButtons/
    ├── InsightCard/
    ├── GiftHeroCard/
    ├── ActionButtons/
    └── FooterCelebration/
```

#### 2. 组件文件规范

每个业务组件应包含：
- `ComponentName.tsx` - 组件实现
- `ComponentName.module.scss` - 样式文件（使用 SCSS Modules）
- `index.ts` - 导出文件

**示例：**
```typescript
// src/components/business/intro/GiftBox/GiftBox.tsx
'use client';
import { motion } from 'framer-motion';
import styles from './GiftBox.module.scss';

export function GiftBox() {
    // 组件实现
}

// src/components/business/intro/GiftBox/index.ts
export { GiftBox } from './GiftBox';
```

#### 3. 组件接口设计

**Props 设计原则：**
- 使用明确的 TypeScript 接口定义
- Props 命名清晰，避免缩写
- 可选 Props 使用 `?` 标记，并提供默认值
- 回调函数使用 `on` 前缀（如 `onChange`, `onSubmit`）

**示例：**
```typescript
interface InputCardProps {
    mode: InputMode;
    standardValue?: string;
    standardFocused?: boolean;
    onStandardValueChange?: (value: string) => void;
    // ...
}
```

#### 4. 场景组件职责

场景组件 (`Scene`) 应：
- 管理场景级别的状态（如 `mode`, `inputVal`）
- 处理场景级别的业务逻辑（如 `handleSubmit`, `handleUrlSubmit`）
- 组合业务组件，传递必要的 props
- 保持代码简洁，复杂逻辑委托给业务组件

**示例：**
```typescript
export function InputScene({ onNext }: InputSceneProps) {
    const [mode, setMode] = useState<InputMode>('DETECTIVE');
    // ... 状态管理

    return (
        <SceneWrapper>
            <ModeSelector selectedMode={mode} onModeChange={handleModeChange} />
            <InputCard mode={mode} {...inputCardProps} />
        </SceneWrapper>
    );
}
```

#### 5. 样式管理

- 使用 SCSS Modules 避免样式冲突
- 样式文件与组件文件同名
- 使用设计令牌 (`_design-tokens.scss`) 保持一致性
- 响应式设计使用媒体查询

#### 6. 国际化

- 业务组件内部使用 `useI18n()` hook 获取翻译
- 不通过 props 传递翻译函数（避免 prop drilling）
- 翻译 key 遵循 `t.scene.component.key` 结构

#### 7. 导出规范

- 每个业务组件目录提供 `index.ts` 导出
- 场景目录提供统一的 `index.ts` 导出所有组件
- 使用命名导出而非默认导出

**示例：**
```typescript
// src/components/business/intro/index.ts
export { GiftBox } from './GiftBox';
export { SparkleParticles } from './SparkleParticles';
export { AvatarGroup } from './AvatarGroup';

// src/components/business/index.ts
export * from './intro';
export * from './input';
export * from './thinking';
export * from './reveal';
```

### 组件化优势

1. **可维护性** - 组件职责清晰，易于定位和修改
2. **可复用性** - 业务组件可在不同场景复用
3. **可测试性** - 独立组件便于单元测试
4. **可扩展性** - 新增功能只需添加新组件
5. **代码组织** - 清晰的目录结构便于团队协作
