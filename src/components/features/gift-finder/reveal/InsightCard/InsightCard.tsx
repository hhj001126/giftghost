'use client';
import { Card } from '@/components/ui';
import styles from './InsightCard.module.scss';

interface InsightCardProps {
    icon: React.ReactNode;
    label: string;
    content: string;
    color: 'coral' | 'lavender';
}

export function InsightCard({ icon, label, content, color }: InsightCardProps) {
    return (
        <Card variant="default" padding="md" className={styles.insightCard} interactive>
            <div className={`${styles.insightHeader} ${styles[`${color}Header`]}`}>
                <div className={`${styles.iconWrapper} ${styles[`${color}Icon`]}`}>
                    {icon}
                </div>
                <span className={`${styles.label} ${styles[`${color}Label`]}`}>
                    {label}
                </span>
            </div>
            <p className={styles.insightContent}>
                {content}
            </p>
        </Card>
    );
}
