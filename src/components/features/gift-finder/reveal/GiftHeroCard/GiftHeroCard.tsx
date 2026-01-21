'use client';
import { useMemo } from 'react';
import { ShoppingBag } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { useI18n } from '@/i18n';
import { InsightResult } from '@/types/insight';
import { transformBuyLink } from '@/lib/affiliate';
import styles from './GiftHeroCard.module.scss';

interface GiftHeroCardProps {
    result: InsightResult;
}

export function GiftHeroCard({ result }: GiftHeroCardProps) {
    const { t } = useI18n();

    // Memoize transformed buy link to avoid recalculating on every render
    const buyLink = useMemo(() =>
        transformBuyLink(result.gift_recommendation.buy_link),
        [result.gift_recommendation.buy_link]
    );

    return (
        <Card variant="hero" padding="lg" className={styles.giftHeroCard}>
            <div className={styles.cardHeader}>
                <span>{t.reveal.giftCard.label}</span>
            </div>

            <h3 className={styles.giftTitle}>
                {result.gift_recommendation.item}
            </h3>

            <div className={styles.reasonBox}>
                <p>"{result.gift_recommendation.reason}"</p>
            </div>

            {result.gift_recommendation.price_range && (
                <p className={styles.priceRange}>
                    {t.reveal.giftCard.priceLabel} {result.gift_recommendation.price_range}
                </p>
            )}

            <Button
                variant="secondary"
                size="lg"
                fullWidth
                icon={<ShoppingBag />}
                iconPosition="left"
                onClick={() => window.open(buyLink, '_blank')}
            >
                {t.reveal.giftCard.findButton}
            </Button>
        </Card>
    );
}
