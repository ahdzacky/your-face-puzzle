import React from 'react';
import { Expand, Shrink } from 'lucide-react';
import { Language, translations } from '../i18n/translations';
import { GameMode } from '../types/game';

interface InGameControlsProps {
    language: Language;
    mode: GameMode;
    onShuffleP1: () => void;
    onRecalibrateP1: () => void;
    onShuffleP2: () => void;
    onRecalibrateP2: () => void;
    onExitGame: () => void;
    onToggleFullscreen?: () => void;
    isFullscreen?: boolean;
}

export const InGameControls: React.FC<InGameControlsProps> = ({
    language,
    mode,
    onShuffleP1,
    onRecalibrateP1,
    onShuffleP2,
    onRecalibrateP2,
    onExitGame,
    onToggleFullscreen,
    isFullscreen = false
}) => {
    const t = translations[language];

    return (
        <div
            id="ingame-ui"
            style={{ paddingTop: 'max(0px, env(safe-area-inset-top))' }}
            className="fixed inset-x-0 top-3 sm:top-4 md:top-6 z-40 flex items-center justify-between px-3 sm:px-6 md:px-10 pointer-events-auto select-none"
        >
            {/* P1 Controls (Left) */}
            <div id="p1-controls" className="flex items-center gap-2 sm:gap-3 md:gap-4">
                <button
                    id="btn-shuffle-p1"
                    onClick={onShuffleP1}
                    className="font-tech bg-[#020304]/85 backdrop-blur-md border border-[#23ffff] sm:border-2 text-[#23ffff] font-black text-xs sm:text-sm md:text-lg px-3 sm:px-4 md:px-6 h-9 sm:h-10 md:h-12 rounded-full hover:bg-[#23ffff]/20 hover:shadow-[0_0_20px_rgba(35,255,255,0.7)] transition-all cursor-pointer shadow-lg tracking-wider flex items-center justify-center"
                >
                    {mode === 'single' ? t.shuffle : t.shuffleP1}
                </button>
                <button
                    id="btn-recalib-p1"
                    onClick={onRecalibrateP1}
                    className="font-tech bg-[#020304]/85 backdrop-blur-md border border-white/50 sm:border-2 text-white font-black text-xs sm:text-sm md:text-lg px-3 sm:px-4 md:px-6 h-9 sm:h-10 md:h-12 rounded-full hover:bg-white/20 hover:shadow-[0_0_15px_rgba(242,243,244,0.5)] transition-all cursor-pointer shadow-lg tracking-wider flex items-center justify-center"
                >
                    {mode === 'single' ? t.recalibrate : t.recalibrateP1}
                </button>
            </div>

            {/* Center Buttons: Exit & Fullscreen toggle */}
            <div className="flex items-center gap-2 sm:gap-3">
                <button
                    id="btn-exit-game"
                    onClick={onExitGame}
                    className="font-tech bg-[#020304]/85 backdrop-blur-md border border-[#ff2304] sm:border-2 text-[#ff2304] font-black text-xs sm:text-sm md:text-lg px-3 sm:px-4 md:px-6 h-9 sm:h-10 md:h-12 rounded-full hover:bg-[#ff2304]/20 hover:shadow-[0_0_20px_rgba(255,35,4,0.7)] transition-all cursor-pointer shadow-lg tracking-wider flex items-center justify-center shrink-0"
                >
                    {t.mainMenu}
                </button>

                {onToggleFullscreen && (
                    <button
                        id="btn-toggle-fullscreen"
                        onClick={onToggleFullscreen}
                        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                        className="font-tech bg-[#020304]/85 backdrop-blur-md border border-white/50 sm:border-2 text-white font-bold w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full p-0 hover:bg-white/20 hover:shadow-[0_0_15px_rgba(242,243,244,0.5)] transition-all cursor-pointer shadow-lg flex items-center justify-center shrink-0"
                    >
                        {isFullscreen ? (
                            <Shrink className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" strokeWidth={2} />
                        ) : (
                            <Expand className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" strokeWidth={2} />
                        )}
                    </button>
                )}
            </div>

            {/* P2 Controls (Right - Multiplayer only) */}
            {mode === 'multi' && (
                <div id="p2-controls" className="flex items-center gap-2 sm:gap-3 md:gap-4">
                    <button
                        id="btn-recalib-p2"
                        onClick={onRecalibrateP2}
                        className="font-tech bg-[#020304]/85 backdrop-blur-md border border-white/50 sm:border-2 text-white font-black text-xs sm:text-sm md:text-lg px-3 sm:px-4 md:px-6 h-9 sm:h-10 md:h-12 rounded-full hover:bg-white/20 hover:shadow-[0_0_15px_rgba(242,243,244,0.5)] transition-all cursor-pointer shadow-lg tracking-wider flex items-center justify-center"
                    >
                        {t.recalibrateP2}
                    </button>
                    <button
                        id="btn-shuffle-p2"
                        onClick={onShuffleP2}
                        className="font-tech bg-[#020304]/85 backdrop-blur-md border border-[#f23498] sm:border-2 text-[#f23498] font-black text-xs sm:text-sm md:text-lg px-3 sm:px-4 md:px-6 h-9 sm:h-10 md:h-12 rounded-full hover:bg-[#f23498]/20 hover:shadow-[0_0_20px_rgba(242,52,152,0.7)] transition-all cursor-pointer shadow-lg tracking-wider flex items-center justify-center"
                    >
                        {t.shuffleP2}
                    </button>
                </div>
            )}
        </div>
    );
};
