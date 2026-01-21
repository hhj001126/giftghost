// ============================================
// 礼物查找器功能模块导出
// ============================================

// 主控制器
export { Stage } from './Stage';

// 场景组件
export { IntroScene } from './scenes/IntroScene';
export { InputScene } from './scenes/InputScene';
export { ThinkingScene } from './scenes/ThinkingScene';
export { RevealScene } from './scenes/RevealScene';

// Intro 相关组件
export { GiftBox, AvatarGroup, SparkleParticles } from './intro';

// Input 相关组件
export {
    ModeSelector,
    InputCard,
    ProfileQuickInput,
    InterviewInput,
    MemoryLaneInput
} from './input';

// Thinking 相关组件
export {
    ThinkingGiftBox,
    Encouragement,
    ProgressSteps,
    ProgressBar,
    FunFactCard
} from './thinking';

// Reveal 相关组件
export {
    CelebrationConfetti,
    FeedbackButtons,
    InsightCard,
    GiftHeroCard,
    ActionButtons,
    FooterCelebration
} from './reveal';
