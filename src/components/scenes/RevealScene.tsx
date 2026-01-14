'use client';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, RefreshCw, Share2, ExternalLink, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button, Card, Badge, StaggerContainer, StaggerItem } from '@/components/ui';
import styles from './RevealScene.module.scss';

interface InsightResult {
    persona: string;
    pain_point: string;
    obsession: string;
    gift_recommendation: {
        item: string;
        reason: string;
        buy_link: string;
        price_range?: string;
    };
}

interface RevealSceneProps {
    result: InsightResult;
    onReset: () => void;
}

// Celebration confetti effect
function CelebrationConfetti() {
    useEffect(() => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return null;
}

// Insight card component
function InsightCard({
    icon,
    label,
    content,
    color,
}: {
    icon: React.ReactNode;
    label: string;
    content: string;
    color: 'coral' | 'lavender';
}) {
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

// Gift hero card component
function GiftHeroCard({ result }: { result: InsightResult }) {
    return (
        <Card variant="hero" padding="lg" className={styles.giftHeroCard}>
            <div className={styles.cardHeader}>
                <Trophy size={20} />
                <span>PERFECT GIFT</span>
            </div>

            <h3 className={styles.giftTitle}>
                {result.gift_recommendation.item}
            </h3>

            <div className={styles.reasonBox}>
                <p>"{result.gift_recommendation.reason}"</p>
            </div>

            {result.gift_recommendation.price_range && (
                <p className={styles.priceRange}>
                    💰 {result.gift_recommendation.price_range}
                </p>
            )}

            <Button
                variant="secondary"
                size="lg"
                fullWidth
                icon={<ShoppingBag />}
                iconPosition="left"
                onClick={() => window.open(result.gift_recommendation.buy_link, '_blank')}
            >
                Find It Now
                <ExternalLink size={16} />
            </Button>
        </Card>
    );
}

// Action buttons component
function ActionButtons({ onReset }: { onReset: () => void }) {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'GiftGhost',
                text: 'I found the perfect gift!',
            });
        }
    };

    return (
        <div className={styles.actions}>
            <Button variant="secondary" icon={<RefreshCw />} onClick={onReset}>
                Try Another
            </Button>
            <Button variant="secondary" icon={<Share2 />} onClick={handleShare}>
                Share
            </Button>
        </div>
    );
}

// Footer celebration
function FooterCelebration() {
    return (
        <div className={styles.footer}>
            <span>🎉</span>
            <span>You're going to be the best gift-giver!</span>
            <span>🎉</span>
        </div>
    );
}

export function RevealScene({ result, onReset }: RevealSceneProps) {
    return (
        <div className={styles.scene}>
            <CelebrationConfetti />

            {/* Success Header */}
            <StaggerContainer>
                <StaggerItem>
                    <div className={styles.successHeader}>
                        <Badge variant="success" pulse icon={<Trophy size={16} />}>
                            We found something perfect!
                        </Badge>
                        <h2 className={styles.personaTitle}>
                            {result.persona}
                        </h2>
                        <p className={styles.personaSubtitle}>This is who your friend is! 🎉</p>
                    </div>
                </StaggerItem>

                {/* Insight Cards */}
                <StaggerItem>
                    <div className={styles.insightGrid}>
                        <InsightCard
                            icon={<span>💔</span>}
                            label="Pain Point"
                            content={result.pain_point}
                            color="coral"
                        />
                        <InsightCard
                            icon={<span>💎</span>}
                            label="Obsession"
                            content={result.obsession}
                            color="lavender"
                        />
                    </div>
                </StaggerItem>

                {/* Gift Recommendation */}
                <StaggerItem>
                    <GiftHeroCard result={result} />
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
