import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="w-full mt-auto pt-6 pb-2 px-3 sm:px-6 md:px-8 flex flex-row justify-between items-center text-xs sm:text-sm md:text-base text-gray-400 font-medium shrink-0">
            <div>
                Created by: <span className="text-white font-semibold">Ahmad Miftahul Zaki</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
                <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#ff2a85] inline-block drop-shadow-[0_0_8px_rgba(255,42,133,0.8)]"
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
                <a
                    href="https://www.instagram.com/ahdzacky/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00f0ff] hover:text-cyan-300 font-semibold drop-shadow-[0_0_5px_rgba(0,240,255,0.8)] hover:underline transition-all"
                >
                    @ahdzacky
                </a>
            </div>
        </footer>
    );
};
