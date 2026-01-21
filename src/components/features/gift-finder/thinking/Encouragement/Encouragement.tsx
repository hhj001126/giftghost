'use client';
import { motion } from 'framer-motion';
import styles from './Encouragement.module.scss';

export function Encouragement() {
    const encouragements = ['🎁', '💡', '🌟', '🎀'];
    return (
        <div className={styles.encouragement}>
            {encouragements.map((emoji, i) => (
                <motion.span
                    key={i}
                    className={styles.encouragementEmoji}
                    animate={{
                        y: [0, -8, 0],
                        opacity: [0.3, 0.8, 0.3],
                    }}
                    transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        delay: i * 0.4,
                    }}
                >
                    {emoji}
                </motion.span>
            ))}
        </div>
    );
}
