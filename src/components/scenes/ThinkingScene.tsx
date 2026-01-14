'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Gift, Star, Zap } from 'lucide-react';
import { Card, SceneWrapper, Badge } from '@/components/ui';
import styles from './ThinkingScene.module.scss';

const thinkingLogs = [
    "Reading between the lines...",
    "Finding hidden gems...",
    "Consulting the gift oracle...",
    "Analyzing preferences...",
    "Connecting the dots...",
    "Almost there!",
];

// Bouncing Gift Box Component
function GiftBox({ showEmoji }: { showEmoji: number }) {
    return (
        <motion.div
            className={styles.giftContainer}
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        >
            {/* Gift box */}
            <motion.div
                className={styles.giftBody}
                animate={{ rotate: [-3, 3, -3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
                <Gift />
            </motion.div>

            {/* Ribbon */}
            <motion.div
                className={styles.ribbon}
                animate={{ scaleX: [1, 1.05, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
            />

            {/* Rotating emoji */}
            <motion.div
                className={styles.rotatingEmoji}
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
                {['🎁', '✨', '💡', '🎀'][showEmoji]}
            </motion.div>

            {/* Orbiting sparkles */}
            <OrbitingSparkles />
        </motion.div>
    );
}

// Orbiting sparkles component
function OrbitingSparkles() {
    const positions = [0, 90, 180, 270];

    return (
        <div className={styles.orbitingSparkles}>
            {positions.map((angle, i) => (
                <motion.div
                    key={i}
                    className={styles.sparkleOrbit}
                    style={{ marginLeft: -4, marginTop: -4 }}
                    animate={{
                        x: Math.cos((angle * Math.PI) / 180) * 70,
                        y: Math.sin((angle * Math.PI) / 180) * 70,
                        scale: [0.8, 1.2, 0.8],
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.3,
                    }}
                >
                    <Sparkles style={{ width: 16, height: 16 }} />
                </motion.div>
            ))}
        </div>
    );
}

// Progress bar component
function ProgressBar({ progress }: { progress: number }) {
    return (
        <div className={styles.progressContainer}>
            <motion.div
                className={styles.progressBar}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
            />
        </div>
    );
}

// Rotating log text
function RotatingLog({ logIndex }: { logIndex: number }) {
    return (
        <div className={styles.logContainer}>
            <motion.p
                key={logIndex}
                className={styles.logText}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
            >
                {thinkingLogs[logIndex]}
            </motion.p>
        </div>
    );
}

// Encouragement dots
function EncouragementDots() {
    return (
        <div className={styles.encouragementDots}>
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className={styles.dot}
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                    }}
                />
            ))}
        </div>
    );
}

export function ThinkingScene() {
    const [logIndex, setLogIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [showEmoji, setShowEmoji] = useState(0);

    useEffect(() => {
        const logInterval = setInterval(() => {
            setLogIndex((prev) => (prev + 1) % thinkingLogs.length);
        }, 1200);

        const progressInterval = setInterval(() => {
            setProgress((prev) => Math.min(prev + 3, 90));
        }, 100);

        const emojiInterval = setInterval(() => {
            setShowEmoji((prev) => (prev + 1) % 4);
        }, 800);

        return () => {
            clearInterval(logInterval);
            clearInterval(progressInterval);
            clearInterval(emojiInterval);
        };
    }, []);

    return (
        <SceneWrapper variant="fade" className={styles.scene}>
            {/* Main Animation Container */}
            <div className={styles.animationContainer}>
                <GiftBox showEmoji={showEmoji} />
                <ProgressBar progress={progress} />
            </div>

            {/* Status Text */}
            <div className={styles.statusContainer}>
                <Badge variant="primary" pulse icon={<Zap size={16} />}>
                    Magic in progress...
                </Badge>
                <RotatingLog logIndex={logIndex} />
            </div>

            {/* Fun Facts Card */}
            <Card variant="elevated" padding="lg" className={styles.funFactCard}>
                <div className={styles.funFactHeader}>
                    <Star />
                    <span>Did you know?</span>
                </div>
                <p className={styles.funFactContent}>
                    The average person spends <span className={styles.highlight}>7 hours</span> searching for the perfect gift. We're here to fix that! 🎯
                </p>
            </Card>

            {/* Encouragement dots */}
            <EncouragementDots />
        </SceneWrapper>
    );
}

export default ThinkingScene;
