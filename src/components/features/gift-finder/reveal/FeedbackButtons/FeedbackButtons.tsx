'use client';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useI18n } from '@/i18n';
import { useTraceId } from '@/tracker';
import { InsightResult } from '@/types/insight';
import styles from './FeedbackButtons.module.scss';

interface FeedbackButtonsProps {
    result: InsightResult;
}

export function FeedbackButtons({ result }: FeedbackButtonsProps) {
    const { t } = useI18n();
    const traceId = useTraceId();
    const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);
    const [visible, setVisible] = useState(true);

    const handleFeedback = useCallback(async (type: 'like' | 'dislike') => {
        setFeedback(type);

        // 发送到服务器保存反馈
        if (traceId) {
            try {
                const { saveUserFeedback } = await import('@/tracker/server');
                await saveUserFeedback(traceId, {
                    feedback_type: type,
                    result_snapshot: result,
                });
            } catch (error) {
                console.error('Failed to save feedback:', error);
            }
        }

        // 如果是赞，播放小烟花
        if (type === 'like') {
            confetti({
                particleCount: 30,
                spread: 50,
                origin: { y: 0.8 },
                colors: ['#FF7F6E', '#96DEC3', '#FFC878'],
            });
        }

        // 1.5秒后自动关闭
        const timer = setTimeout(() => {
            setVisible(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, [result, traceId]);

    if (!visible) return null;

    return (
        <motion.div
            className={styles.feedbackContainer}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
        >
            <AnimatePresence mode="wait">
                {feedback ? (
                    <motion.div
                        key="thanks"
                        className={styles.feedbackThanks}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                    >
                        <span>✨</span>
                        <span>{t.feedback.thanks}</span>
                    </motion.div>
                ) : (
                    <motion.div
                        key="buttons"
                        className={styles.feedbackButtons}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                    >
                        <span className={styles.feedbackTitle}>{t.feedback.title}</span>
                        <div className={styles.feedbackActions}>
                            <button
                                className={`${styles.feedbackBtn} ${styles.likeBtn}`}
                                onClick={() => handleFeedback('like')}
                                aria-label={t.feedback.like}
                            >
                                <ThumbsUp size={16} />
                                <span>{t.feedback.like}</span>
                            </button>
                            <button
                                className={`${styles.feedbackBtn} ${styles.dislikeBtn}`}
                                onClick={() => handleFeedback('dislike')}
                                aria-label={t.feedback.dislike}
                            >
                                <ThumbsDown size={16} />
                                <span>{t.feedback.dislike}</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
