'use client';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import styles from './Badge.module.scss';

export interface BadgeProps {
    children: ReactNode;
    variant?: 'primary' | 'success' | 'warning' | 'info' | 'lavender' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    pulse?: boolean;
    icon?: ReactNode;
    className?: string;
}

export function Badge({
    children,
    variant = 'primary',
    size = 'md',
    pulse = false,
    icon,
    className = '',
}: BadgeProps) {
    const classNames = [
        styles.badge,
        styles[variant],
        styles[size],
        pulse ? styles.pulse : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <motion.div
            className={classNames}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            {icon && <span className={styles.icon}>{icon}</span>}
            <span>{children}</span>
        </motion.div>
    );
}

// Simple status dot
export interface StatusDotProps {
    status?: 'online' | 'offline' | 'busy' | 'away';
    pulsing?: boolean;
    size?: number;
    className?: string;
}

export function StatusDot({
    status = 'online',
    pulsing = false,
    size = 8,
    className = '',
}: StatusDotProps) {
    return (
        <span
            className={`${styles.statusDot} ${styles[status]} ${pulsing ? styles.pulsing : ''} ${className}`}
            style={{ width: size, height: size }}
        />
    );
}

export default Badge;
