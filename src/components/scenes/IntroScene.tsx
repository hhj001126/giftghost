'use client';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Button, SceneWrapper } from '@/components/ui';
import { useI18n } from '@/i18n';
import { GiftBox, AvatarGroup } from '@/components/business/intro';
import styles from './IntroScene.module.scss';

interface IntroSceneProps {
    onNext: () => void;
}

export function IntroScene({ onNext }: IntroSceneProps) {
    const { t } = useI18n();

    return (
        <SceneWrapper centered variant="scale" className={styles.scene}>
            {/* Hero Icon - Animated Gift Box */}
            <motion.div
                className={styles.heroContainer}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.1
                }}
            >
                <GiftBox />
            </motion.div>

            {/* Logo */}
            <motion.h1
                className={styles.logo}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <span className={styles.coralPart}>{t.intro.title.slice(0, 4)}</span>
                <span className={styles.mintPart}>{t.intro.title.slice(4)}</span>
            </motion.h1>

            {/* Tagline */}
            <motion.p
                className={styles.tagline}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                {t.intro.subtitle}
            </motion.p>

            {/* CTA Button */}
            <motion.div
                className={styles.ctaWrapper}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <Button
                    variant="primary"
                    size="lg"
                    icon={<Heart />}
                    showShimmer
                    floatingHearts
                    onClick={onNext}
                >
                    {t.intro.cta}
                </Button>
            </motion.div>

            {/* Social proof */}
            <motion.div
                className={styles.socialProof}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
            >
                <AvatarGroup />
                <span>{t.intro.socialProof}</span>
            </motion.div>
        </SceneWrapper>
    );
}

export default IntroScene;
