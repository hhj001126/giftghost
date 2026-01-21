'use client';
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { IntroScene } from '@/components/features/gift-finder/scenes/IntroScene';
import { InputScene } from '@/components/features/gift-finder/scenes/InputScene';
import { ThinkingScene } from '@/components/features/gift-finder/scenes/ThinkingScene';
import { RevealScene } from '@/components/features/gift-finder/scenes/RevealScene';
import { BackgroundParticles, FloatingShapes } from '@/components/ui/Background';
import { LanguageSwitcher } from '@/components/ui';
import { useI18n } from '@/i18n';
import { useAutoTrack, useTrackSceneTransition, useStartNewTrace } from '@/tracker';
import type { Scene, InsightResult, InputData } from '@/types';
import styles from './Stage.module.scss';

/**
 * Stage 组件 - 礼物查找器主控制器
 * 
 * 负责管理整个礼物查找流程的场景流转：
 * 1. INTRO - 欢迎页面
 * 2. INPUT - 用户输入
 * 3. THINKING - AI 思考
 * 4. REVEAL - 结果展示
 */
export function Stage() {
    const { t, locale } = useI18n();
    const [scene, setScene] = useState<Scene>('INTRO');
    const [result, setResult] = useState<InsightResult | null>(null);
    const [mounted, setMounted] = useState(false);
    const startNewTrace = useStartNewTrace();

    // 自动追踪页面浏览
    useAutoTrack();

    // 自动追踪场景流转
    useTrackSceneTransition('stage', scene);

    useEffect(() => {
        setMounted(true);
    }, []);

    /**
     * 重置流程，返回输入页面
     */
    const handleReset = () => {
        setResult(null);
        setScene('INPUT');
        startNewTrace(); // 重置 traceId，避免重复的 AI session
    };

    /**
     * 处理用户输入并生成洞察
     */
    const handleInsightGeneration = async (inputData: InputData) => {
        setScene('THINKING');
        const { generateInsight } = await import('@/app/actions');
        const response = await generateInsight(inputData, locale);

        if (response.success && response.persona) {
            // Success: go to thinking, then reveal
            setResult(response as InsightResult);
            // Delay reveal to show thinking animation
            setTimeout(() => {
                setScene('REVEAL');
            }, 2000);
        } else {
            // Error: show i18n error message and stay on input
            if (response.message === 'rateLimit') {
                const limit = response.limit || 5;
                alert(t.stage.error.rateLimit.title + '\n' +
                    t.stage.error.rateLimit.message.replace('${count}', String(limit)) + '\n\n' +
                    t.stage.error.rateLimit.button);
            } else {
                alert(t.stage.error.title + '\n' + (response.message || t.stage.error.message));
            }
        }
    };

    if (!mounted) return null;

    return (
        <main className={styles.stage}>
            {/* Background Effects */}
            <BackgroundParticles />
            <FloatingShapes />

            {/* Language Switcher */}
            <div className={styles.languageSwitcher}>
                <LanguageSwitcher />
            </div>

            {/* Main Content */}
            <div className={styles.mainContent}>
                <AnimatePresence mode="wait">
                    {scene === 'INTRO' && (
                        <IntroScene key="intro" onNext={() => setScene('INPUT')} />
                    )}

                    {scene === 'INPUT' && (
                        <InputScene
                            key="input"
                            onNext={handleInsightGeneration}
                        />
                    )}

                    {scene === 'THINKING' && (
                        <ThinkingScene key="thinking" />
                    )}

                    {scene === 'REVEAL' && result && (
                        <RevealScene
                            key="reveal"
                            result={result}
                            onReset={handleReset}
                        />
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}

export default Stage;
