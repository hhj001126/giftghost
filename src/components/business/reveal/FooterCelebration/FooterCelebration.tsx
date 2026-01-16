'use client';
import { useI18n } from '@/i18n';
import styles from './FooterCelebration.module.scss';

export function FooterCelebration() {
    const { t } = useI18n();
    return (
        <div className={styles.footer}>
            <span>🎉</span>
            <span>{t.reveal.footer.text}</span>
            <span>🎉</span>
        </div>
    );
}
