'use client';
import { motion } from 'framer-motion';
import styles from './ProgressBar.module.scss';

interface ProgressBarProps {
    progress: number; // 0-100
}

export function ProgressBar({ progress }: ProgressBarProps) {
    return (
        <motion.div
            className={styles.progressBarWrapper}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
        >
            <div className={styles.progressBarBg}>
                <motion.div
                    className={styles.progressBarFill}
                    initial={{ width: '0%' }}
                    animate={{ width: `${Math.min(progress, 98)}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>
            <span className={styles.progressText}>{Math.round(Math.min(progress, 98))}%</span>
        </motion.div>
    );
}
