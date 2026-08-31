import React from 'react';
import { GameMode, WinnerInfo } from '../types/game';

interface WinScreenProps {
    winner: WinnerInfo;
    mode: GameMode;
    onPlayAgain: () => void;
}

export const WinScreen: React.FC<WinScreenProps> = ({ winner, mode, onPlayAgain }) => {
    const isMultiplayer = mode === 'multi';
    const titleText = isMultiplayer ? `PLAYER ${winner.id} MENANG!` : 'SELESAI!';
    const themeColor = winner.color || '#00f0ff';

    return (
        <div
            id="win-screen"
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/50 backdrop-blur-md transition-opacity duration-500 px-4 sm:px-6"
        >
            {/* Unified Win Card */}
            <div
                id="win-card"
                style={{
                    borderColor: themeColor,
                    boxShadow: `0 0 35px ${themeColor}55`
                }}
                className="flex flex-col items-center justify-center p-6 sm:p-10 md:p-14 border-2 bg-[#070d18]/95 backdrop-blur-lg rounded-3xl transition-all max-w-2xl w-full"
            >
                {/* Winner Title */}
                <h2
                    id="win-title"
                    style={{
                        color: themeColor,
                        textShadow: `0 0 15px ${themeColor}`
                    }}
                    className="font-tech text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 sm:mb-8 tracking-wider uppercase text-center"
                >
                    {titleText}
                </h2>

                {/* Image Container inside Card */}
                <div className="p-2 sm:p-3 border-2 border-gray-600 bg-black rounded-2xl mb-6 sm:mb-8 shadow-inner">
                    <img
                        id="win-image"
                        src={winner.imageSrc}
                        className="w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 object-cover rounded-xl"
                        alt="Puzzle Selesai"
                    />
                </div>

                {/* Time */}
                <p
                    id="win-time"
                    className="font-tech text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-6 sm:mb-10 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.9)]"
                >
                    WAKTU: {winner.formattedTime}
                </p>

                {/* Play Again Button inside Card */}
                <button
                    id="btn-play-again"
                    onClick={onPlayAgain}
                    className="font-tech bg-white text-black font-black text-xl sm:text-2xl md:text-3xl px-8 sm:px-14 py-3 sm:py-4 rounded-full w-full max-w-md hover:bg-gray-200 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.7)] tracking-wider cursor-pointer"
                >
                    MAIN LAGI
                </button>
            </div>
        </div>
    );
};
