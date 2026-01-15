'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Import translations
import { zhCN } from './locales/zh-CN';
import { en } from './locales/en';
import { zhHK } from './locales/zh-HK';

export type Locale = 'zh-CN' | 'en' | 'zh-HK';

export interface LocaleConfig {
  code: Locale;
  name: string;
  nativeName: string;
  flag: string;
  fontFamily: string;
}

export const SUPPORTED_LOCALES: LocaleConfig[] = [
  {
    code: 'zh-CN',
    name: '简体中文',
    nativeName: '简体中文',
    flag: '🇨🇳',
    fontFamily: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    fontFamily: '"Bubblegum Sans", "Quicksand", system-ui, sans-serif',
  },
  {
    code: 'zh-HK',
    name: '繁體中文',
    nativeName: '繁體中文',
    flag: '🇭🇰',
    fontFamily: '"Noto Sans TC", "PingFang HK", "Microsoft JhengHei", sans-serif',
  },
];

export type Translations = typeof zhCN;

export const translations: Record<Locale, Translations> = {
  'zh-CN': zhCN,
  'en': en,
  'zh-HK': zhHK,
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
  supportedLocales: LocaleConfig[];
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('zh-CN');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize locale from localStorage or browser preference
  useEffect(() => {
    const savedLocale = localStorage.getItem('giftghost-locale') as Locale | null;

    if (savedLocale && SUPPORTED_LOCALES.some(l => l.code === savedLocale)) {
      setLocaleState(savedLocale);
    } else {
      // Detect browser language
      const browserLang = navigator.language;
      if (browserLang.startsWith('zh-HK') || browserLang.startsWith('zh-TW')) {
        setLocaleState('zh-HK');
      } else if (browserLang.startsWith('zh')) {
        setLocaleState('zh-CN');
      } else {
        setLocaleState('en');
      }
    }

    setIsInitialized(true);
  }, []);

  // Save locale preference and update CSS variable
  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('giftghost-locale', newLocale);

    // Update CSS variable for font-family
    const config = SUPPORTED_LOCALES.find(l => l.code === newLocale);
    if (config) {
      document.documentElement.style.setProperty('--locale-font-family', config.fontFamily);
      document.documentElement.lang = newLocale === 'zh-HK' ? 'zh-Hant' : newLocale;
    }
  };

  const value: I18nContextType = {
    locale,
    setLocale,
    t: translations[locale],
    supportedLocales: SUPPORTED_LOCALES,
  };

  // Prevent hydration mismatch
  if (!isInitialized) {
    return null;
  }

  return (
    <I18nContext.Provider value={value}>
      <div style={{ '--locale-font-family': SUPPORTED_LOCALES.find(l => l.code === locale)?.fontFamily } as React.CSSProperties}>
        {children}
      </div>
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Helper hook for formatted numbers, dates based on locale
export function useLocaleFormat() {
  const { locale } = useI18n();

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(locale === 'zh-HK' ? 'zh-Hant' : locale).format(num);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale === 'zh-HK' ? 'zh-Hant' : locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return { formatNumber, formatDate };
}
