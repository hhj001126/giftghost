'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sparkles, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { Button, SceneWrapper } from '@/components/ui';
import { useI18n } from '@/i18n';
import { ModeSelector, InputCard, ProfileQuickInput } from '@/components/business/input';
import styles from './InputScene.module.scss';

type InputMode = 'LISTENER' | 'INTERVIEW';

interface InputSceneProps {
    onNext: (data: { mode: string; content: string }) => void;
}

interface ProfileData {
    gender?: string;
    ageRange?: string;
    mbti?: string;
    interests?: string[];
}

export function InputScene({ onNext }: InputSceneProps) {
    const { t } = useI18n();
    const [mode, setMode] = useState<InputMode>('LISTENER');
    const [showProfileQuick, setShowProfileQuick] = useState(true);
    const [profileData, setProfileData] = useState<ProfileData>({});
    const [interviewAnswers, setInterviewAnswers] = useState({
        pain: '',
        joy: '',
        secret: '',
        style: '',
    });
    const [memoryLaneAnswers, setMemoryLaneAnswers] = useState({
        morning: '',
        work: '',
        comfort: '',
        quirks: '',
        relationships: '',
        dreams: '',
    });
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const isFormValid = mode === 'INTERVIEW'
        ? Object.values(interviewAnswers).some(v => v && typeof v === 'string' && v.trim().length > 0)
        : Object.values(memoryLaneAnswers).some(v => v && typeof v === 'string' && v.trim().length > 0);

    const handleModeChange = (newMode: InputMode) => {
        setMode(newMode);
        setInterviewAnswers({ pain: '', joy: '', secret: '', style: '' });
        setMemoryLaneAnswers({ morning: '', work: '', comfort: '', quirks: '', relationships: '', dreams: '' });
        setFocusedField(null);
    };

    const handleInterviewAnswerChange = (key: string, value: string) => {
        setInterviewAnswers(prev => ({ ...prev, [key]: value }));
    };

    const handleMemoryLaneAnswerChange = (key: string, value: string) => {
        setMemoryLaneAnswers(prev => ({ ...prev, [key]: value }));
    };

    const handleProfileComplete = () => {
        setShowProfileQuick(false);
    };

    const handleSubmit = () => {
        // Combine profile data with mode-specific answers
        const combinedData = {
            profile: profileData,
            answers: mode === 'INTERVIEW' ? interviewAnswers : memoryLaneAnswers,
        };
        const content = JSON.stringify(combinedData);

        const hasAnswers = mode === 'INTERVIEW'
            ? Object.values(interviewAnswers).some(v => v && typeof v === 'string' && v.trim().length > 0)
            : Object.values(memoryLaneAnswers).some(v => v && typeof v === 'string' && v.trim().length > 0);

        if (hasAnswers) {
            onNext({ mode, content });
        }
    };

    return (
        <SceneWrapper variant="slide" centered={false} fullWidth={false}>
            {/* Profile Quick Input - Collapsible */}
            <div className={styles.profileSection}>
                <button
                    className={styles.profileToggle}
                    onClick={() => setShowProfileQuick(!showProfileQuick)}
                >
                    <div className={styles.profileToggleLeft}>
                        <Sparkles size={18} className={styles.profileIcon} />
                        <span>{t.input.profileQuick.header.title}</span>
                    </div>
                    <motion.div
                        animate={{ rotate: showProfileQuick ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {showProfileQuick ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </motion.div>
                </button>

                <AnimatePresence>
                    {showProfileQuick && (
                        <motion.div
                            className={styles.profileContent}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ProfileQuickInput
                                value={profileData}
                                onChange={setProfileData}
                                onComplete={handleProfileComplete}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

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
            <ModeSelector
                selectedMode={mode}
                onModeChange={handleModeChange}
            />

            {/* Input Card */}
            <InputCard
                mode={mode}
                interviewAnswers={interviewAnswers}
                interviewFocusedField={focusedField}
                onInterviewAnswerChange={handleInterviewAnswerChange}
                onInterviewFieldFocus={(key) => setFocusedField(key)}
                onInterviewFieldBlur={() => setFocusedField(null)}
                memoryLaneAnswers={memoryLaneAnswers}
                memoryLaneFocusedField={focusedField}
                onMemoryLaneAnswerChange={handleMemoryLaneAnswerChange}
                onMemoryLaneFieldFocus={(key) => setFocusedField(key)}
                onMemoryLaneFieldBlur={() => setFocusedField(null)}
            />

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
                <span>{t.input.modes[mode.toLowerCase() as keyof typeof t.input.modes]?.tips || ''}</span>
            </motion.p>
        </SceneWrapper>
    );
}
