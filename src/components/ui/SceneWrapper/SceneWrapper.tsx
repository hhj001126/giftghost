'use client';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import styles from './SceneWrapper.module.scss';

export interface SceneWrapperProps {
    children: ReactNode;
    variant?: 'fade' | 'slide' | 'scale' | 'none';
    centered?: boolean;
    fullWidth?: boolean;
    className?: string;
    key?: string;
}

// Transition variants with proper typing
const transitionVariants = {
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.4 },
    },
    slide: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.4, ease: "easeOut" as const },
    },
    scale: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.9 },
        transition: { duration: 0.4, ease: "easeOut" as const },
    },
    none: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0 },
    },
};

export function SceneWrapper({
    children,
    variant = 'fade',
    centered = false,
    fullWidth = false,
    className = '',
    key,
}: SceneWrapperProps) {
    const classNames = [
        styles.sceneWrapper,
        centered ? styles.centered : '',
        fullWidth ? styles.fullWidth : '',
        className,
    ].filter(Boolean).join(' ');

    const variantStyle = styles[variant] || styles.fade;
    const transition = transitionVariants[variant];

    return (
        <motion.div
            key={key}
            className={`${classNames} ${variantStyle}`}
            initial={transition.initial}
            animate={transition.animate}
            exit={transition.exit}
            transition={transition.transition}
        >
            {children}
        </motion.div>
    );
}

// Stagger animation wrapper for lists
export interface StaggerContainerProps {
    children: ReactNode;
    className?: string;
}

export function StaggerContainer({ children, className = '' }: StaggerContainerProps) {
    return (
        <motion.div
            className={`${styles.staggerContainer} ${className}`}
            variants={{
                hidden: { opacity: 0 },
                show: {
                    opacity: 1,
                    transition: {
                        staggerChildren: 0.12,
                        delayChildren: 0.2,
                    }
                }
            }}
            initial="hidden"
            animate="show"
        >
            {children}
        </motion.div>
    );
}

// Stagger item
export interface StaggerItemProps {
    children: ReactNode;
    className?: string;
}

export function StaggerItem({ children, className = '' }: StaggerItemProps) {
    return (
        <motion.div
            className={`${styles.staggerItem} ${className}`}
            variants={{
                hidden: { opacity: 0, y: 30, scale: 0.9 },
                show: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                        type: "spring" as const,
                        stiffness: 200,
                        damping: 20
                    }
                }
            }}
        >
            {children}
        </motion.div>
    );
}

// Loading placeholder
export function SceneLoading({ height = 200 }: { height?: number }) {
    return (
        <div className={styles.loading} style={{ minHeight: height }}>
            <div className={styles.skeleton} style={{ width: '100%', height: '100%', minHeight: height }} />
        </div>
    );
}

export default SceneWrapper;
