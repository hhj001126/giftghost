'use client';
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { IntroScene } from '@/components/scenes/IntroScene';
import { InputScene } from '@/components/scenes/InputScene';
import { ThinkingScene } from '@/components/scenes/ThinkingScene';
import { RevealScene } from '@/components/scenes/RevealScene';
import { BackgroundParticles, FloatingShapes } from '@/components/background';
import { LanguageSwitcher } from '@/components/ui';
import { useI18n } from '@/i18n';
import { useAutoTrack, useTrackSceneTransition, useStartNewTrace } from '@/tracker';
import styles from './Stage.module.scss';

// Define the scenes for the application flow
type Scene = 'INTRO' | 'INPUT' | 'THINKING' | 'REVEAL';

interface InsightResult {
    persona: string;
    pain_point: string;
    obsession: string;
    gift_recommendation: {
        item: string;
        reason: string;
        buy_link: string;
        price_range?: string;
    };
}

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

    const handleReset = () => {
        setResult(null);
        setScene('INPUT');
        startNewTrace(); // 重置 traceId，避免重复的 AI session
    };

    const handleInsightGeneration = async (inputData: { mode: string; content: string }) => {
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
