'use client';
import { Trophy } from 'lucide-react';
import { useMemo } from 'react';
import { Badge, StaggerContainer, StaggerItem } from '@/components/ui';
import { useI18n } from '@/i18n';
import { InsightResult } from '@/types/insight';
import {
    CelebrationConfetti,
    FeedbackButtons,
    InsightCard,
    GiftHeroCard,
    ActionButtons,
    FooterCelebration,
} from '@/components/business/reveal';
import styles from './RevealScene.module.scss';

interface RevealSceneProps {
    result: InsightResult;
    onReset: () => void;
}


export function RevealScene({ result, onReset }: RevealSceneProps) {
    const { t } = useI18n();

    // Memoize icon elements to prevent unnecessary re-renders
    const painIcon = useMemo(() => <span>💔</span>, []);
    const diamondIcon = useMemo(() => <span>💎</span>, []);

    return (
        <div className={styles.scene}>
            <CelebrationConfetti />

            {/* Success Header */}
            <StaggerContainer>
                <StaggerItem>
                    <div className={styles.successHeader}>
                        <Badge variant="success" pulse icon={<Trophy size={16} />}>
                            {t.reveal.badge}
                        </Badge>
                        <h2 className={styles.personaTitle}>
                            {result.persona}
                        </h2>
                        <p className={styles.personaSubtitle}>{t.reveal.personaTitle}</p>
                    </div>
                </StaggerItem>

                {/* Insight Cards */}
                <StaggerItem>
                    <div className={styles.insightGrid}>
                        <InsightCard
                            icon={painIcon}
                            label={t.reveal.insightLabels.painPoint}
                            content={result.pain_point}
                            color="coral"
                        />
                        <InsightCard
                            icon={diamondIcon}
                            label={t.reveal.insightLabels.obsession}
                            content={result.obsession}
                            color="lavender"
                        />
                    </div>
                </StaggerItem>

                {/* Gift Recommendation */}
                <StaggerItem className={styles.giftHeroCardContainer}>
                    <GiftHeroCard result={result} />
                    {/* Feedback - Top Right Corner */}
                    <FeedbackButtons result={result} />
                </StaggerItem>

                {/* Actions */}
                <StaggerItem>
                    <ActionButtons onReset={onReset} />
                </StaggerItem>

                {/* Footer */}
                <StaggerItem>
                    <FooterCelebration />
                </StaggerItem>
            </StaggerContainer>
        </div>
    );
}

export default RevealScene;
