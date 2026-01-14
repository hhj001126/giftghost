'use client';
import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import styles from './Card.module.scss';

export interface CardProps extends Omit<HTMLMotionProps<"div">, "children"> {
    children: ReactNode;
    variant?: 'default' | 'elevated' | 'glass' | 'hero' | 'insight';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    interactive?: boolean;
    breathing?: boolean;
    className?: string;
}

export function Card({
    children,
    variant = 'default',
    padding = 'md',
    interactive = false,
    breathing = false,
    className = '',
    ...props
}: CardProps) {
    const classNames = [
        styles.card,
        styles[variant],
        styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}`],
        interactive ? styles.interactive : '',
        breathing ? styles.breathing : '',
        className,
    ].filter(Boolean).join(' ');

    const MotionComponent = interactive ? motion.div : 'div';
    const hoverProp = interactive ? { whileHover: { scale: 1.02 } as const } : {};
    const tapProp = interactive ? { whileTap: { scale: 0.98 } as const } : {};

    return (
        <MotionComponent
            className={classNames}
            {...hoverProp}
            {...tapProp}
            {...(props as any)}
        >
            {/* Click feedback overlay */}
            {interactive && <div className={styles.clickFeedback} />}

            {/* Glow overlay for elevated variant */}
            {variant === 'elevated' && <div className={styles.glowOverlay} />}

            {/* Decorative circles for hero variant */}
            {variant === 'hero' && (
                <>
                    <motion.div
                        className={`${styles.decorativeCircle} ${styles.topRight}`}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    />
                    <motion.div
                        className={`${styles.decorativeCircle} ${styles.bottomLeft}`}
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    />
                </>
            )}

            {/* Inner content wrapper */}
            <div className={styles.inner}>
                {children}
            </div>
        </MotionComponent>
    );
}

// Sub-components for specialized cards
export function InsightCard({
    icon,
    label,
    children,
    color = 'coral',
}: {
    icon: ReactNode;
    label: string;
    children: ReactNode;
    color?: 'coral' | 'lavender' | 'mint';
}) {
    const colorMap = {
        coral: { bg: 'rgba(255, 127, 110, 0.2)', text: '#FF7F6E' },
        lavender: { bg: 'rgba(195, 175, 255, 0.3)', text: '#C3AFFF' },
        mint: { bg: 'rgba(150, 222, 195, 0.2)', text: '#96DEC3' },
    };

    const colorStyle = colorMap[color];

    return (
        <div className={styles.insight}>
            <div className={styles.insightHeader}>
                <div
                    className={styles.insightIcon}
                    style={{ background: colorStyle.bg }}
                >
                    {icon}
                </div>
                <span
                    className={styles.insightLabel}
                    style={{ color: colorStyle.text }}
                >
                    {label}
                </span>
            </div>
            <div className={styles.insightContent}>
                {children}
            </div>
        </div>
    );
}

export default Card;
