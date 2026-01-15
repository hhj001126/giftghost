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

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleInsightGeneration = async (inputData: { mode: string; content: string }) => {
        setScene('THINKING');

        const { generateInsight } = await import('@/app/actions');
        const response = await generateInsight(inputData, locale);

        if (response.success && response.persona) {
            setResult(response as InsightResult);
            setScene('REVEAL');
        } else {
            alert(`${t.stage.error.title} ${t.stage.error.message}`);
            setScene('INPUT');
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
                            onReset={() => {
                                setResult(null);
                                setScene('INPUT');
                            }}
                        />
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}

export default Stage;
