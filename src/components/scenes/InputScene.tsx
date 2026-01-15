'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, MessageSquare, Sparkles,
    Zap, Check, Heart
} from 'lucide-react';
import { Button, SceneWrapper } from '@/components/ui';
import { useI18n } from '@/i18n';
import styles from './InputScene.module.scss';

type InputMode = 'DETECTIVE' | 'LISTENER' | 'INTERVIEW';

interface InputSceneProps {
    onNext: (data: { mode: string; content: string }) => void;
}

const modes = [
    {
        id: 'DETECTIVE' as const,
        emoji: '🕵️',
        color: 'coral',
        colorRgb: '255, 127, 110',
    },
    {
        id: 'LISTENER' as const,
        emoji: '👂',
        color: 'mint',
        colorRgb: '150, 222, 195',
    },
    {
        id: 'INTERVIEW' as const,
        emoji: '💬',
        color: 'lavender',
        colorRgb: '195, 175, 255',
    },
];

const interviewQuestions = [
    { key: 'pain', labelKey: 'pain.label', prefixKey: 'pain.prefix' },
    { key: 'joy', labelKey: 'joy.label', prefixKey: 'joy.prefix' },
    { key: 'secret', labelKey: 'secret.label', prefixKey: 'secret.prefix' },
];

// Helper to get nested translation
function getNestedTranslation(obj: Record<string, any>, path: string): string {
    const result = path.split('.').reduce((acc: any, part) => acc?.[part], obj);
    return typeof result === 'string' ? result : path;
}

export function InputScene({ onNext }: InputSceneProps) {
    const { t } = useI18n();
    const [mode, setMode] = useState<InputMode>('DETECTIVE');
    const [inputVal, setInputVal] = useState('');
    const [interviewAnswers, setInterviewAnswers] = useState({
        pain: '',
        joy: '',
        secret: '',
    });
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const currentMode = modes.find(m => m.id === mode)!;

    // Get translated values
    const tModes = t.input.modes;
    const tPlaceholder = t.input.placeholder;

    const getModeLabel = (id: string) => getNestedTranslation(tModes, `${id.toLowerCase()}.label`);
    const getModeShortDesc = (id: string) => getNestedTranslation(tModes, `${id.toLowerCase()}.shortDesc`);
    const getModeDescription = (id: string) => getNestedTranslation(tModes, `${id.toLowerCase()}.description`);
    const getModeHint = (id: string) => getNestedTranslation(tModes, `${id.toLowerCase()}.hint`);
    const getModeTips = (id: string) => getNestedTranslation(tModes, `${id.toLowerCase()}.tips`);
    const getPlaceholder = (id: string) => getNestedTranslation(tPlaceholder, id.toLowerCase());

    const getCharFeedback = (text: string) => {
        const length = text.length;
        const charFeedback = t.input.charFeedback;
        if (length === 0) return { message: '', class: '' };
        if (length < 10) return { message: charFeedback.gettingThere, class: styles.gettingThere };
        if (length < 30) return { message: charFeedback.niceDetail, class: styles.niceDetail };
        if (length < 50) return { message: charFeedback.onFire, class: styles.onFire };
        return { message: charFeedback.perfection, class: styles.perfection };
    };

    const charFeedback = getCharFeedback(inputVal);
    const isFormValid = mode === 'INTERVIEW'
        ? Object.values(interviewAnswers).some(v => v.trim())
        : inputVal.trim().length >= 5;

    const handleSubmit = () => {
        if (mode === 'INTERVIEW') {
            const content = JSON.stringify(interviewAnswers);
            if (Object.values(interviewAnswers).some(v => v.trim())) {
                onNext({ mode, content });
            }
        } else if (inputVal.trim().length >= 5) {
            onNext({ mode, content: inputVal });
        }
    };

    useEffect(() => {
        if (mode !== 'INTERVIEW' && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [mode]);

    return (
        <SceneWrapper variant="slide" centered={false} fullWidth={false}>
            {/* Header */}
            <div className={styles.header}>
                <motion.div
                    className={styles.pulseBadge}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <Zap size={16} />
                    {t.input.header}
                </motion.div>
                <h2 className={styles.title}>{t.input.subtitle}</h2>
            </div>

            {/* Mode Selector */}
            <div className={styles.modeSelector}>
                {modes.map((m, i) => {
                    const isActive = mode === m.id;
                    const label = getModeLabel(m.id);
                    const shortDesc = getModeShortDesc(m.id);

                    return (
                        <motion.button
                            key={m.id}
                            onClick={() => {
                                setMode(m.id);
                                setInputVal('');
                                setInterviewAnswers({ pain: '', joy: '', secret: '' });
                            }}
                            className={`${styles.modeCard} ${isActive ? styles.active : ''}`}
                            style={{
                                '--mode-color': `var(--color-${m.color})`,
                                '--mode-color-light': `var(--color-${m.color}-light)`,
                                '--mode-color-rgb': m.colorRgb,
                            } as React.CSSProperties}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isActive && <div className={styles.activeBg} />}
                            <div className={styles.emoji}>{m.emoji}</div>
                            <div className={styles.modeLabel}>{label}</div>
                            <div className={styles.modeDesc}>{shortDesc}</div>
                            {isActive && (
                                <motion.div
                                    layoutId="checkIcon"
                                    className={styles.checkIcon}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 500, delay: 0.1 }}
                                >
                                    <Check size={14} />
                                </motion.div>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Input Card */}
            <motion.div
                className={styles.inputCard}
                style={{
                    '--mode-color': `var(--color-${currentMode.color})`,
                    '--mode-color-light': `var(--color-${currentMode.color}-light)`,
                    '--mode-color-rgb': currentMode.colorRgb,
                } as React.CSSProperties}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <div className={styles.gradientBar} />

                {/* Description */}
                <AnimatePresence mode="wait">
                    <motion.p
                        key={mode}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={styles.description}
                    >
                        {getModeDescription(mode)}
                    </motion.p>
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    {mode === 'INTERVIEW' ? (
                        <motion.div
                            key="interview"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className={styles.interviewContainer}
                        >
                            {interviewQuestions.map((q, i) => {
                                const answer = interviewAnswers[q.key as keyof typeof interviewAnswers];
                                const isFocused = focusedField === q.key;
                                const hasAnswer = answer.trim().length > 0;

                                return (
                                    <motion.div
                                        key={q.key}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 + i * 0.1 }}
                                        className={styles.questionItem}
                                    >
                                        <input
                                            type="text"
                                            value={answer}
                                            onChange={(e) => setInterviewAnswers(prev => ({
                                                ...prev,
                                                [q.key]: e.target.value
                                            }))}
                                            onFocus={() => setFocusedField(q.key)}
                                            onBlur={() => setFocusedField(null)}
                                            className={`${styles.questionInput} ${hasAnswer ? styles.hasValue : ''}`}
                                            placeholder={`... ${getNestedTranslation(t.input.modes.interview, q.prefixKey)}`}
                                        />
                                        <motion.label
                                            className={styles.floatingLabel}
                                            animate={{
                                                scale: isFocused ? 0.9 : 1,
                                            }}
                                        >
                                            {isFocused ? getNestedTranslation(t.input.modes.interview, q.labelKey) : ''}
                                        </motion.label>
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
                                {interviewQuestions.map((q) => (
                                    <motion.div
                                        key={q.key}
                                        className={`${styles.progressDot} ${interviewAnswers[q.key as keyof typeof interviewAnswers].trim() ? styles.filled : ''}`}
                                        animate={{
                                            scale: interviewAnswers[q.key as keyof typeof interviewAnswers].trim() ? [1, 1.4, 1] : 1,
                                        }}
                                        transition={{ duration: 0.3 }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="standard"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className={styles.standardContainer}
                        >
                            {/* Floating placeholder */}
                            <AnimatePresence>
                                {inputVal.length === 0 && (
                                    <motion.label
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className={styles.floatingPlaceholder}
                                    >
                                        {getPlaceholder(mode)}
                                        <motion.span
                                            animate={{ opacity: [0.3, 1, 0.3] }}
                                            transition={{ duration: 1, repeat: Infinity }}
                                        >
                                            |
                                        </motion.span>
                                    </motion.label>
                                )}
                            </AnimatePresence>

                            {/* Input */}
                            <div className={styles.inputWrapper}>
                                <motion.div
                                    className={`${styles.inputIcon} ${focusedField ? styles.focused : ''}`}
                                    animate={{
                                        rotate: focusedField ? [0, -10, 10, 0] : 0,
                                    }}
                                    transition={{ duration: 0.5 }}
                                >
                                    {mode === 'DETECTIVE' ? <Search size={20} /> : <MessageSquare size={20} />}
                                </motion.div>

                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputVal}
                                    onChange={(e) => setInputVal(e.target.value)}
                                    onFocus={() => setFocusedField('main')}
                                    onBlur={() => setFocusedField(null)}
                                    className={`${styles.textInput} ${focusedField ? styles.focused : ''}`}
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                />
                            </div>

                            {/* Hint */}
                            {getModeHint(mode) && (
                                <div className={styles.hint}>
                                    <Sparkles size={12} />
                                    <span>{getModeHint(mode)}</span>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Submit Button */}
            <div className={styles.submitWrapper}>
                <Button
                    onClick={handleSubmit}
                    disabled={!isFormValid}
                    variant="primary"
                    size="lg"
                    fullWidth
                    showShimmer={isFormValid}
                    floatingHearts={isFormValid}
                    icon={isFormValid ? <Heart size={24} /> : undefined}
                    iconPosition={isFormValid ? 'left' : 'right'}
                >
                    {isFormValid ? (
                        <>
                            <span>{t.input.findGift}</span>
                            <Sparkles size={24} style={{ marginLeft: 8 }} />
                        </>
                    ) : (
                        t.input.startTyping
                    )}
                </Button>
            </div>

            {/* Tips */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className={styles.tips}
            >
                <span>💡</span>
                <span>{getModeTips(mode)}</span>
            </motion.p>
        </SceneWrapper>
    );
}
