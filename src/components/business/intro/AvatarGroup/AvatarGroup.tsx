'use client';
import styles from './AvatarGroup.module.scss';

export function AvatarGroup() {
    return (
        <div className={styles.avatarGroup}>
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className={styles.avatar} />
            ))}
        </div>
    );
}
