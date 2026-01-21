'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/i18n';
import { InterviewInput } from '../InterviewInput';
import { MemoryLaneInput } from '../MemoryLaneInput';
import styles from './InputCard.module.scss';

type InputMode = 'LISTENER' | 'INTERVIEW';

interface Mode {
    id: InputMode;
    color: string;
    colorRgb: string;
}

const modes: Record<InputMode, Mode> = {
    LISTENER: { id: 'LISTENER', color: 'coral', colorRgb: '255, 127, 110' },
    INTERVIEW: { id: 'INTERVIEW', color: 'lavender', colorRgb: '195, 175, 255' },
};

interface InterviewAnswers {
    pain?: string;
    joy?: string;
    secret?: string;
    style?: string;
}

interface MemoryLaneAnswers {
    morning?: string;
    work?: string;
    comfort?: string;
    quirks?: string;
    relationships?: string;
    dreams?: string;
}

interface InputCardProps {
    mode: InputMode;
    // Interview input props
    interviewAnswers?: InterviewAnswers;
    interviewFocusedField?: string | null;
    onInterviewAnswerChange?: (key: string, value: string) => void;
    onInterviewFieldFocus?: (key: string) => void;
    onInterviewFieldBlur?: () => void;
    // Memory Lane input props
    memoryLaneAnswers?: MemoryLaneAnswers;
    memoryLaneFocusedField?: string | null;
    onMemoryLaneAnswerChange?: (key: string, value: string) => void;
    onMemoryLaneFieldFocus?: (key: string) => void;
    onMemoryLaneFieldBlur?: () => void;
}

// Helper to get nested translation
function getNestedTranslation(obj: Record<string, any>, path: string): string {
    const result = path.split('.').reduce((acc: any, part) => acc?.[part], obj);
    return typeof result === 'string' ? result : path;
}

export function InputCard({
    mode,
    interviewAnswers = { pain: '', joy: '', secret: '', style: '' },
    interviewFocusedField = null,
    onInterviewAnswerChange,
    onInterviewFieldFocus,
    onInterviewFieldBlur,
    memoryLaneAnswers = { morning: '', work: '', comfort: '', quirks: '', relationships: '', dreams: '' },
    memoryLaneFocusedField = null,
    onMemoryLaneAnswerChange,
    onMemoryLaneFieldFocus,
    onMemoryLaneFieldBlur,
}: InputCardProps) {
    const { t } = useI18n();
    const currentMode = modes[mode];

    const getModeDescription = (id: string) => {
        const modes = t.input.modes as Record<string, { description?: string }>;
        return modes[id.toLowerCase()]?.description || '';
    };

    return (
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
                    <InterviewInput
                        key="interview"
                        answers={{
                            pain: interviewAnswers?.pain || '',
                            joy: interviewAnswers?.joy || '',
                            secret: interviewAnswers?.secret || '',
                            style: interviewAnswers?.style || '',
                        }}
                        focusedField={interviewFocusedField || null}
                        onAnswerChange={onInterviewAnswerChange || (() => { })}
                        onFieldFocus={onInterviewFieldFocus || (() => { })}
                        onFieldBlur={onInterviewFieldBlur || (() => { })}
                    />
                ) : (
                    <MemoryLaneInput
                        key="memory-lane"
                        answers={{
                            morning: memoryLaneAnswers?.morning || '',
                            work: memoryLaneAnswers?.work || '',
                            comfort: memoryLaneAnswers?.comfort || '',
                            quirks: memoryLaneAnswers?.quirks || '',
                            relationships: memoryLaneAnswers?.relationships || '',
                            dreams: memoryLaneAnswers?.dreams || '',
                        }}
                        focusedField={memoryLaneFocusedField || null}
                        onAnswerChange={onMemoryLaneAnswerChange || (() => { })}
                        onFieldFocus={onMemoryLaneFieldFocus || (() => { })}
                        onFieldBlur={onMemoryLaneFieldBlur || (() => { })}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}
