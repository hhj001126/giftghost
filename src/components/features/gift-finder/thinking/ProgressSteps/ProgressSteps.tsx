'use client';
import { motion } from 'framer-motion';
import { Search, Brain, Sparkle, Gift, Check } from 'lucide-react';
import { useI18n } from '@/i18n';
import styles from './ProgressSteps.module.scss';

type ThinkingStage = 'analyzing' | 'digging' | 'matching' | 'generating' | 'finalizing';

// Stage icons mapping
const stageIcons: Record<ThinkingStage, React.ReactNode> = {
    analyzing: <Search size={14} />,
    digging: <Brain size={14} />,
    matching: <Sparkle size={14} />,
    generating: <Gift size={14} />,
    finalizing: <Check size={14} />,
};

interface ProgressStepsProps {
    currentStage: ThinkingStage;
}

export function ProgressSteps({ currentStage }: ProgressStepsProps) {
    const { t } = useI18n();
    const stages = t.thinking.stages;
    const stageKeys = Object.keys(stages) as ThinkingStage[];
    const currentIndex = stageKeys.indexOf(currentStage);

    return (
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
    );
}
