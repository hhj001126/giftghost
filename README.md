# GiftGhost 🎁✨

> 让送礼变得轻松、有趣、无压力的 AI 礼物推荐助手

GiftGhost 是一个基于 AI 的智能礼物推荐平台，通过分析用户输入的信息，为您推荐最合适的礼物。无论是生日、节日还是特殊场合，GiftGhost 都能帮您找到完美的礼物。

## ✨ 特性

- 🤖 **AI 驱动**: 使用 GPT-4 分析用户特征，生成个性化推荐
- 🎨 **Playful Warmth 设计**: 俏皮温暖的视觉风格，让送礼变得有趣
- 🌍 **多语言支持**: 支持英文、简体中文、繁体中文（香港）
- 📱 **移动优先**: 完美适配手机、平板、桌面等各种设备
- ⚡ **现代技术栈**: Next.js 15 + React 19 + TypeScript + SCSS

## 🚀 快速开始

### 环境要求

- Node.js 18.17 或更高版本
- npm、yarn、pnpm 或 bun 包管理器

### 安装

```bash
# 克隆项目
git clone https://github.com/your-username/giftghost.git
cd giftghost

# 安装依赖
npm install
```

### 配置环境变量

在项目根目录创建 `.env.local` 文件：

```env
# OpenAI API
OPENAI_API_KEY=your_openai_api_key_here

# Supabase（可选，用于数据存储和追踪）
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Firecrawl（可选，用于抓取产品信息）
FIRECRAWL_API_KEY=your_firecrawl_api_key
```

### 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3030](http://localhost:3030) 查看应用。

### 构建生产版本

```bash
npm run build
npm start
```

## 📁 项目结构

```
giftghost/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # 根布局（字体加载）
│   │   ├── page.tsx              # 首页入口
│   │   ├── globals.css           # 全局样式
│   │   ├── _design-tokens.scss  # 设计系统变量
│   │   ├── actions.ts            # Server Actions
│   │   └── api/                  # API 路由
│   ├── components/
│   │   ├── features/             # 功能模块组件
│   │   │   └── gift-finder/      # 礼物查找功能
│   │   │       ├── Stage/        # 主控制器
│   │   │       ├── scenes/       # 场景组件（Intro、Input、Thinking、Reveal）
│   │   │       ├── intro/        # Intro 相关组件
│   │   │       ├── input/        # Input 相关组件
│   │   │       ├── thinking/     # Thinking 相关组件
│   │   │       └── reveal/       # Reveal 相关组件
│   │   ├── ui/                   # 通用 UI 组件
│   │   │   ├── Button/
│   │   │   ├── Card/
│   │   │   ├── Badge/
│   │   │   ├── Background/       # 背景效果组件
│   │   │   ├── SceneWrapper/
│   │   │   └── LanguageSwitcher/
│   │   └── shared/               # 共享业务组件
│   │       └── GhostCard/
│   ├── i18n/                     # 国际化
│   │   ├── I18nProvider.tsx
│   │   └── locales/
│   │       ├── en.ts
│   │       ├── zh-CN.ts
│   │       └── zh-HK.ts
│   ├── lib/                      # 工具函数和服务
│   │   ├── utils.ts
│   │   ├── api.ts
│   │   ├── supabase/
│   │   └── ...
│   ├── tracker/                  # 埋点追踪
│   └── types/                    # TypeScript 类型定义
│       ├── index.ts              # 统一类型导出
│       └── insight.ts
├── docs/                         # 项目文档
│   ├── DESIGN_DOC.md             # 设计文档
│   ├── i18n-coding-standards.md # i18n 编码规范
│   └── ...
├── .cursor/                      # Cursor 规则
│   └── rules/
│       ├── frontend-development-design.mdc
│       ├── global.mdc
│       └── software-development-principles.mdc
└── public/                       # 静态资源
```

## 🎨 设计系统

GiftGhost 遵循 **Playful Warmth（俏皮的温暖）** 设计哲学，主要特点：

### 设计原则
1. **Joy First** - 快乐优先，每个交互都带来微笑
2. **Soft & Friendly** - 柔和友好，圆润的边角和颜色
3. **Effortless** - 毫不费力，直觉式交互
4. **Celebratory** - 庆祝感，值得纪念的时刻
5. **No Pressure** - 无压力，轻松随意的体验

### 色彩系统
- **主色 Coral（珊瑚红）**: `#FF7F6E` - 主要操作、CTA 按钮
- **辅助色 Mint（薄荷绿）**: `#96DEC3` - 成功状态、正向反馈
- **点缀色 Lavender**: `#C3AFFF` - 次级强调
- **点缀色 Sunshine**: `#FFC878` - 高光、闪烁效果

详细设计规范请查看：[`docs/DESIGN_DOC.md`](./docs/DESIGN_DOC.md)

## 🌍 国际化

GiftGhost 支持三种语言：
- 🇺🇸 English (`en`)
- 🇨🇳 简体中文 (`zh-CN`)
- 🇭🇰 繁体中文（香港）(`zh-HK`)

### 使用国际化

```typescript
import { useI18n } from '@/i18n';

function MyComponent() {
  const { t, locale, setLocale } = useI18n();
  
  return (
    <div>
      <h1>{t.intro.title}</h1>
      <button onClick={() => setLocale('en')}>
        English
      </button>
    </div>
  );
}
```

**重要规范**：
- ✅ 每个组件内部使用 `useI18n()` hook
- ❌ 不要通过 props 传递 `t` 对象

详细规范请查看：[`docs/i18n-coding-standards.md`](./docs/i18n-coding-standards.md)

## 🛠️ 技术栈

### 前端
- **框架**: Next.js 15 (App Router)
- **UI 库**: React 19
- **语言**: TypeScript 5
- **样式**: SCSS Modules
- **动画**: Framer Motion
- **图标**: Lucide React

### 后端
- **AI**: OpenAI GPT-4
- **数据库**: Supabase (PostgreSQL)
- **爬虫**: Firecrawl
- **认证**: Supabase Auth（计划中）

## 📝 开发规范

### 代码原则
- **DRY** - 不要重复自己
- **KISS** - 保持简单
- **SOLID** - 面向对象设计原则
- **YAGNI** - 你不会需要它（不过度设计）

### 组件开发
1. **UI 组件**：纯展示，无业务逻辑，高度可复用
2. **Feature 组件**：功能模块，包含完整业务逻辑
3. **Shared 组件**：跨功能使用的业务组件

### 样式规范
- 使用 SCSS Modules（`.module.scss`）
- 使用设计系统的 CSS 变量（`var(--color-coral)`）
- 移动优先的响应式设计
- 最多 3 层嵌套

详细规范请查看：
- [`.cursor/rules/frontend-development-design.mdc`](.cursor/rules/frontend-development-design.mdc)
- [`.cursor/rules/software-development-principles.mdc`](.cursor/rules/software-development-principles.mdc)

## 📊 追踪与分析

GiftGhost 内置了埋点追踪系统，用于分析用户行为和优化体验：

- **页面浏览追踪**: 自动追踪页面访问
- **场景流转追踪**: 追踪用户在不同场景之间的流转
- **用户反馈追踪**: 追踪用户对推荐结果的反馈

详细信息请查看：[`docs/tracking-queries.md`](./docs/tracking-queries.md)

## 🧪 测试

```bash
# 运行单元测试
npm run test:actions

# 运行 URL 测试
npm run test:url

# 诊断测试
npm run test:diagnose
```

## 📦 部署

### Vercel 部署（推荐）

1. 推送代码到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署

### 自托管

```bash
# 构建
npm run build

# 启动生产服务器
npm start
```

## 🤝 贡献

欢迎贡献！请遵循以下步骤：

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

请确保：
- 遵循项目代码规范
- 添加适当的测试
- 更新相关文档

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 📮 联系方式

- **项目主页**: [https://github.com/your-username/giftghost](https://github.com/your-username/giftghost)
- **问题反馈**: [GitHub Issues](https://github.com/your-username/giftghost/issues)

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [OpenAI](https://openai.com/) - AI 能力
- [Supabase](https://supabase.com/) - 后端服务
- [Framer Motion](https://www.framer.com/motion/) - 动画库
- [Lucide](https://lucide.dev/) - 图标库

---

用 ❤️ 和 ✨ 制作 | © 2026 GiftGhost
