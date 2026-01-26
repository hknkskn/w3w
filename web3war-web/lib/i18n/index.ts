/**
 * i18n Core System for Web3War
 * Lightweight client-side internationalization with 8 languages
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Import all locale files
import en from './locales/en.json';
import tr from './locales/tr.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import ru from './locales/ru.json';
import zh from './locales/zh.json';

// Language configuration
export const LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
    { code: 'es', name: 'Español', flag: '🇪🇸', dir: 'ltr' },
    { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺', dir: 'ltr' },
    { code: 'zh', name: '中文', flag: '🇨🇳', dir: 'ltr' },
] as const;

export type LanguageCode = typeof LANGUAGES[number]['code'];

// Locale data map
const locales: Record<LanguageCode, any> = {
    en, tr, es, fr, de, ru, zh
};

// Language store with persistence
interface LanguageState {
    language: LanguageCode;
    setLanguage: (code: LanguageCode) => void;
}

export const useLanguageStore = create<LanguageState>()(
    persist(
        (set) => ({
            language: 'en',
            setLanguage: (code) => set({ language: code }),
        }),
        {
            name: 'w3w-language',
        }
    )
);

/**
 * Get nested translation value by dot notation key
 */
const getNestedValue = (obj: any, path: string): string => {
    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
        if (current?.[key] === undefined) {
            return path; // Return key as fallback
        }
        current = current[key];
    }

    return current;
};

/**
 * Translation hook - returns the t() function
 */
export function useTranslation() {
    const language = useLanguageStore((state) => state.language);
    const setLanguage = useLanguageStore((state) => state.setLanguage);

    const t = (key: string, params?: Record<string, string | number>, fallback?: string): string => {
        const locale = locales[language] || locales.en;
        let value = getNestedValue(locale, key);

        // If not found in current language, try English fallback
        if (value === key && language !== 'en') {
            const enValue = getNestedValue(locales.en, key);
            value = enValue !== key ? enValue : (fallback || key);
        } else {
            value = value !== key ? value : (fallback || key);
        }

        // Apply parameters if any
        if (params && value) {
            Object.entries(params).forEach(([k, v]) => {
                value = value.replace(`{${k}}`, String(v));
            });
        }

        return value;
    };

    const currentLanguage = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

    return {
        t,
        language,
        setLanguage,
        currentLanguage,
        isRTL: (currentLanguage.dir as any) === 'rtl',
        languages: LANGUAGES,
    };
}

/**
 * Non-hook translation function for use outside React components
 */
export function t(key: string, params?: Record<string, string | number>, lang?: LanguageCode): string {
    const language = lang || useLanguageStore.getState().language;
    const locale = locales[language] || locales.en;
    let value = getNestedValue(locale, key);

    if (value === key && language !== 'en') {
        value = getNestedValue(locales.en, key);
    }

    if (params && value) {
        Object.entries(params).forEach(([k, v]) => {
            value = value.replace(`{${k}}`, String(v));
        });
    }

    return value;
}
