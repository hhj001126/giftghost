'use client';
import { motion } from 'framer-motion';
import { Check, Heart, Sparkles } from 'lucide-react';
import { useI18n } from '@/i18n';
import styles from './ModeSelector.module.scss';

type InputMode = 'LISTENER' | 'INTERVIEW';

interface Mode {
    id: InputMode;
    emoji: string;
    color: string;
    colorRgb: string;
    icon: React.ReactNode;
}

const modes: Mode[] = [
    {
        id: 'LISTENER' as const,
        emoji: '📖',
        color: 'coral',
        colorRgb: '255, 127, 110',
        icon: <Heart size={24} />,
    },
    {
        id: 'INTERVIEW' as const,
        emoji: '💫',
        color: 'lavender',
        colorRgb: '195, 175, 255',
        icon: <Sparkles size={24} />,
    },
];

interface ModeSelectorProps {
    selectedMode: InputMode;
    onModeChange: (mode: InputMode) => void;
}

// Helper to get nested translation
function getNestedTranslation(obj: Record<string, any>, path: string): string {
    const result = path.split('.').reduce((acc: any, part) => acc?.[part], obj);
    return typeof result === 'string' ? result : path;
}

export function ModeSelector({ selectedMode, onModeChange }: ModeSelectorProps) {
    const { t } = useI18n();
    const tModes = t.input.modes;

    const getModeLabel = (id: string) => getNestedTranslation(tModes, `${id.toLowerCase()}.label`);
    const getModeShortDesc = (id: string) => getNestedTranslation(tModes, `${id.toLowerCase()}.shortDesc`);

    return (
        <div className={styles.modeSelector}>
            {modes.map((m, i) => {
                const isActive = selectedMode === m.id;
                const label = getModeLabel(m.id);
                const shortDesc = getModeShortDesc(m.id);

                return (
                    <motion.button
                        key={m.id}
                        onClick={() => onModeChange(m.id)}
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
                        <div className={styles.emojiWrapper}>
                            <motion.div
                                className={styles.emoji}
                                animate={isActive ? {
                                    rotate: [0, -5, 5, 0],
                                    scale: [1, 1.1, 1],
                                } : {}}
                                transition={{ duration: 0.5 }}
                            >
                                {m.emoji}
                            </motion.div>
                            {isActive && (
                                <motion.div
                                    className={styles.modeIcon}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    {m.icon}
                                </motion.div>
                            )}
                        </div>
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
    );
}
