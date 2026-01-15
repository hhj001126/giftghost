'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown } from 'lucide-react';
import { useI18n, SUPPORTED_LOCALES } from '@/i18n';
import styles from './LanguageSwitcher.module.scss';

export function LanguageSwitcher() {
  const { locale, setLocale, supportedLocales } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLocale = supportedLocales.find(l => l.code === locale)!;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: string) => {
    setLocale(code as typeof locale);
    setIsOpen(false);
  };

  return (
    <div className={styles.switcher} ref={dropdownRef}>
      <motion.button
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Globe size={18} className={styles.globeIcon} />
        <span className={styles.currentFlag}>{currentLocale.flag}</span>
        {/* <span className={styles.currentName}>{currentLocale.nativeName}</span> */}
        <ChevronDown
          size={14}
          className={`${styles.chevron} ${isOpen ? styles.open : ''}`}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.dropdown}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', duration: 0.2 }}
          >
            <div className={styles.arrow} />

            {supportedLocales.map((loc) => (
              <motion.button
                key={loc.code}
                className={`${styles.option} ${loc.code === locale ? styles.active : ''}`}
                onClick={() => handleSelect(loc.code)}
                whileHover={{ x: 4 }}
              >
                <span className={styles.optionFlag}>{loc.flag}</span>
                <span className={styles.optionName}>{loc.nativeName}</span>
                {loc.code === locale && (
                  <motion.div
                    className={styles.checkmark}
                    layoutId="activeLocale"
                    transition={{ type: 'spring', duration: 0.2 }}
                  >
                    ✓
                  </motion.div>
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LanguageSwitcher;
