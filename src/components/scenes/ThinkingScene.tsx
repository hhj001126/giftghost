'use client';
import { useState, useEffect } from 'react';
import { SceneWrapper, Badge } from '@/components/ui';
import { useI18n } from '@/i18n';
import { ThinkingGiftBox, Encouragement, ProgressSteps, ProgressBar, FunFactCard } from '@/components/business/thinking';
import styles from './ThinkingScene.module.scss';

type ThinkingStage = 'analyzing' | 'digging' | 'matching' | 'generating' | 'finalizing';

export function ThinkingScene() {
    const { t } = useI18n();
    const [currentStage, setCurrentStage] = useState<ThinkingStage>('analyzing');
    const [stepProgress, setStepProgress] = useState(0); // 当前步骤内的进度 0-100

    const stages = t.thinking.stages;
    const stageKeys = Object.keys(stages) as ThinkingStage[];
    const currentIndex = stageKeys.indexOf(currentStage);

    useEffect(() => {
        // 重置步骤内进度
        setStepProgress(0);

        // 步骤内的小进度条动画 - 每100ms增加5%，2秒完成
        const stepInterval = setInterval(() => {
            setStepProgress((prev) => {
                if (prev >= 100) return 100;
                return prev + 5;
            });
        }, 100);

        // 阶段切换 - 每个阶段持续2秒
        if (currentIndex < stageKeys.length - 1) {
            const timeout = setTimeout(() => {
                setCurrentStage(stageKeys[currentIndex + 1] as ThinkingStage);
            }, 2000);
            return () => {
                clearInterval(stepInterval);
                clearTimeout(timeout);
            };
        }

        return () => clearInterval(stepInterval);
    }, [currentStage, currentIndex]);

    // 计算总体进度: 已完成步骤 * 20% + 当前步骤内进度 * 20%
    // 例如: analyzing完成时=20%, digging完成时=40%...
    const totalProgress = (currentIndex * 20) + (stepProgress * 0.2);

    return (
        <SceneWrapper variant="fade" className={styles.scene}>
            {/* Gift Animation */}
            <div className={styles.animationContainer}>
                <ThinkingGiftBox />
            </div>

            {/* Badge */}
            <div className={styles.badgeWrapper}>
                <Badge variant="primary" pulse>
                    {t.thinking.badge}
                </Badge>
            </div>

            {/* Progress Steps */}
            <ProgressSteps currentStage={currentStage} />

            {/* Progress Bar */}
            <ProgressBar progress={Math.min(totalProgress, 98)} />

            {/* Fun Facts Card */}
            <FunFactCard />

            {/* Encouragement */}
            <Encouragement />
        </SceneWrapper>
    );
}

export default ThinkingScene;
