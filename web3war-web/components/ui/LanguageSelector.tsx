'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useTranslation, LANGUAGES, LanguageCode } from '@/lib/i18n';

interface LanguageSelectorProps {
    variant?: 'footer' | 'register' | 'compact';
    className?: string;
}

export function LanguageSelector({ variant = 'footer', className = '' }: LanguageSelectorProps) {
    const { language, setLanguage, currentLanguage, t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (code: LanguageCode) => {
        setLanguage(code);
        setIsOpen(false);

        // Update HTML dir attribute for RTL languages
        const lang = LANGUAGES.find(l => l.code === code);
        if (lang) {
            document.documentElement.dir = lang.dir;
            document.documentElement.lang = code;
        }
    };

    if (variant === 'compact') {
        return (
            <div className={`relative ${className}`}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-1.5 px-2 py-1 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 rounded-lg text-xs text-slate-300 hover:text-white transition-all"
                >
                    <span>{currentLanguage.flag}</span>
                    <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="absolute bottom-full mb-1 right-0 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50 min-w-[120px]"
                        >
                            {LANGUAGES.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleSelect(lang.code)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-800 transition-colors ${language === lang.code ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-300'
                                        }`}
                                >
                                    <span>{lang.flag}</span>
                                    <span className="flex-1 text-left">{lang.name}</span>
                                    {language === lang.code && <Check size={12} className="text-cyan-400" />}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    if (variant === 'register') {
        return (
            <div className={`space-y-2 ${className}`}>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {t('register.language')}
                </label>
                <div className="grid grid-cols-4 gap-2">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleSelect(lang.code)}
                            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${language === lang.code
                                    ? 'bg-cyan-500/20 border-2 border-cyan-500/50 text-cyan-400'
                                    : 'bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600'
                                }`}
                        >
                            <span className="text-base">{lang.flag}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // Footer variant (default)
    return (
        <div className={`relative inline-block ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-xs text-slate-500 hover:text-cyan-400 transition-colors font-medium"
            >
                <Globe size={12} />
                <span>{currentLanguage.flag} {currentLanguage.name}</span>
                <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 min-w-[180px]"
                        >
                            <div className="p-2 border-b border-slate-800">
                                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2">
                                    {t('footer.language')}
                                </div>
                            </div>
                            <div className="p-1 max-h-[300px] overflow-y-auto">
                                {LANGUAGES.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => handleSelect(lang.code)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-slate-800 transition-colors ${language === lang.code ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-300'
                                            }`}
                                    >
                                        <span className="text-lg">{lang.flag}</span>
                                        <span className="flex-1 text-left font-medium">{lang.name}</span>
                                        {language === lang.code && <Check size={14} className="text-cyan-400" />}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

export default LanguageSelector;
