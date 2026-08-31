import React from 'react';
import { GameMode } from '../types/game';

interface InGameControlsProps {
    mode: GameMode;
    onShuffleP1: () => void;
    onRecalibrateP1: () => void;
    onShuffleP2: () => void;
    onRecalibrateP2: () => void;
    onExitGame: () => void;
}

export const InGameControls: React.FC<InGameControlsProps> = ({
    mode,
    onShuffleP1,
    onRecalibrateP1,
    onShuffleP2,
    onRecalibrateP2,
    onExitGame
}) => {
    return (
        <div
            id="ingame-ui"
            className="fixed inset-x-0 bottom-8 z-40 flex items-center justify-between px-6 sm:px-8 md:px-16 pointer-events-auto select-none"
        >
            {/* P1 Controls (Left) */}
            <div id="p1-controls" className="flex items-center gap-3 sm:gap-4">
                <button
                    id="btn-shuffle-p1"
                    onClick={onShuffleP1}
                    className="font-tech bg-[#061520]/90 backdrop-blur-md border-2 border-[#00f0ff] text-[#00f0ff] font-black text-xs sm:text-sm md:text-lg px-4 sm:px-7 py-2.5 sm:py-3.5 rounded-full hover:bg-[#00f0ff]/20 hover:shadow-[0_0_20px_rgba(0,240,255,0.7)] transition-all cursor-pointer shadow-lg tracking-wider"
                >
                    {mode === 'single' ? 'ACAK ULANG' : 'P1: ACAK'}
                </button>
                <button
                    id="btn-recalib-p1"
                    onClick={onRecalibrateP1}
                    className="font-tech bg-[#061520]/90 backdrop-blur-md border-2 border-white/50 text-white font-black text-xs sm:text-sm md:text-lg px-4 sm:px-7 py-2.5 sm:py-3.5 rounded-full hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all cursor-pointer shadow-lg tracking-wider"
                >
                    {mode === 'single' ? 'FOTO ULANG' : 'P1: FOTO ULANG'}
                </button>
            </div>

            {/* Center Menu Button */}
            <button
                id="btn-exit-game"
                onClick={onExitGame}
                className="font-tech bg-[#061520]/90 backdrop-blur-md border-2 border-red-500 text-red-400 font-black text-xs sm:text-sm md:text-lg px-4 sm:px-7 py-2.5 sm:py-3.5 rounded-full hover:bg-red-500/20 hover:shadow-[0_0_20px_rgba(255,0,0,0.7)] transition-all cursor-pointer shadow-lg tracking-wider"
            >
                MENU UTAMA
            </button>

            {/* P2 Controls (Right - Multiplayer only) */}
            {mode === 'multi' && (
                <div id="p2-controls" className="flex items-center gap-3 sm:gap-4">
                    <button
                        id="btn-recalib-p2"
                        onClick={onRecalibrateP2}
                        className="font-tech bg-[#1a0815]/90 backdrop-blur-md border-2 border-white/50 text-white font-black text-xs sm:text-sm md:text-lg px-4 sm:px-7 py-2.5 sm:py-3.5 rounded-full hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all cursor-pointer shadow-lg tracking-wider"
                    >
                        P2: FOTO ULANG
                    </button>
                    <button
                        id="btn-shuffle-p2"
                        onClick={onShuffleP2}
                        className="font-tech bg-[#1a0815]/90 backdrop-blur-md border-2 border-[#ff2a85] text-[#ff2a85] font-black text-xs sm:text-sm md:text-lg px-4 sm:px-7 py-2.5 sm:py-3.5 rounded-full hover:bg-[#ff2a85]/20 hover:shadow-[0_0_20px_rgba(255,42,133,0.7)] transition-all cursor-pointer shadow-lg tracking-wider"
                    >
                        P2: ACAK
                    </button>
                </div>
            )}
        </div>
    );
};
