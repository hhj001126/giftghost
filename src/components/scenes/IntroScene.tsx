'use client';
import { motion } from 'framer-motion';
import { Sparkles, Gift, Heart } from 'lucide-react';
import { Button, SceneWrapper } from '@/components/ui';
import styles from './IntroScene.module.scss';

interface IntroSceneProps {
    onNext: () => void;
}

// Gift box animation component
function GiftBox() {
    return (
        <motion.div
            className={styles.giftBox}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
            {/* Gift box body */}
            <div className={styles.giftBody}>
                <Gift />
            </div>

            {/* Ribbon horizontal */}
            <motion.div
                className={styles.ribbonHorizontal}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
            />

            {/* Ribbon vertical */}
            <motion.div
                className={styles.ribbonVertical}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.7, duration: 0.3 }}
            />

            {/* Bow */}
            <motion.div
                className={styles.bow}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.9, type: "spring" }}
            >
                <div className={styles.bowLoop}>
                    <motion.div
                        className={styles.bowLoopLeft}
                        animate={{ rotate: [-20, 20, -20] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    />
                    <motion.div
                        className={styles.bowLoopRight}
                        animate={{ rotate: [20, -20, 20] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    />
                </div>
                <div className={styles.sparkleIcon}>
                    <Sparkles />
                </div>
            </motion.div>

            {/* Sparkle particles */}
            <SparkleParticles />
        </motion.div>
    );
}

// Sparkle particles around the gift
function SparkleParticles() {
    const sparkles = [
        { x: -60, y: -20, delay: 0, color: 'sunshine' },
        { x: 60, y: -30, delay: 0.2, color: 'sunshine' },
        { x: -50, y: 40, delay: 0.4, color: 'coralLight' },
        { x: 55, y: 35, delay: 0.6, color: 'coralLight' },
        { x: 0, y: -55, delay: 0.8, color: 'mint' },
    ];

    return (
        <div className={styles.sparkleParticles}>
            {sparkles.map((s, i) => (
                <motion.div
                    key={i}
                    className={`${styles.sparkleItem} ${styles[s.color as keyof typeof styles]}`}
                    style={{ x: s.x, y: s.y }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                        rotate: [0, 90, 180],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: s.delay,
                        ease: "easeInOut",
                    }}
                >
                    <Sparkles style={{ width: 16, height: 16 }} />
                </motion.div>
            ))}
        </div>
    );
}

// Social proof avatar group
function AvatarGroup() {
    return (
        <div className={styles.avatarGroup}>
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className={styles.avatar} />
            ))}
        </div>
    );
}

export function IntroScene({ onNext }: IntroSceneProps) {
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
                <span className={styles.coralPart}>Gift</span>
                <span className={styles.mintPart}>Ghost</span>
            </motion.h1>

            {/* Tagline */}
            <motion.p
                className={styles.tagline}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                Gift hunting made fun & easy!
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
                    Find a Gift
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
                <span>Loved by 10,000+ gift-givers</span>
            </motion.div>
        </SceneWrapper>
    );
}

export default IntroScene;
