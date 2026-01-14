'use client';
import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import styles from './Button.module.scss';

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    disabled?: boolean;
    loading?: boolean;
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
    showShimmer?: boolean;
    floatingHearts?: boolean;
    onClick?: () => void;
}

// Icon wrapper component for consistent sizing
const IconWrapper = ({ children, size }: { children: ReactNode; size: string }) => {
    const iconSize = size === 'sm' ? 16 : size === 'lg' ? 28 : 24;
    return (
        <span style={{ width: iconSize, height: iconSize, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {children}
        </span>
    );
};

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    disabled = false,
    loading = false,
    icon,
    iconPosition = 'left',
    showShimmer = false,
    floatingHearts = false,
    className = '',
    onClick,
    ...props
}: ButtonProps) {
    const classNames = [
        styles.button,
        styles[variant],
        styles[size],
        fullWidth ? styles.fullWidth : '',
        iconPosition === 'left' ? styles.withIconLeft : styles.withIconRight,
        className,
    ].filter(Boolean).join(' ');

    return (
        <motion.button
            className={classNames}
            disabled={disabled || loading}
            onClick={onClick}
            whileHover={!disabled && !loading ? { scale: 1.02 } : undefined}
            whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
            {...props}
        >
            {/* Shimmer effect */}
            {showShimmer && variant === 'primary' && (
                <div className={styles.shimmer} />
            )}

            {/* Button content */}
            <span className={styles.content}>
                {loading ? (
                    <motion.span
                        className={styles.spinner}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                    </motion.span>
                ) : (
                    <>
                        {icon && iconPosition === 'left' && (
                            <IconWrapper size={size}>{icon}</IconWrapper>
                        )}
                        <span>{children}</span>
                        {icon && iconPosition === 'right' && (
                            <IconWrapper size={size}>{icon}</IconWrapper>
                        )}
                    </>
                )}
            </span>

            {/* Floating hearts on hover (for primary buttons) */}
            {floatingHearts && variant === 'primary' && !disabled && !loading && (
                <motion.div
                    className={styles.floatingElements}
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                >
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className={styles.floatingItem}
                            style={{
                                left: `${20 + i * 30}%`,
                            }}
                            animate={{
                                y: [0, -30],
                                opacity: [0, 1, 0],
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2,
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </motion.button>
    );
}

export default Button;
