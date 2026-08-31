import React, { useRef, useState, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { InGameControls } from './components/InGameControls';
import { MainMenu } from './components/MainMenu';
import { WinScreen } from './components/WinScreen';
import { Player } from './core/Player';
import { GameMode, Language, WinnerInfo } from './types/game';

export const App: React.FC = () => {
    const [language, setLanguage] = useState<Language>('en');
    const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
    const [isCameraOn, setIsCameraOn] = useState<boolean>(false);
    const [isCameraLoading, setIsCameraLoading] = useState<boolean>(false);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [winner, setWinner] = useState<WinnerInfo | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);

    const cameraTriggerRef = useRef<(() => Promise<void>) | null>(null);

    const handleCameraActive = useCallback(() => {
        setIsCameraOn(true);
        setIsCameraLoading(false);
    }, []);

    const handleActivateCamera = useCallback(async () => {
        if (isCameraOn) return;
        setIsCameraLoading(true);
        if (cameraTriggerRef.current) {
            try {
                await cameraTriggerRef.current();
            } catch (err) {
                console.warn('Manual camera activation error:', err);
                setIsCameraLoading(false);
            }
        }
    }, [isCameraOn]);

    const handleSelectMode = useCallback((mode: GameMode) => {
        setSelectedMode(mode);
    }, []);

    const handleStartGame = useCallback(() => {
        if (isCameraOn && selectedMode) {
            setWinner(null);
            setIsPlaying(true);
        }
    }, [isCameraOn, selectedMode]);

    const handleReturnToMainMenu = useCallback(() => {
        setIsPlaying(false);
        setWinner(null);
        setSelectedMode(null);
    }, []);

    const handleWin = useCallback((winnerInfo: WinnerInfo) => {
        setWinner(winnerInfo);
        setIsPlaying(false);
    }, []);

    const handleShuffleP1 = useCallback(() => {
        if (players[0] && players[0].pieces.length > 0) {
            players[0].shufflePuzzle();
        }
    }, [players]);

    const handleRecalibrateP1 = useCallback(() => {
        if (selectedMode === 'multi') {
            players.forEach(p => p && p.recalibrate());
        } else if (players[0]) {
            players[0].recalibrate();
        }
    }, [players, selectedMode]);

    const handleShuffleP2 = useCallback(() => {
        if (players[1] && players[1].pieces.length > 0) {
            players[1].shufflePuzzle();
        }
    }, [players]);

    const handleRecalibrateP2 = useCallback(() => {
        if (selectedMode === 'multi') {
            players.forEach(p => p && p.recalibrate());
        } else if (players[1]) {
            players[1].recalibrate();
        }
    }, [players, selectedMode]);

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-[#070913] font-sora text-white">
            {/* Background Camera & Canvas Layer */}
            <GameCanvas
                language={language}
                isPlaying={isPlaying}
                selectedMode={selectedMode}
                isWinOpen={winner !== null}
                onCameraActive={handleCameraActive}
                onWin={handleWin}
                setPlayersRef={setPlayers}
                cameraTriggerRef={cameraTriggerRef}
            />

            {/* Main Menu Overlay */}
            {!isPlaying && winner === null && (
                <MainMenu
                    language={language}
                    onLanguageChange={setLanguage}
                    selectedMode={selectedMode}
                    onSelectMode={handleSelectMode}
                    isCameraOn={isCameraOn}
                    isCameraLoading={isCameraLoading}
                    onActivateCamera={handleActivateCamera}
                    onStartGame={handleStartGame}
                />
            )}

            {/* In-Game Controls Overlay */}
            {isPlaying && selectedMode && winner === null && (
                <InGameControls
                    language={language}
                    mode={selectedMode}
                    onShuffleP1={handleShuffleP1}
                    onRecalibrateP1={handleRecalibrateP1}
                    onShuffleP2={handleShuffleP2}
                    onRecalibrateP2={handleRecalibrateP2}
                    onExitGame={handleReturnToMainMenu}
                />
            )}

            {/* Win Screen Overlay */}
            {winner !== null && selectedMode && (
                <WinScreen
                    language={language}
                    winner={winner}
                    mode={selectedMode}
                    onPlayAgain={handleReturnToMainMenu}
                />
            )}
        </div>
    );
};

export default App;
