import React from 'react';
import { GameMode } from '../types/game';
import { Footer } from './Footer';

interface MainMenuProps {
    selectedMode: GameMode | null;
    onSelectMode: (mode: GameMode) => void;
    isCameraOn: boolean;
    isCameraLoading: boolean;
    onActivateCamera: () => void;
    onStartGame: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
    selectedMode,
    onSelectMode,
    isCameraOn,
    isCameraLoading,
    onActivateCamera,
    onStartGame
}) => {
    const isStartEnabled = isCameraOn && selectedMode !== null;

    return (
        <div
            id="ui-layer"
            className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black/50 backdrop-blur-md transition-opacity duration-500 flex flex-col p-4 sm:p-6 md:p-8"
        >
            {/* Inner Content Center Container */}
            <div className="w-full max-w-5xl m-auto flex flex-col items-center py-2 sm:py-4">
                {/* Title Section */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 md:mb-8 tracking-widest uppercase text-center flex flex-wrap justify-center items-center gap-x-3 sm:gap-x-4 gap-y-1">
                    <span className="title-outline-cyan px-2 py-1">YOUR FACE</span>
                    <span className="title-outline-pink px-2 py-1">PUZZLE</span>
                </h1>

                {/* Game Modes Container */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 w-full mb-6 md:mb-8">
                    {/* Single Player Card */}
                    <div
                        id="card-single"
                        onClick={() => onSelectMode('single')}
                        className={`mode-card mode-card-single group relative rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-8 flex items-center gap-4 sm:gap-5 text-left ${
                            selectedMode === 'single' ? 'selected' : ''
                        }`}
                    >
                        <div className="flex-shrink-0 text-[#00f0ff]">
                            {/* Single User Icon */}
                            <svg
                                className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 drop-shadow-[0_0_12px_rgba(0,240,255,0.9)]"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl md:text-3xl font-black mb-1 md:mb-2 text-[#00f0ff] tracking-wider drop-shadow-[0_0_8px_rgba(0,240,255,0.7)]">
                                SINGLE PLAYER
                            </h2>
                            <p className="text-xs sm:text-sm md:text-lg text-gray-200 leading-snug sm:leading-relaxed font-normal">
                                Main sendiri! Selesaikan puzzle<br className="hidden sm:inline" /> wajahmu secepat mungkin.
                            </p>
                        </div>
                    </div>

                    {/* Multiplayer Card */}
                    <div
                        id="card-multi"
                        onClick={() => onSelectMode('multi')}
                        className={`mode-card mode-card-multi group relative rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-8 flex items-center gap-4 sm:gap-5 text-left ${
                            selectedMode === 'multi' ? 'selected' : ''
                        }`}
                    >
                        <div className="flex-shrink-0 text-[#ff2a85]">
                            {/* Users Icon */}
                            <svg
                                className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 drop-shadow-[0_0_12px_rgba(255,42,133,0.9)]"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl md:text-3xl font-black mb-1 md:mb-2 text-[#ff2a85] tracking-wider drop-shadow-[0_0_8px_rgba(255,42,133,0.7)]">
                                MULTIPLAYER
                            </h2>
                            <p className="text-xs sm:text-sm md:text-lg text-gray-200 leading-snug sm:leading-relaxed font-normal">
                                Berdua lebih seru! Siapa yang tercepat<br className="hidden sm:inline" /> menyelesaikan, dia yang
                                menang.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Rules Section */}
                <div className="text-center mb-6 md:mb-8 max-w-4xl px-2">
                    <h3 className="text-base sm:text-lg md:text-2xl font-extrabold mb-1.5 md:mb-3 text-white tracking-wider">
                        ATURAN:
                    </h3>
                    <p className="text-gray-200 text-xs sm:text-sm md:text-lg leading-relaxed font-normal">
                        Gunakan tanganmu untuk screenshot wajahmu. Lalu susun puzzle dengan menjentikkan jari!
                    </p>
                    <p className="text-gray-200 text-xs sm:text-sm md:text-lg leading-relaxed font-normal pt-1">
                        Tangan juga bisa untuk klik tombol, jentikkan jari (pinch) atau tahan tangan di atas tombol!
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 sm:gap-4 md:gap-6 w-full max-w-md items-center mb-2 sm:mb-4">
                    {/* Start Game Button */}
                    <button
                        id="btn-start-game"
                        onClick={onStartGame}
                        disabled={!isStartEnabled}
                        className={`btn-dual-glow w-full max-w-xs sm:max-w-sm py-3.5 sm:py-4 px-6 sm:px-8 rounded-full font-black text-lg sm:text-xl md:text-3xl uppercase tracking-wider flex justify-center items-center gap-2 sm:gap-3 shadow-2xl transition-all duration-300 ${
                            isStartEnabled
                                ? 'cursor-pointer opacity-100 hover:scale-[1.03]'
                                : 'cursor-not-allowed opacity-40'
                        }`}
                    >
                        <span className="text-[#00f0ff] font-black tracking-wider drop-shadow-[0_0_10px_rgba(0,240,255,0.9)]">
                            START
                        </span>
                        <span className="text-[#ff2a85] font-black tracking-wider drop-shadow-[0_0_10px_rgba(255,42,133,0.9)]">
                            GAME
                        </span>
                    </button>

                    {/* Activate Camera Button */}
                    <button
                        id="btn-start-cam"
                        onClick={onActivateCamera}
                        disabled={isCameraOn || isCameraLoading}
                        className={`w-full max-w-xs sm:max-w-sm py-3 sm:py-3.5 px-4 sm:px-6 rounded-full font-bold text-xs sm:text-sm md:text-lg uppercase tracking-widest border-2 transition-all backdrop-blur-md shadow-md ${
                            isCameraOn
                                ? 'bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.6)] cursor-default'
                                : isCameraLoading
                                ? 'bg-[#090e1a]/80 border-cyan-400 text-cyan-300 animate-pulse cursor-wait'
                                : 'bg-[#090e1a]/60 border-gray-600/80 text-gray-300 hover:border-gray-400 hover:text-white cursor-pointer'
                        }`}
                    >
                        {isCameraOn
                            ? 'CAMERA ACTIVE'
                            : isCameraLoading
                            ? 'LOADING CAMERA...'
                            : 'ACTIVATE CAMERA'}
                    </button>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};
