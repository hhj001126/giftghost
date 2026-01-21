'use client';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import styles from './SparkleParticles.module.scss';

export function SparkleParticles() {
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
