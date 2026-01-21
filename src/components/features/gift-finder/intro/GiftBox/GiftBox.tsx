'use client';
import { motion } from 'framer-motion';
import { Gift, Sparkles } from 'lucide-react';
import { SparkleParticles } from '../SparkleParticles';
import styles from './GiftBox.module.scss';

export function GiftBox() {
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
