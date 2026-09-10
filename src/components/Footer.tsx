import React from 'react';
import { createLucideIcon, Globe } from 'lucide-react';
import { Language, translations } from '../i18n/translations';

const LinkedinIcon = createLucideIcon('Linkedin', [
    ['path', { d: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z', key: 'in-1' }],
    ['rect', { width: '4', height: '12', x: '2', y: '9', key: 'in-2' }],
    ['circle', { cx: '4', cy: '4', r: '2', key: 'in-3' }]
]);

const GithubIcon = createLucideIcon('Github', [
    ['path', { d: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22', key: 'gh-1' }]
]);

const InstagramIcon = createLucideIcon('Instagram', [
    ['rect', { width: '20', height: '20', x: '2', y: '2', rx: '5', ry: '5', key: 'ig-1' }],
    ['path', { d: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z', key: 'ig-2' }],
    ['line', { x1: '17.5', x2: '17.51', y1: '6.5', y2: '6.5', key: 'ig-3' }]
]);

const TiktokIcon = createLucideIcon('Tiktok', [
    ['path', { d: 'M21 7.917v4.034a9.948 9.948 0 0 1 -5 -1.951v4.5a6.5 6.5 0 1 1 -8 -6.326v4.326a2.5 2.5 0 1 0 4 2v-11.5h4.083a6.005 6.005 0 0 0 4.917 4.917', key: 'tt-1' }]
]);

interface FooterProps {
    language?: Language;
}

export const Footer: React.FC<FooterProps> = ({ language = 'en' }) => {
    const t = translations[language];

    return (
        <footer className="w-full mt-auto pt-6 pb-3 px-3 sm:px-6 md:px-8 flex flex-col items-center justify-center gap-3 text-xs sm:text-sm md:text-xl text-[#f2f3f4] font-medium shrink-0 text-center">
            {/* Creator Name */}
            <div>
                {t.createdBy}{' '}
                <a
                    id="creator-website-link"
                    href="https://ahmadzacky.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white font-semibold tracking-wide hover:text-[#23ffff] hover:drop-shadow-[0_0_8px_rgba(35,255,255,0.8)] decoration-transparent hover:decoration-[#23ffff] transition-all duration-300 cursor-pointer"
                >
                    Ahmad Miftahul Zaki
                </a>
            </div>

            {/* Social Media Rounded Icon Buttons */}
            <div className="flex items-center gap-3 sm:gap-4">
                {/* Personal Website */}
                <a
                    href="https://ahmadzacky.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Personal Website"
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-[#020304]/80 backdrop-blur-md border border-gray-700/70 text-[#f2f3f4] hover:text-[#23ffff] hover:border-[#23ffff] hover:bg-[#23ffff]/10 hover:shadow-[0_0_15px_rgba(35,255,255,0.7)] transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer"
                >
                    <Globe className="w-5 h-5 sm:w-5 sm:h-5" strokeWidth={2} />
                </a>

                {/* LinkedIn */}
                <a
                    href="https://www.linkedin.com/in/ahdzacky/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn Profile"
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-[#020304]/80 backdrop-blur-md border border-gray-700/70 text-[#f2f3f4] hover:text-[#23ffff] hover:border-[#23ffff] hover:bg-[#23ffff]/10 hover:shadow-[0_0_15px_rgba(35,255,255,0.7)] transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer"
                >
                    <LinkedinIcon className="w-5 h-5 sm:w-5 sm:h-5" strokeWidth={2} />
                </a>

                {/* GitHub */}
                <a
                    href="https://github.com/ahdzacky/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub Profile"
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-[#020304]/80 backdrop-blur-md border border-gray-700/70 text-[#f2f3f4] hover:text-white hover:border-white hover:bg-white/10 hover:shadow-[0_0_15px_rgba(242,243,244,0.7)] transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer"
                >
                    <GithubIcon className="w-5 h-5 sm:w-5 sm:h-5" strokeWidth={2} />
                </a>

                {/* Instagram */}
                <a
                    href="https://www.instagram.com/ahdzacky/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram Profile"
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-[#020304]/80 backdrop-blur-md border border-gray-700/70 text-[#f2f3f4] hover:text-[#f23498] hover:border-[#f23498] hover:bg-[#f23498]/10 hover:shadow-[0_0_15px_rgba(242,52,152,0.7)] transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer"
                >
                    <InstagramIcon className="w-5 h-5 sm:w-5 sm:h-5" strokeWidth={2} />
                </a>

                {/* TikTok */}
                <a
                    href="https://www.tiktok.com/@ahdzacky23"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="TikTok Profile"
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-[#020304]/80 backdrop-blur-md border border-gray-700/70 text-[#f2f3f4] hover:text-[#f23498] hover:border-[#f23498] hover:bg-[#f23498]/10 hover:shadow-[0_0_15px_rgba(242,52,152,0.7)] transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer"
                >
                    <TiktokIcon className="w-5 h-5 sm:w-5 sm:h-5" strokeWidth={2} />
                </a>
            </div>
        </footer>
    );
};
