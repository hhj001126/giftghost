'use client';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n';
import styles from './FunFactCard.module.scss';

export function FunFactCard() {
    const { t } = useI18n();

    return (
        <motion.div
            className={styles.funFactCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
        >
            <div className={styles.funFactHeader}>
                <span>💡</span>
                <span>{t.thinking.funFact.header}</span>
            </div>
            <p className={styles.funFactContent}>
                {t.thinking.funFact.content}
                <span className={styles.highlight}>{t.thinking.funFact.highlight}</span>
                {t.thinking.funFact.suffix}
            </p>
        </motion.div>
    );
}
