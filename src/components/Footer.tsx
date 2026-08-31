import React from 'react';
import { Language, translations } from '../i18n/translations';

interface FooterProps {
    language?: Language;
}

export const Footer: React.FC<FooterProps> = ({ language = 'en' }) => {
    const t = translations[language];

    return (
        <footer className="w-full mt-auto pt-6 pb-3 px-3 sm:px-6 md:px-8 flex flex-col items-center justify-center gap-3 text-xs sm:text-sm md:text-base text-gray-400 font-medium shrink-0 text-center">
            {/* Creator Name */}
            <div>
                {t.createdBy} <span className="text-white font-semibold tracking-wide">Ahmad Miftahul Zaki</span>
            </div>

            {/* Social Media Rounded Icon Buttons */}
            <div className="flex items-center gap-3 sm:gap-4">
                {/* LinkedIn (Leftmost) */}
                <a
                    href="https://www.linkedin.com/in/ahdzacky/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn Profile"
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-[#090f1d]/80 backdrop-blur-md border border-gray-700/70 text-gray-400 hover:text-[#00f0ff] hover:border-[#00f0ff] hover:bg-[#00f0ff]/10 hover:shadow-[0_0_15px_rgba(0,240,255,0.7)] transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer"
                >
                    <svg
                        className="w-5 h-5 sm:w-5 sm:h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                        <rect width="4" height="12" x="2" y="9"></rect>
                        <circle cx="4" cy="4" r="2"></circle>
                    </svg>
                </a>

                {/* GitHub */}
                <a
                    href="https://github.com/ahdzacky/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub Profile"
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-[#090f1d]/80 backdrop-blur-md border border-gray-700/70 text-gray-400 hover:text-white hover:border-white hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.7)] transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer"
                >
                    <svg
                        className="w-5 h-5 sm:w-5 sm:h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                    </svg>
                </a>

                {/* Instagram */}
                <a
                    href="https://www.instagram.com/ahdzacky/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram Profile"
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-[#090f1d]/80 backdrop-blur-md border border-gray-700/70 text-gray-400 hover:text-[#ff2a85] hover:border-[#ff2a85] hover:bg-[#ff2a85]/10 hover:shadow-[0_0_15px_rgba(255,42,133,0.7)] transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer"
                >
                    <svg
                        className="w-5 h-5 sm:w-5 sm:h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                    </svg>
                </a>
            </div>
        </footer>
    );
};
