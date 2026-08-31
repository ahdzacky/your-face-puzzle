import React from 'react';
import { Language } from '../i18n/translations';

interface LanguageSelectorProps {
    language: Language;
    onLanguageChange: (lang: Language) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ language, onLanguageChange }) => {
    return (
        <div className="flex items-center gap-1 bg-[#090f1d]/80 backdrop-blur-md p-1 rounded-full border border-gray-700/80 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <button
                id="btn-lang-en"
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`px-3 py-1 rounded-full text-xs sm:text-sm font-black tracking-wider transition-all duration-300 cursor-pointer ${
                    language === 'en'
                        ? 'bg-[#00f0ff] text-black shadow-[0_0_12px_rgba(0,240,255,0.9)]'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
            >
                EN
            </button>
            <button
                id="btn-lang-id"
                type="button"
                onClick={() => onLanguageChange('id')}
                className={`px-3 py-1 rounded-full text-xs sm:text-sm font-black tracking-wider transition-all duration-300 cursor-pointer ${
                    language === 'id'
                        ? 'bg-[#ff2a85] text-white shadow-[0_0_12px_rgba(255,42,133,0.9)]'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
            >
                ID
            </button>
        </div>
    );
};
