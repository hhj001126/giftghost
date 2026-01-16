'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Sparkles } from 'lucide-react';
import { useI18n } from '@/i18n';
import styles from './ProfileQuickInput.module.scss';

interface ProfileData {
    gender?: string;
    ageRange?: string;
    mbti?: string;
    interests?: string[];
}

interface ProfileQuickInputProps {
    value: ProfileData;
    onChange: (data: ProfileData) => void;
    onComplete: () => void;
}

export function ProfileQuickInput({ value, onChange, onComplete }: ProfileQuickInputProps) {
    const { t } = useI18n();
    const [expandedSection, setExpandedSection] = useState<string | null>('gender');
    const [isAllCompleted, setIsAllCompleted] = useState(false);

    // Generate options from translations
    const genderOptions = useMemo(() => [
        { value: 'male', label: t.input.profileQuick.sections.gender.options.male, emoji: '👨' },
        { value: 'female', label: t.input.profileQuick.sections.gender.options.female, emoji: '👩' },
        { value: 'other', label: t.input.profileQuick.sections.gender.options.other, emoji: '🧑' },
        { value: 'prefer-not', label: t.input.profileQuick.sections.gender.options.preferNot, emoji: '🤫' },
    ], [t]);

    const ageRanges = useMemo(() => [
        { value: '18-24', label: t.input.profileQuick.sections.age.options['18-24'] },
        { value: '25-34', label: t.input.profileQuick.sections.age.options['25-34'] },
        { value: '35-44', label: t.input.profileQuick.sections.age.options['35-44'] },
        { value: '45-54', label: t.input.profileQuick.sections.age.options['45-54'] },
        { value: '55+', label: t.input.profileQuick.sections.age.options['55+'] },
    ], [t]);

    const interestTags = useMemo(() => [
        { id: 'tech', label: t.input.profileQuick.sections.interests.tags.tech, emoji: '💻' },
        { id: 'gaming', label: t.input.profileQuick.sections.interests.tags.gaming, emoji: '🎮' },
        { id: 'reading', label: t.input.profileQuick.sections.interests.tags.reading, emoji: '📚' },
        { id: 'travel', label: t.input.profileQuick.sections.interests.tags.travel, emoji: '✈️' },
        { id: 'fitness', label: t.input.profileQuick.sections.interests.tags.fitness, emoji: '🏋️' },
        { id: 'cooking', label: t.input.profileQuick.sections.interests.tags.cooking, emoji: '🍳' },
        { id: 'music', label: t.input.profileQuick.sections.interests.tags.music, emoji: '🎵' },
        { id: 'art', label: t.input.profileQuick.sections.interests.tags.art, emoji: '🎨' },
        { id: 'outdoor', label: t.input.profileQuick.sections.interests.tags.outdoor, emoji: '🏔️' },
        { id: 'photography', label: t.input.profileQuick.sections.interests.tags.photography, emoji: '📷' },
        { id: 'fashion', label: t.input.profileQuick.sections.interests.tags.fashion, emoji: '👗' },
        { id: 'pets', label: t.input.profileQuick.sections.interests.tags.pets, emoji: '🐾' },
    ], [t]);

    const mbtiOptions = useMemo(() => [
        { value: 'ISTJ', label: 'ISTJ', desc: t.input.profileQuick.sections.mbti.types.ISTJ },
        { value: 'ISFJ', label: 'ISFJ', desc: t.input.profileQuick.sections.mbti.types.ISFJ },
        { value: 'INFJ', label: 'INFJ', desc: t.input.profileQuick.sections.mbti.types.INFJ },
        { value: 'INTJ', label: 'INTJ', desc: t.input.profileQuick.sections.mbti.types.INTJ },
        { value: 'ISTP', label: 'ISTP', desc: t.input.profileQuick.sections.mbti.types.ISTP },
        { value: 'ISFP', label: 'ISFP', desc: t.input.profileQuick.sections.mbti.types.ISFP },
        { value: 'INFP', label: 'INFP', desc: t.input.profileQuick.sections.mbti.types.INFP },
        { value: 'INTP', label: 'INTP', desc: t.input.profileQuick.sections.mbti.types.INTP },
        { value: 'ESTP', label: 'ESTP', desc: t.input.profileQuick.sections.mbti.types.ESTP },
        { value: 'ESFP', label: 'ESFP', desc: t.input.profileQuick.sections.mbti.types.ESFP },
        { value: 'ENFP', label: 'ENFP', desc: t.input.profileQuick.sections.mbti.types.ENFP },
        { value: 'ENTP', label: 'ENTP', desc: t.input.profileQuick.sections.mbti.types.ENTP },
        { value: 'ESTJ', label: 'ESTJ', desc: t.input.profileQuick.sections.mbti.types.ESTJ },
        { value: 'ESFJ', label: 'ESFJ', desc: t.input.profileQuick.sections.mbti.types.ESFJ },
        { value: 'ENFJ', label: 'ENFJ', desc: t.input.profileQuick.sections.mbti.types.ENFJ },
        { value: 'ENTJ', label: 'ENTJ', desc: t.input.profileQuick.sections.mbti.types.ENTJ },
    ], [t]);

    const updateGender = (gender: string) => {
        onChange({ ...value, gender });
    };

    const updateAgeRange = (ageRange: string) => {
        onChange({ ...value, ageRange });
    };

    const updateMbti = (mbti: string) => {
        onChange({ ...value, mbti });
    };

    const toggleInterest = (interestId: string) => {
        const currentInterests = value.interests || [];
        if (currentInterests.includes(interestId)) {
            onChange({
                ...value,
                interests: currentInterests.filter(id => id !== interestId),
            });
        } else {
            onChange({
                ...value,
                interests: [...currentInterests, interestId],
            });
        }
    };

    // Check completion status
    const hasGender = !!value.gender;
    const hasAgeRange = !!value.ageRange;
    const hasMbti = !!value.mbti;
    const hasInterests = (value.interests?.length ?? 0) > 0;

    const completedCount = [hasGender, hasAgeRange, hasMbti, hasInterests].filter(Boolean).length;
    const totalSections = 4;
    const progressPercent = (completedCount / totalSections) * 100;

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <motion.div
                    className={styles.headerIcon}
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <Sparkles size={20} />
                </motion.div>
                <div className={styles.headerContent}>
                    <h3 className={styles.headerTitle}>{t.input.profileQuick.header.title}</h3>
                    <p className={styles.headerSubtitle}>{t.input.profileQuick.header.subtitle}</p>
                </div>
            </div>

            {/* Progress */}
            <div className={styles.progressBar}>
                <motion.div
                    className={styles.progressFill}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>
            <div className={styles.progressInfo}>
                <span>{t.input.profileQuick.progress.completed.replace('{count}', String(completedCount)).replace('{total}', String(totalSections))}</span>
                {completedCount === totalSections && (
                    <motion.span
                        className={styles.completeText}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        {t.input.profileQuick.progress.completeText}
                    </motion.span>
                )}
            </div>

            {/* Sections */}
            <div className={styles.sections}>
                {/* Gender */}
                <motion.div
                    className={`${styles.section} ${hasGender ? styles.completed : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <button
                        className={styles.sectionHeader}
                        onClick={() => setExpandedSection(expandedSection === 'gender' ? null : 'gender')}
                    >
                        <div className={styles.sectionTitle}>
                            <span className={styles.sectionEmoji}>👤</span>
                            <span>{t.input.profileQuick.sections.gender.title}</span>
                            {hasGender && <Check size={16} className={styles.checkIcon} />}
                        </div>
                        <motion.div
                            animate={{ rotate: expandedSection === 'gender' ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown size={20} />
                        </motion.div>
                    </button>
                    <AnimatePresence>
                        {expandedSection === 'gender' && (
                            <motion.div
                                className={styles.sectionContent}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className={styles.genderGrid}>
                                    {genderOptions.map((option) => (
                                        <motion.button
                                            key={option.value}
                                            className={`${styles.genderOption} ${value.gender === option.value ? styles.selected : ''}`}
                                            onClick={() => updateGender(option.value)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <span className={styles.genderEmoji}>{option.emoji}</span>
                                            <span className={styles.genderLabel}>{option.label}</span>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Age Range */}
                <motion.div
                    className={`${styles.section} ${hasAgeRange ? styles.completed : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                >
                    <button
                        className={styles.sectionHeader}
                        onClick={() => setExpandedSection(expandedSection === 'age' ? null : 'age')}
                    >
                        <div className={styles.sectionTitle}>
                            <span className={styles.sectionEmoji}>🎂</span>
                            <span>{t.input.profileQuick.sections.age.title}</span>
                            {hasAgeRange && <Check size={16} className={styles.checkIcon} />}
                        </div>
                        <motion.div
                            animate={{ rotate: expandedSection === 'age' ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown size={20} />
                        </motion.div>
                    </button>
                    <AnimatePresence>
                        {expandedSection === 'age' && (
                            <motion.div
                                className={styles.sectionContent}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className={styles.ageGrid}>
                                    {ageRanges.map((range) => (
                                        <motion.button
                                            key={range.value}
                                            className={`${styles.ageOption} ${value.ageRange === range.value ? styles.selected : ''}`}
                                            onClick={() => updateAgeRange(range.value)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            {range.label}
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* MBTI */}
                <motion.div
                    className={`${styles.section} ${hasMbti ? styles.completed : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <button
                        className={styles.sectionHeader}
                        onClick={() => setExpandedSection(expandedSection === 'mbti' ? null : 'mbti')}
                    >
                        <div className={styles.sectionTitle}>
                            <span className={styles.sectionEmoji}>🧠</span>
                            <span>{t.input.profileQuick.sections.mbti.title}</span>
                            {hasMbti && <Check size={16} className={styles.checkIcon} />}
                        </div>
                        <motion.div
                            animate={{ rotate: expandedSection === 'mbti' ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown size={20} />
                        </motion.div>
                    </button>
                    <AnimatePresence>
                        {expandedSection === 'mbti' && (
                            <motion.div
                                className={styles.sectionContent}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className={styles.mbtiGrid}>
                                    {mbtiOptions.map((mbti) => (
                                        <motion.button
                                            key={mbti.value}
                                            className={`${styles.mbtiOption} ${value.mbti === mbti.value ? styles.selected : ''}`}
                                            onClick={() => updateMbti(mbti.value)}
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                        >
                                            <span className={styles.mbtiValue}>{mbti.value}</span>
                                            <span className={styles.mbtiDesc}>{mbti.desc}</span>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Interests */}
                <motion.div
                    className={`${styles.section} ${hasInterests ? styles.completed : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <button
                        className={styles.sectionHeader}
                        onClick={() => setExpandedSection(expandedSection === 'interests' ? null : 'interests')}
                    >
                        <div className={styles.sectionTitle}>
                            <span className={styles.sectionEmoji}>💫</span>
                            <span>{t.input.profileQuick.sections.interests.title}</span>
                            {hasInterests && <Check size={16} className={styles.checkIcon} />}
                        </div>
                        <motion.div
                            animate={{ rotate: expandedSection === 'interests' ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown size={20} />
                        </motion.div>
                    </button>
                    <AnimatePresence>
                        {expandedSection === 'interests' && (
                            <motion.div
                                className={styles.sectionContent}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className={styles.interestsGrid}>
                                    {interestTags.map((tag) => {
                                        const isSelected = value.interests?.includes(tag.id);
                                        return (
                                            <motion.button
                                                key={tag.id}
                                                className={`${styles.interestTag} ${isSelected ? styles.selected : ''}`}
                                                onClick={() => toggleInterest(tag.id)}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <span className={styles.tagEmoji}>{tag.emoji}</span>
                                                <span className={styles.tagLabel}>{tag.label}</span>
                                                {isSelected && (
                                                    <motion.div
                                                        className={styles.tagCheck}
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                    >
                                                        <Check size={12} />
                                                    </motion.div>
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Complete Button */}
            {completedCount > 0 && (
                <motion.button
                    className={styles.completeButton}
                    onClick={onComplete}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {completedCount === totalSections ? t.input.profileQuick.buttons.continue : t.input.profileQuick.buttons.skip}
                </motion.button>
            )}
        </div>
    );
}
