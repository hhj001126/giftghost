'use client';
import { motion } from 'framer-motion';
import styles from './Background.module.scss';

// Particle configuration type
export interface ParticleConfig {
    color: 'coral20' | 'coral15' | 'mint20' | 'mint15' | 'lavender20' | 'lavender15' | 'sunshine20' | 'sunshine15';
    size: 'size12' | 'size16' | 'size20' | 'size24' | 'size28' | 'size32' | 'size36' | 'size40';
    delay: number;
    x: number;
    y: number;
}

export interface BackgroundParticlesProps {
    particles?: ParticleConfig[];
    count?: number;
}

const defaultParticles: ParticleConfig[] = [
    { color: 'coral20', size: 'size32', delay: 0, x: 10, y: 15 },
    { color: 'mint20', size: 'size24', delay: 1, x: 80, y: 20 },
    { color: 'lavender20', size: 'size40', delay: 2, x: 25, y: 70 },
    { color: 'sunshine20', size: 'size20', delay: 0.5, x: 70, y: 75 },
    { color: 'coral15', size: 'size16', delay: 1.5, x: 50, y: 10 },
    { color: 'mint15', size: 'size28', delay: 2.5, x: 85, y: 50 },
    { color: 'lavender15', size: 'size12', delay: 3, x: 15, y: 45 },
    { color: 'sunshine15', size: 'size36', delay: 1, x: 35, y: 85 },
];

export function BackgroundParticles({ particles = defaultParticles }: BackgroundParticlesProps) {
    return (
        <div className={styles.background}>
            {particles.map((particle, i) => (
                <motion.div
                    key={i}
                    className={`${styles.particle} ${styles[particle.color]} ${styles[particle.size]}`}
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                        scale: [0, 1.2, 0.9, 1],
                        opacity: [0, 0.6, 0.4, 0.6],
                        x: [0, 20, -20, 10, 0],
                        y: [0, -30, 20, -10, 0],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        delay: particle.delay,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
}

// Shape configuration
export interface ShapeConfig {
    icon: string;
    delay: number;
    x: number;
    y: number;
}

export interface FloatingShapesProps {
    shapes?: ShapeConfig[];
}

const defaultShapes: ShapeConfig[] = [
    { icon: '✨', delay: 0, x: 8, y: 20 },
    { icon: '💫', delay: 1, x: 90, y: 15 },
    { icon: '🌟', delay: 2, x: 75, y: 80 },
    { icon: '⭐', delay: 0.5, x: 20, y: 75 },
    { icon: '💖', delay: 1.5, x: 50, y: 90 },
    { icon: '🎁', delay: 2.5, x: 85, y: 35 },
];

export function FloatingShapes({ shapes = defaultShapes }: FloatingShapesProps) {
    return (
        <div className={styles.shapesContainer}>
            {shapes.map((shape, i) => (
                <motion.div
                    key={i}
                    className={styles.shape}
                    style={{
                        left: `${shape.x}%`,
                        top: `${shape.y}%`,
                    }}
                    initial={{ scale: 0, opacity: 0, rotate: -180 }}
                    animate={{
                        scale: [0.8, 1.2, 0.8],
                        opacity: [0, 0.7, 0],
                        rotate: [-180, 0, 180],
                        y: [0, -20, 0],
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        delay: shape.delay,
                        ease: "easeInOut",
                    }}
                >
                    {shape.icon}
                </motion.div>
            ))}
        </div>
    );
}

// Gradient mesh background
export function GradientMesh() {
    return (
        <div className={styles.gradientMesh}>
            <div className={`${styles.gradientOrb} ${styles.orb1}`} />
            <div className={`${styles.gradientOrb} ${styles.orb2}`} />
            <div className={`${styles.gradientOrb} ${styles.orb3}`} />
        </div>
    );
}

// Noise texture overlay
export function NoiseOverlay() {
    return <div className={styles.noiseOverlay} />;
}

// Full background with all effects
export interface FullBackgroundProps {
    showParticles?: boolean;
    showShapes?: boolean;
    showGradient?: boolean;
    showNoise?: boolean;
}

export function FullBackground({
    showParticles = true,
    showShapes = true,
    showGradient = false,
    showNoise = false,
}: FullBackgroundProps) {
    return (
        <>
            {showGradient && <GradientMesh />}
            {showParticles && <BackgroundParticles />}
            {showShapes && <FloatingShapes />}
            {showNoise && <NoiseOverlay />}
        </>
    );
}

export default FullBackground;
