'use client';
import { RefreshCw, Share2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { useI18n } from '@/i18n';
import styles from './ActionButtons.module.scss';

interface ActionButtonsProps {
    onReset: () => void;
}

export function ActionButtons({ onReset }: ActionButtonsProps) {
    const { t } = useI18n();
    
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: t.stage.share.title,
                text: t.stage.share.text,
            });
        }
    };

    return (
        <div className={styles.actions}>
            <Button variant="secondary" icon={<RefreshCw />} onClick={onReset}>
                {t.reveal.actions.tryAnother}
            </Button>
            <Button variant="secondary" icon={<Share2 />} onClick={handleShare}>
                {t.reveal.actions.share}
            </Button>
        </div>
    );
}
