import React, { useRef, useState, useCallback, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { InGameControls } from './components/InGameControls';
import { MainMenu } from './components/MainMenu';
import { WinScreen } from './components/WinScreen';
import { CameraController } from './core/cameraManager';
import { Player } from './core/Player';
import { CameraDevice, CameraPermissionState, GameMode, Language, WinnerInfo } from './types/game';
import {
    isMobileDevice,
    isAppFullscreen,
    requestAppFullscreen,
    exitAppFullscreen,
    lockOrientationLandscape,
    unlockOrientation
} from './utils/screenUtils';

const CAMERA_STORAGE_KEY = 'preferred_camera_device_id';

export const App: React.FC = () => {
    const [language, setLanguage] = useState<Language>('en');
    const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
    const [isCameraOn, setIsCameraOn] = useState<boolean>(false);
    const [isCameraLoading, setIsCameraLoading] = useState<boolean>(false);
    const [cameraPermission, setCameraPermission] = useState<CameraPermissionState>('unknown');
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [winner, setWinner] = useState<WinnerInfo | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [devices, setDevices] = useState<CameraDevice[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(() => {
        try {
            return localStorage.getItem(CAMERA_STORAGE_KEY);
        } catch {
            return null;
        }
    });

    const [windowDimensions, setWindowDimensions] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 1280,
        height: typeof window !== 'undefined' ? window.innerHeight : 720
    });
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

    const cameraTriggerRef = useRef<((deviceId?: string) => Promise<void>) | null>(null);

    // Track window dimensions and fullscreen status
    useEffect(() => {
        const handleWindowResize = () => {
            setWindowDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });
            setIsFullscreen(isAppFullscreen());
        };

        window.addEventListener('resize', handleWindowResize);
        window.addEventListener('orientationchange', handleWindowResize);
        document.addEventListener('fullscreenchange', handleWindowResize);
        document.addEventListener('webkitfullscreenchange', handleWindowResize);

        return () => {
            window.removeEventListener('resize', handleWindowResize);
            window.removeEventListener('orientationchange', handleWindowResize);
            document.removeEventListener('fullscreenchange', handleWindowResize);
            document.removeEventListener('webkitfullscreenchange', handleWindowResize);
        };
    }, []);

    // Initial check for available video input devices and camera permission
    useEffect(() => {
        CameraController.getAvailableDevices().then((devs) => {
            if (devs.length > 0) {
                setDevices(devs);
            }
        });

        if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
            navigator.permissions
                .query({ name: 'camera' as PermissionName })
                .then((status) => {
                    setCameraPermission(status.state as CameraPermissionState);
                    status.onchange = () => {
                        const newState = status.state as CameraPermissionState;
                        setCameraPermission(newState);
                        if (newState !== 'granted') {
                            setIsCameraOn(false);
                            setIsCameraLoading(false);
                        }
                    };
                })
                .catch(() => {
                    // Browser might not support 'camera' in permissions.query
                });
        }
    }, []);

    const handleCameraActive = useCallback(() => {
        setIsCameraOn(true);
        setIsCameraLoading(false);
        setCameraPermission('granted');
    }, []);

    const handleCameraInactive = useCallback(() => {
        setIsCameraOn(false);
        setIsCameraLoading(false);
    }, []);

    const handleDevicesUpdated = useCallback((updatedDevices: CameraDevice[]) => {
        setDevices(updatedDevices);
    }, []);

    const handleSelectDevice = useCallback(
        async (deviceId: string) => {
            setSelectedDeviceId(deviceId);
            try {
                localStorage.setItem(CAMERA_STORAGE_KEY, deviceId);
            } catch {
                // Ignore storage errors
            }

            // If camera is not yet running, activate it with selected device
            if (!isCameraOn && cameraTriggerRef.current) {
                setIsCameraLoading(true);
                try {
                    await cameraTriggerRef.current(deviceId);
                    setCameraPermission('granted');
                } catch (err: unknown) {
                    console.warn('Camera activation error:', err);
                    const error = err as { name?: string };
                    if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
                        setCameraPermission('denied');
                    }
                    setIsCameraLoading(false);
                }
            }
        },
        [isCameraOn]
    );

    const handleActivateCamera = useCallback(async () => {
        if (isCameraOn) return;
        setIsCameraLoading(true);
        if (cameraTriggerRef.current) {
            try {
                await cameraTriggerRef.current(selectedDeviceId || undefined);
                setCameraPermission('granted');
            } catch (err: unknown) {
                console.warn('Manual camera activation error:', err);
                const error = err as { name?: string };
                if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
                    setCameraPermission('denied');
                }
                setIsCameraLoading(false);
            }
        }
    }, [isCameraOn, selectedDeviceId]);

    const handleSelectMode = useCallback((mode: GameMode) => {
        setSelectedMode(mode);
    }, []);

    const handleStartGame = useCallback(async () => {
        if (isCameraOn && selectedMode) {
            setWinner(null);
            setIsPlaying(true);

            // Auto enter fullscreen & lock orientation on mobile
            await requestAppFullscreen();
            await lockOrientationLandscape();
            setIsFullscreen(isAppFullscreen());
        }
    }, [isCameraOn, selectedMode]);

    const handleReturnToMainMenu = useCallback(async () => {
        setIsPlaying(false);
        setWinner(null);
        setSelectedMode(null);

        unlockOrientation();
        await exitAppFullscreen();
        setIsFullscreen(false);
    }, []);

    const handleToggleFullscreen = useCallback(async () => {
        if (isAppFullscreen()) {
            await exitAppFullscreen();
            setIsFullscreen(false);
        } else {
            await requestAppFullscreen();
            await lockOrientationLandscape();
            setIsFullscreen(true);
        }
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

    // Check if the game is active (playing or win screen) and needs forced landscape
    const isMobile = isMobileDevice();
    const isPortrait = windowDimensions.height > windowDimensions.width;
    const isGameActive = isPlaying || winner !== null;
    const isForcedLandscape = isMobile && isGameActive && isPortrait;

    return (
        <div
            className="relative w-screen h-screen overflow-hidden bg-[#020304] font-zalando font-tech text-white"
            style={isForcedLandscape ? {
                position: 'fixed',
                width: `${windowDimensions.height}px`,
                height: `${windowDimensions.width}px`,
                top: 0,
                left: 0,
                transformOrigin: '0 0',
                transform: `rotate(90deg) translateY(-${windowDimensions.width}px)`,
                overflow: 'hidden'
            } : undefined}
        >
            {/* Background Camera & Canvas Layer */}
            <GameCanvas
                language={language}
                isPlaying={isPlaying}
                selectedMode={selectedMode}
                isWinOpen={winner !== null}
                isForcedLandscape={isForcedLandscape}
                selectedDeviceId={selectedDeviceId}
                onCameraActive={handleCameraActive}
                onCameraInactive={handleCameraInactive}
                onWin={handleWin}
                setPlayersRef={setPlayers}
                cameraTriggerRef={cameraTriggerRef}
                onDevicesUpdated={handleDevicesUpdated}
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
                    cameraPermission={cameraPermission}
                    onActivateCamera={handleActivateCamera}
                    onStartGame={handleStartGame}
                    devices={devices}
                    selectedDeviceId={selectedDeviceId}
                    onSelectDevice={handleSelectDevice}
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
                    onToggleFullscreen={handleToggleFullscreen}
                    isFullscreen={isFullscreen}
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
