'use client';
import { motion } from 'framer-motion';
import styles from './BreathingCard.module.scss';

interface BreathingCardProps {
    children: React.ReactNode;
    className?: string;
    intensity?: number;
    variant?: 'default' | 'elevated' | 'glass';
}

export function BreathingCard({
    children,
    className,
    intensity = 1,
    variant = 'default'
}: BreathingCardProps) {
    const variants = {
        breathe: {
            scale: [1, 1.008, 1],
            boxShadow: [
                "0 4px 20px rgba(0, 0, 0, 0.05)",
                "0 8px 30px rgba(255, 127, 110, 0.1)",
                "0 4px 20px rgba(0, 0, 0, 0.05)"
            ],
            transition: {
                duration: 3 / intensity,
                ease: "easeInOut" as const,
                repeat: Infinity,
                repeatType: "mirror" as const
            }
        }
    };

    return (
        <motion.div
            variants={variants}
            animate="breathe"
            className={`${styles.card} ${styles[variant]} ${className || ''}`}
        >
            {/* Subtle inner glow for elevated variant */}
            {variant === 'elevated' && (
                <div className={styles.elevatedGlow} />
            )}

            <div className={styles.content}>
                {children}
            </div>
        </motion.div>
    );
}
