import React from 'react';
import { User, Users } from 'lucide-react';
import { Language, translations } from '../i18n/translations';
import { CameraDevice, CameraPermissionState, GameMode } from '../types/game';
import { CameraSelector } from './CameraSelector';
import { Footer } from './Footer';
import { LanguageSelector } from './LanguageSelector';

interface MainMenuProps {
    language: Language;
    onLanguageChange: (lang: Language) => void;
    selectedMode: GameMode | null;
    onSelectMode: (mode: GameMode) => void;
    isCameraOn: boolean;
    isCameraLoading: boolean;
    cameraPermission?: CameraPermissionState;
    onActivateCamera: () => void;
    onStartGame: () => void;
    devices: CameraDevice[];
    selectedDeviceId: string | null;
    onSelectDevice: (deviceId: string) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
    language,
    onLanguageChange,
    selectedMode,
    onSelectMode,
    isCameraOn,
    isCameraLoading,
    cameraPermission = 'unknown',
    onActivateCamera,
    onStartGame,
    devices,
    selectedDeviceId,
    onSelectDevice
}) => {
    const t = translations[language];
    const isStartEnabled = isCameraOn && selectedMode !== null;

    return (
        <div
            id="ui-layer"
            className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-[#020304]/50 backdrop-blur-md transition-opacity duration-500 flex flex-col p-4 sm:p-6 md:p-8"
        >
            {/* Top Bar with Language Selector */}
            <div className="w-full max-w-5xl mx-auto flex justify-end items-center pt-1 pb-2">
                <LanguageSelector language={language} onLanguageChange={onLanguageChange} />
            </div>

            {/* Inner Content Center Container */}
            <div className="w-full max-w-5xl m-auto flex flex-col items-center py-2 sm:py-4">
                {/* Title Section */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 md:mb-8 tracking-widest uppercase text-center flex flex-wrap justify-center items-center gap-x-3 sm:gap-x-4 gap-y-1">
                    <span className="title-outline-cyan px-2 py-1">{t.titleFace}</span>
                    <span className="title-outline-pink px-2 py-1">{t.titlePuzzle}</span>
                </h1>

                {/* Game Modes Container */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 w-full mb-6 md:mb-8 items-stretch">
                    {/* Single Player Card */}
                    <div
                        id="card-single"
                        onClick={() => onSelectMode('single')}
                        className={`mode-card mode-card-single group relative rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-8 flex items-center gap-4 sm:gap-5 text-left h-full ${selectedMode === 'single' ? 'selected' : ''
                            }`}
                    >
                        <div className="flex-shrink-0 text-[#23ffff]">
                            {/* Single User Icon */}
                            <User className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 drop-shadow-[0_0_12px_rgba(35,255,255,0.9)]" strokeWidth={2} />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl md:text-3xl font-black mb-1 md:mb-2 text-[#23ffff] tracking-wider drop-shadow-[0_0_8px_rgba(35,255,255,0.7)]">
                                {t.singlePlayerTitle}
                            </h2>
                            <p className="text-xs sm:text-sm md:text-xl text-[#f2f3f4] leading-snug sm:leading-relaxed font-normal">
                                {t.singlePlayerDesc}
                            </p>
                        </div>
                    </div>

                    {/* Multiplayer Card */}
                    <div
                        id="card-multi"
                        onClick={() => onSelectMode('multi')}
                        className={`mode-card mode-card-multi group relative rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-8 flex items-center gap-4 sm:gap-5 text-left h-full ${selectedMode === 'multi' ? 'selected' : ''
                            }`}
                    >
                        <div className="flex-shrink-0 text-[#f23498]">
                            {/* Users Icon */}
                            <Users className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 drop-shadow-[0_0_12px_rgba(242,52,152,0.9)]" strokeWidth={2} />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl md:text-3xl font-black mb-1 md:mb-2 text-[#f23498] tracking-wider drop-shadow-[0_0_8px_rgba(242,52,152,0.7)]">
                                {t.multiplayerTitle}
                            </h2>
                            <p className="text-xs sm:text-sm md:text-xl text-[#f2f3f4] leading-snug sm:leading-relaxed font-normal">
                                {t.multiplayerDesc}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Rules Section */}
                <div className="text-center mb-6 md:mb-8 max-w-4xl px-2">
                    <h3 className="text-base sm:text-lg md:text-2xl font-extrabold mb-1.5 md:mb-3 text-white tracking-wider">
                        {t.rulesTitle}
                    </h3>
                    <p className="text-[#f2f3f4] text-xs sm:text-sm md:text-xl leading-relaxed font-normal">
                        {t.rule1}
                    </p>
                    <p className="text-[#f2f3f4] text-xs sm:text-sm md:text-xl leading-relaxed font-normal pt-1">
                        {t.rule2}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 w-full max-w-md items-center mb-2 sm:mb-4">
                    {/* 1. Camera Selector (Top) */}
                    <div className="flex flex-col items-center gap-1.5 w-full max-w-xs sm:max-w-sm">
                        <CameraSelector
                            language={language}
                            devices={devices}
                            selectedDeviceId={selectedDeviceId}
                            onSelectDevice={onSelectDevice}
                            isCameraOn={isCameraOn}
                            cameraPermission={cameraPermission}
                            onActivateCamera={onActivateCamera}
                        />
                    </div>

                    {/* 2. Activate Camera Button (Middle) */}
                    <button
                        id="btn-start-cam"
                        onClick={onActivateCamera}
                        disabled={isCameraLoading || (isCameraOn && cameraPermission !== 'denied')}
                        className={`w-full max-w-xs sm:max-w-sm h-12 px-4 sm:px-6 rounded-full font-bold text-xs sm:text-sm md:text-xl uppercase tracking-widest border-2 transition-all backdrop-blur-md shadow-md flex items-center justify-center ${cameraPermission === 'denied'
                            ? 'bg-[#ff2304]/20 border-[#ff2304] text-[#ff2304] hover:border-[#ff2304] hover:text-white shadow-[0_0_15px_rgba(255,35,4,0.5)] cursor-pointer'
                            : isCameraOn
                                ? 'bg-[#23ffff]/20 text-[#23ffff] border-[#23ffff] shadow-[0_0_15px_rgba(35,255,255,0.6)] cursor-default'
                                : isCameraLoading
                                    ? 'bg-[#020304]/80 border-cyan-400 text-cyan-300 animate-pulse cursor-wait'
                                    : 'bg-[#020304]/50 border-gray-600/80 text-[#f2f3f4] hover:border-gray-400 hover:text-white cursor-pointer'
                            }`}
                    >
                        {cameraPermission === 'denied'
                            ? `${t.retry} - ${t.activateCamera}`
                            : isCameraLoading
                                ? t.loadingCamera
                                : isCameraOn
                                    ? t.cameraActive
                                    : t.activateCamera}
                    </button>

                    {/* Camera Permission Denied Helper Guide (only when blocked) */}
                    {cameraPermission === 'denied' && (
                        <p className="text-xs text-[#ff2304] text-center max-w-xs sm:max-w-sm px-2 -mt-1 leading-relaxed">
                            {t.cameraPermissionGuide}
                        </p>
                    )}

                    {/* 3. Start Game Button (Bottom) */}
                    <button
                        id="btn-start-game"
                        onClick={onStartGame}
                        disabled={!isStartEnabled}
                        className={`btn-dual-glow w-full max-w-xs sm:max-w-sm py-3.5 sm:py-4 px-6 sm:px-8 rounded-full font-black text-lg sm:text-xl md:text-3xl uppercase tracking-wider flex justify-center items-center gap-2 sm:gap-3 shadow-2xl transition-all duration-300 ${isStartEnabled
                            ? 'cursor-pointer opacity-100 hover:scale-[1.03]'
                            : 'cursor-not-allowed opacity-40'
                            }`}
                    >
                        <span className="text-[#23ffff] font-black tracking-wider drop-shadow-[0_0_10px_rgba(35,255,255,0.9)]">
                            {t.start}
                        </span>
                        <span className="text-[#f23498] font-black tracking-wider drop-shadow-[0_0_10px_rgba(242,52,152,0.9)]">
                            {t.game}
                        </span>
                    </button>
                </div>
            </div>

            {/* Footer */}
            <Footer language={language} />
        </div>
    );
};
