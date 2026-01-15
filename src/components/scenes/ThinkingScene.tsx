'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Brain, Sparkle, Gift, Check } from 'lucide-react';
import { SceneWrapper, Badge } from '@/components/ui';
import { useI18n } from '@/i18n';
import styles from './ThinkingScene.module.scss';

type ThinkingStage = 'analyzing' | 'digging' | 'matching' | 'generating' | 'finalizing';

// Stage icons mapping
const stageIcons: Record<ThinkingStage, React.ReactNode> = {
    analyzing: <Search size={14} />,
    digging: <Brain size={14} />,
    matching: <Sparkle size={14} />,
    generating: <Gift size={14} />,
    finalizing: <Check size={14} />,
};

// Bouncing Gift Box
function GiftBox() {
    return (
        <motion.div
            className={styles.giftContainer}
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        >
            <motion.div
                className={styles.giftBody}
                animate={{ rotate: [-4, 4, -4] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
                <Gift size={32} />
            </motion.div>
            <motion.div
                className={styles.ribbon}
                animate={{ scaleX: [1, 1.08, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
            />
            <motion.div
                className={styles.sparkleRing}
                animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
            />
        </motion.div>
    );
}

// Encouragement floating emojis
function Encouragement() {
    const encouragements = ['🎁', '💡', '🌟', '🎀'];
    return (
        <div className={styles.encouragement}>
            {encouragements.map((emoji, i) => (
                <motion.span
                    key={i}
                    className={styles.encouragementEmoji}
                    animate={{
                        y: [0, -8, 0],
                        opacity: [0.3, 0.8, 0.3],
                    }}
                    transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        delay: i * 0.4,
                    }}
                >
                    {emoji}
                </motion.span>
            ))}
        </div>
    );
}

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
                <GiftBox />
            </div>

            {/* Badge */}
            <div className={styles.badgeWrapper}>
                <Badge variant="primary" pulse>
                    {t.thinking.badge}
                </Badge>
            </div>

            {/* Progress Steps - Only show completed + current */}
            <div className={styles.progressSteps}>
                {stageKeys.map((key, index) => {
                    const isCompleted = currentIndex > index;
                    const isCurrent = currentStage === key;

                    // 只显示已完成和当前的步骤
                    if (!isCompleted && !isCurrent) return null;

                    return (
                        <motion.div
                            key={key}
                            className={`${styles.progressStep} ${isCurrent ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}
                            initial={{ opacity: 0, x: -20, height: 0 }}
                            animate={{ opacity: 1, x: 0, height: 'auto' }}
                            exit={{ opacity: 0, x: -20, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className={`${styles.stepCircle} ${isCurrent ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}>
                                {isCompleted ? (
                                    <Check size={12} />
                                ) : (
                                    <motion.span
                                        animate={{ scale: [1, 1.15, 1] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                    >
                                        {stageIcons[key]}
                                    </motion.span>
                                )}
                            </div>
                            <span className={`${styles.stepLabel} ${isCurrent ? styles.activeLabel : ''}`}>
                                {stages[key]}
                            </span>
                        </motion.div>
                    );
                })}
            </div>

            {/* Progress Bar - 跟随步骤进度 */}
            <motion.div
                className={styles.progressBarWrapper}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <div className={styles.progressBarBg}>
                    <motion.div
                        className={styles.progressBarFill}
                        initial={{ width: `${currentIndex * 20}%` }}
                        animate={{ width: `${Math.min(totalProgress, 98)}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
                <span className={styles.progressText}>{Math.round(Math.min(totalProgress, 98))}%</span>
            </motion.div>

            {/* Fun Facts Card */}
            <motion.div
                className={styles.funFactCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
            >
                <div className={styles.funFactHeader}>
                    <span>💡</span>
                    <span>{t.thinking.funFact.header}</span>
                </div>
                <p className={styles.funFactContent}>
                    {t.thinking.funFact.content}
                    <span className={styles.highlight}>{t.thinking.funFact.highlight}</span>
                    {t.thinking.funFact.suffix}
                </p>
            </motion.div>

            {/* Encouragement */}
            <Encouragement />
        </SceneWrapper>
    );
}

export default ThinkingScene;
