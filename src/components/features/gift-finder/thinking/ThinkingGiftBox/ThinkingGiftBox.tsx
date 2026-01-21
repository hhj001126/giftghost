'use client';
import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import styles from './ThinkingGiftBox.module.scss';

export function ThinkingGiftBox() {
    return (
        <motion.div
            className={styles.giftContainer}
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        >
            <motion.div
                className={styles.giftBody}
                animate={{ rotate: [-4, 4, -4] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
                <Gift size={32} />
            </motion.div>
            <motion.div
                className={styles.ribbon}
                animate={{ scaleX: [1, 1.08, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
            />
            <motion.div
                className={styles.sparkleRing}
                animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
            />
        </motion.div>
    );
}
