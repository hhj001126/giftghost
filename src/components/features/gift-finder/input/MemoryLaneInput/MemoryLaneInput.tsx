'use client';
import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useI18n } from '@/i18n';
import styles from './MemoryLaneInput.module.scss';

interface MemoryPrompt {
    key: string;
}

const memoryPrompts: MemoryPrompt[] = [
    { key: 'morning' },
    { key: 'work' },
    { key: 'comfort' },
    { key: 'quirks' },
    { key: 'relationships' },
    { key: 'dreams' },
];

interface MemoryLaneAnswers {
    morning?: string;
    work?: string;
    comfort?: string;
    quirks?: string;
    relationships?: string;
    dreams?: string;
}

interface MemoryLaneInputProps {
    answers: MemoryLaneAnswers;
    focusedField: string | null;
    onAnswerChange: (key: string, value: string) => void;
    onFieldFocus: (key: string) => void;
    onFieldBlur: () => void;
}

export function MemoryLaneInput({
    answers,
    focusedField,
    onAnswerChange,
    onFieldFocus,
    onFieldBlur,
}: MemoryLaneInputProps) {
    const { t } = useI18n();
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Safely access memoryPrompts with fallback
    const listenerMode = t.input?.modes?.listener;
    const tPrompts = (listenerMode?.memoryPrompts || {}) as Record<string, {
        emoji?: string;
        title?: string;
        subtitle?: string;
        placeholder?: string;
        questions?: string[];
    }>;

    const getPrompt = (key: string, type: 'emoji' | 'title' | 'subtitle' | 'placeholder' | 'questions'): string | string[] | undefined => {
        const prompt = tPrompts?.[key];
        if (!prompt || typeof prompt !== 'object') return undefined;
        return prompt[type];
    };

    const getFilledCount = () => {
        return Object.values(answers).filter(v => v && typeof v === 'string' && v.trim().length > 0).length;
    };

    const filledCount = getFilledCount();
    const totalPrompts = memoryPrompts.length;

    const getRandomQuestion = (key: string) => {
        const questions = getPrompt(key, 'questions') as string[] | undefined;
        if (questions && Array.isArray(questions) && questions.length > 0) {
            return questions[Math.floor(Math.random() * questions.length)];
        }
        return '';
    };

    const listenerShortDesc = t.input?.modes?.listener?.shortDesc;
    const progressLabel = listenerShortDesc ? listenerShortDesc.toLowerCase() : '';

    // Navigation
    const goToNext = useCallback(() => {
        if (currentIndex < totalPrompts - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    }, [currentIndex, totalPrompts]);

    const goToPrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    }, [currentIndex]);

    const goToIndex = (index: number) => {
        if (index >= 0 && index < totalPrompts) {
            setCurrentIndex(index);
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || (e.key === 'Tab' && !e.shiftKey)) {
                e.preventDefault();
                goToNext();
            } else if (e.key === 'ArrowLeft' || e.key === 'Shift+Tab') {
                e.preventDefault();
                goToPrev();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goToNext, goToPrev]);

    // Handle input complete
    const handleInputComplete = () => {
        if (currentIndex < totalPrompts - 1) {
            goToNext();
        }
    };

    // Get card content
    const getCardData = (index: number) => {
        if (index < 0 || index >= totalPrompts) return null;
        const prompt = memoryPrompts[index];
        return {
            index,
            key: prompt.key,
            emoji: (getPrompt(prompt.key, 'emoji') || '💭') as string,
            title: (getPrompt(prompt.key, 'title') || '') as string,
            subtitle: (getPrompt(prompt.key, 'subtitle') || '') as string,
            placeholder: (getPrompt(prompt.key, 'placeholder') || '') as string,
            answer: answers[prompt.key as keyof MemoryLaneAnswers] || '',
            isFilled: !!(answers[prompt.key as keyof MemoryLaneAnswers]?.trim()),
            isFocused: focusedField === prompt.key,
        };
    };

    const currentCard = getCardData(currentIndex);
    const prevCard = getCardData(currentIndex - 1);
    const nextCard = getCardData(currentIndex + 1);

    // Card animation variants - using explicit types
    const cardVariants = {
        hidden: (direction: number) => ({
            x: direction * 120,
            opacity: 0,
            scale: 0.85,
            filter: 'blur(4px)',
        }),
        visible: {
            x: 0,
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            transition: {
                type: 'spring' as const,
                stiffness: 300,
                damping: 30,
            },
        },
        exit: (direction: number) => ({
            x: direction * -80,
            opacity: 0,
            scale: 0.9,
            filter: 'blur(4px)',
            transition: {
                type: 'spring' as const,
                stiffness: 300,
                damping: 30,
            },
        }),
    };

    // Side card variants (peek effect) - using explicit types
    const sideCardVariants = {
        visible: (offset: number) => ({
            x: offset,
            opacity: 0.35,
            scale: 0.8,
            filter: 'blur(2px)',
            transition: {
                type: 'spring' as const,
                stiffness: 250,
                damping: 35,
            },
        }),
    };

    return (
        <div className={styles.carouselContainer}>
            {/* Progress */}
            <div className={styles.progressSection}>
                <div className={styles.progressBar}>
                    <motion.div
                        className={styles.progressFill}
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentIndex + 1) / totalPrompts) * 100}%` }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                </div>
                <div className={styles.progressInfo}>
                    <span className={styles.progressCount}>
                        {filledCount} / {totalPrompts} {progressLabel}
                    </span>
                    <span className={styles.currentStep}>
                        第 {currentIndex + 1} 步
                    </span>
                </div>
            </div>

            {/* Navigation Arrows */}
            <div className={styles.navArrows}>
                <motion.button
                    className={`${styles.navButton} ${currentIndex === 0 ? styles.disabled : ''}`}
                    onClick={goToPrev}
                    disabled={currentIndex === 0}
                    whileHover={currentIndex > 0 ? { scale: 1.1 } : {}}
                    whileTap={currentIndex > 0 ? { scale: 0.95 } : {}}
                >
                    <ChevronLeft size={22} />
                </motion.button>
                <motion.button
                    className={`${styles.navButton} ${currentIndex === totalPrompts - 1 ? styles.disabled : ''}`}
                    onClick={goToNext}
                    disabled={currentIndex === totalPrompts - 1}
                    whileHover={currentIndex < totalPrompts - 1 ? { scale: 1.1 } : {}}
                    whileTap={currentIndex < totalPrompts - 1 ? { scale: 0.95 } : {}}
                >
                    <ChevronRight size={22} />
                </motion.button>
            </div>

            {/* Carousel Track */}
            <div className={styles.carouselTrack} ref={containerRef}>
                {/* Previous Card (Peek) */}
                {prevCard && (
                    <motion.div
                        className={`${styles.cardWrapper} ${styles.sideCard} ${styles.prevCard}`}
                        variants={sideCardVariants}
                        animate="visible"
                        custom={-60}
                        onClick={goToPrev}
                        style={{ cursor: currentIndex > 0 ? 'pointer' : 'default' }}
                    >
                        <div className={styles.sideCardContent}>
                            <span className={styles.sideEmoji}>{prevCard.emoji}</span>
                            <span className={styles.sideTitle}>{prevCard.title}</span>
                        </div>
                    </motion.div>
                )}

                {/* Current Card */}
                <AnimatePresence mode="wait" initial={false}>
                    {currentCard && (
                        <motion.div
                            key={currentCard.index}
                            className={styles.cardWrapper}
                            custom={1}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <motion.div
                                className={`${styles.card} ${currentCard.isFilled ? styles.filled : ''} ${currentCard.isFocused ? styles.focused : ''}`}
                                layout
                            >
                                {/* Card Header */}
                                <div className={styles.cardHeader}>
                                    <motion.div
                                        className={styles.emojiContainer}
                                        animate={currentCard.isFocused
                                            ? { scale: [1, 1.2, 1], rotate: [0, 8, -8, 0] }
                                            : { scale: [1, 1.05, 1] }
                                        }
                                        transition={{ duration: 0.5 }}
                                    >
                                        {currentCard.emoji}
                                    </motion.div>
                                    <div className={styles.cardTitles}>
                                        <motion.span
                                            className={styles.cardTitle}
                                            animate={{ y: currentCard.isFocused ? 0 : 0 }}
                                        >
                                            {currentCard.title}
                                        </motion.span>
                                        {currentCard.subtitle && (
                                            <motion.span
                                                className={styles.cardSubtitle}
                                                animate={{ opacity: currentCard.isFocused ? 1 : 0.8 }}
                                            >
                                                {currentCard.subtitle}
                                            </motion.span>
                                        )}
                                    </div>
                                    {currentCard.isFilled && (
                                        <motion.div
                                            className={styles.cardCheck}
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                        >
                                            <Check size={18} />
                                        </motion.div>
                                    )}
                                </div>

                                {/* Guiding Question */}
                                <AnimatePresence mode="wait">
                                    {currentCard.isFocused && (
                                        <motion.div
                                            className={styles.guidingHint}
                                            initial={{ opacity: 0, y: -10, height: 0 }}
                                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                                            exit={{ opacity: 0, y: -10, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            💡 {getRandomQuestion(currentCard.key)}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Input */}
                                <div className={styles.inputWrapper}>
                                    <textarea
                                        value={currentCard.answer}
                                        onChange={(e) => onAnswerChange(currentCard.key, e.target.value)}
                                        onFocus={() => onFieldFocus(currentCard.key)}
                                        onBlur={onFieldBlur}
                                        className={styles.cardInput}
                                        placeholder={currentCard.placeholder}
                                        rows={3}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleInputComplete();
                                            }
                                        }}
                                    />
                                    {currentCard.isFilled && currentIndex < totalPrompts - 1 && (
                                        <motion.button
                                            className={styles.nextButton}
                                            onClick={handleInputComplete}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                        >
                                            下一题
                                            <ChevronRight size={16} />
                                        </motion.button>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Next Card (Peek) */}
                {nextCard && (
                    <motion.div
                        className={`${styles.cardWrapper} ${styles.sideCard} ${styles.nextCard}`}
                        variants={sideCardVariants}
                        animate="visible"
                        custom={60}
                        onClick={goToNext}
                        style={{ cursor: currentIndex < totalPrompts - 1 ? 'pointer' : 'default' }}
                    >
                        <div className={styles.sideCardContent}>
                            <span className={styles.sideEmoji}>{nextCard.emoji}</span>
                            <span className={styles.sideTitle}>{nextCard.title}</span>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Dots */}
            <div className={styles.dotsIndicator}>
                {memoryPrompts.map((prompt, index) => {
                    const isFilled = answers[prompt.key as keyof MemoryLaneAnswers]?.trim().length ?? 0 > 0;
                    const isActive = index === currentIndex;

                    return (
                        <motion.button
                            key={prompt.key}
                            className={`${styles.dot} ${isActive ? styles.active : ''} ${isFilled ? styles.filled : ''}`}
                            onClick={() => goToIndex(index)}
                            whileHover={{ scale: 1.3 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <AnimatePresence>
                                {isActive && (
                                    <motion.div
                                        className={styles.dotActive}
                                        layoutId="activeDot"
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </AnimatePresence>
                        </motion.button>
                    );
                })}
            </div>

            {/* Encouragement */}
            <AnimatePresence>
                {filledCount > 0 && filledCount < totalPrompts && (
                    <motion.div
                        className={styles.encouragement}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                    >
                        <span>🌟</span>
                        <span>{t.input.charFeedback.gettingThere}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
