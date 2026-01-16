'use client';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useI18n } from '@/i18n';
import styles from './InterviewInput.module.scss';

interface InterviewQuestion {
    key: string;
}

const interviewQuestions: InterviewQuestion[] = [
    { key: 'pain' },
    { key: 'joy' },
    { key: 'secret' },
    { key: 'style' },
];

interface InterviewAnswers {
    pain?: string;
    joy?: string;
    secret?: string;
    style?: string;
}

interface InterviewInputProps {
    answers: InterviewAnswers;
    focusedField: string | null;
    onAnswerChange: (key: string, value: string) => void;
    onFieldFocus: (key: string) => void;
    onFieldBlur: () => void;
}

// Helper to get nested translation
function getNestedTranslation(obj: Record<string, any>, path: string): string {
    const result = path.split('.').reduce((acc: any, part) => acc?.[part], obj);
    return typeof result === 'string' ? result : path;
}

export function InterviewInput({
    answers,
    focusedField,
    onAnswerChange,
    onFieldFocus,
    onFieldBlur,
}: InterviewInputProps) {
    const { t } = useI18n();
    const tInterview = (t.input.modes.interview || {}) as Record<string, {
        label?: string;
        placeholder?: string;
        questions?: string[];
    }>;

    // Get a random guiding question for display
    const getRandomQuestion = (key: string) => {
        const questionData = tInterview[key];
        const questions = questionData?.questions;
        if (questions && questions.length > 0) {
            return questions[Math.floor(Math.random() * questions.length)];
        }
        return '';
    };

    // Get the label for the question
    const getLabel = (key: string) => {
        return tInterview[key]?.label || '';
    };

    // Get the placeholder
    const getPlaceholder = (key: string) => {
        return tInterview[key]?.placeholder || '';
    };

    return (
        <motion.div
            key="interview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={styles.interviewContainer}
        >
            {interviewQuestions.map((q, i) => {
                const answer = answers[q.key as keyof InterviewAnswers] || '';
                const isFocused = focusedField === q.key;
                const hasAnswer = typeof answer === 'string' && answer.trim().length > 0;
                const label = getLabel(q.key);
                const placeholder = getPlaceholder(q.key);

                return (
                    <motion.div
                        key={q.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        className={styles.questionItem}
                    >
                        {isFocused && (
                            <motion.div
                                className={styles.guidingQuestion}
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                💡 {getRandomQuestion(q.key)}
                            </motion.div>
                        )}

                        <input
                            type="text"
                            value={answer || ''}
                            onChange={(e) => onAnswerChange(q.key, e.target.value || '')}
                            onFocus={() => onFieldFocus(q.key)}
                            onBlur={onFieldBlur}
                            className={`${styles.questionInput} ${hasAnswer ? styles.hasValue : ''}`}
                            placeholder={isFocused ? placeholder : `... ${placeholder}`}
                        />

                        {hasAnswer && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={styles.successIcon}
                            >
                                <Check size={20} />
                            </motion.div>
                        )}
                    </motion.div>
                );
            })}

            {/* Progress dots */}
            <div className={styles.progressDots}>
                {interviewQuestions.map((q) => {
                    const answer = answers[q.key as keyof InterviewAnswers] || '';
                    const isFilled = typeof answer === 'string' && answer.trim().length > 0;
                    return (
                        <motion.div
                            key={q.key}
                            className={`${styles.progressDot} ${isFilled ? styles.filled : ''}`}
                            animate={{
                                scale: isFilled ? [1, 1.4, 1] : 1,
                            }}
                            transition={{ duration: 0.3 }}
                        />
                    );
                })}
            </div>
        </motion.div>
    );
}
