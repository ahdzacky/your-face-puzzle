import React from 'react';
import { Language, translations } from '../i18n/translations';
import { GameMode, WinnerInfo } from '../types/game';

interface WinScreenProps {
    language: Language;
    winner: WinnerInfo;
    mode: GameMode;
    onPlayAgain: () => void;
}

export const WinScreen: React.FC<WinScreenProps> = ({ language, winner, mode, onPlayAgain }) => {
    const t = translations[language];
    const isMultiplayer = mode === 'multi';
    const titleText = isMultiplayer ? t.playerWins(winner.id) : t.completed;
    const themeColor = winner.color || '#23ffff';

    return (
        <div
            id="win-screen"
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[#020304]/50 backdrop-blur-md transition-opacity duration-500 p-2 sm:p-4 md:p-6 overflow-y-auto"
        >
            {/* Unified Win Card */}
            <div
                id="win-card"
                style={{
                    borderColor: themeColor,
                    boxShadow: `0 0 35px ${themeColor}55`
                }}
                className="flex flex-col items-center justify-center p-3 sm:p-6 md:p-10 border-2 bg-[#020304]/85 backdrop-blur-lg rounded-2xl sm:rounded-3xl transition-all max-w-xl w-full max-h-[96vh] overflow-y-auto my-auto"
            >
                {/* Winner Title */}
                <h2
                    id="win-title"
                    style={{
                        color: themeColor,
                        textShadow: `0 0 15px ${themeColor}`
                    }}
                    className="font-tech text-xl sm:text-3xl md:text-5xl font-black mb-2 sm:mb-4 tracking-wider uppercase text-center"
                >
                    {titleText}
                </h2>

                {/* Image Container inside Card */}
                <div className="p-1 sm:p-2 border-2 border-gray-600 bg-[#020304] rounded-xl mb-2 sm:mb-4 shadow-inner">
                    <img
                        id="win-image"
                        src={winner.imageSrc}
                        className="w-32 h-32 sm:w-48 sm:h-48 md:w-60 md:h-60 object-cover rounded-lg"
                        alt="Puzzle Selesai"
                    />
                </div>

                {/* Time */}
                <p
                    id="win-time"
                    className="font-tech text-lg sm:text-2xl md:text-3xl font-black mb-2 sm:mb-5 text-white drop-shadow-[0_0_15px_rgba(242,243,244,0.9)]"
                >
                    {t.timeLabel}: {winner.formattedTime}
                </p>

                {/* Play Again Button inside Card */}
                <button
                    id="btn-play-again"
                    onClick={onPlayAgain}
                    className="font-tech bg-white text-black font-black text-sm sm:text-lg md:text-xl px-6 sm:px-10 py-2 sm:py-3 rounded-full w-full max-w-xs sm:max-w-sm hover:bg-gray-200 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(242,243,244,0.7)] tracking-wider cursor-pointer"
                >
                    {t.playAgain}
                </button>
            </div>
        </div>
    );
};
