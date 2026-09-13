import React, { useEffect, useRef } from 'react';
import { COLOR_P1, COLOR_P2 } from '../constants';
import { Player } from '../core/Player';
import { createHandUiController, drawSkeleton, initMediaPipe } from '../core/handTracking';
import { CameraController } from '../core/cameraManager';
import { CameraDevice, GameMode, Landmarks, Language, WinnerInfo } from '../types/game';
import { Hands, MediaPipeResults } from '../types/mediapipe';

interface GameCanvasProps {
    language: Language;
    isPlaying: boolean;
    selectedMode: GameMode | null;
    isWinOpen: boolean;
    isForcedLandscape?: boolean;
    selectedDeviceId: string | null;
    onCameraActive: () => void;
    onCameraInactive?: () => void;
    onWin: (winnerInfo: WinnerInfo) => void;
    setPlayersRef: (players: Player[]) => void;
    cameraTriggerRef: React.MutableRefObject<((deviceId?: string) => Promise<void>) | null>;
    onDevicesUpdated?: (devices: CameraDevice[]) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
    language,
    isPlaying,
    selectedMode,
    isWinOpen,
    isForcedLandscape = false,
    selectedDeviceId,
    onCameraActive,
    onCameraInactive,
    onWin,
    setPlayersRef,
    cameraTriggerRef,
    onDevicesUpdated
}) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const gameCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const uiCursorCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const cleanBgCanvasRef = useRef<HTMLCanvasElement | null>(null);

    const playersRef = useRef<Player[]>([]);
    const cameraInstanceRef = useRef<CameraController | null>(null);
    const handsInstanceRef = useRef<Hands | null>(null);
    const handUiControllerRef = useRef(createHandUiController());

    // Keep props in refs for use in the MediaPipe callback
    const languageRef = useRef(language);
    const isPlayingRef = useRef(isPlaying);
    const selectedModeRef = useRef(selectedMode);
    const isWinOpenRef = useRef(isWinOpen);
    const selectedDeviceIdRef = useRef(selectedDeviceId);
    const onDevicesUpdatedRef = useRef(onDevicesUpdated);
    const onCameraInactiveRef = useRef(onCameraInactive);
    const isForcedLandscapeRef = useRef(isForcedLandscape);
    const resizeCanvasRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        isForcedLandscapeRef.current = isForcedLandscape;
        if (resizeCanvasRef.current) {
            resizeCanvasRef.current();
        }
    }, [isForcedLandscape]);

    useEffect(() => {
        onCameraInactiveRef.current = onCameraInactive;
    }, [onCameraInactive]);

    useEffect(() => {
        languageRef.current = language;
    }, [language]);

    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    useEffect(() => {
        selectedModeRef.current = selectedMode;
    }, [selectedMode]);

    // Dynamic hand detection limit: 2 hands for Main Menu & Single Player, 4 hands for Multiplayer
    useEffect(() => {
        const targetMaxHands = isPlaying && selectedMode === 'multi' ? 4 : 2;
        if (handsInstanceRef.current) {
            handsInstanceRef.current.setOptions({
                maxNumHands: targetMaxHands
            });
        }
    }, [isPlaying, selectedMode]);

    useEffect(() => {
        isWinOpenRef.current = isWinOpen;
    }, [isWinOpen]);

    useEffect(() => {
        selectedDeviceIdRef.current = selectedDeviceId;
        if (cameraInstanceRef.current && selectedDeviceId) {
            cameraInstanceRef.current.switchDevice(selectedDeviceId).catch((err) => {
                console.warn('Failed to switch camera device:', err);
            });
        }
    }, [selectedDeviceId]);

    useEffect(() => {
        onDevicesUpdatedRef.current = onDevicesUpdated;
    }, [onDevicesUpdated]);

    // Handle device changes (e.g. plugging/unplugging webcam)
    useEffect(() => {
        const handleDeviceChange = async () => {
            const devices = await CameraController.getAvailableDevices();
            if (onDevicesUpdatedRef.current) {
                onDevicesUpdatedRef.current(devices);
            }
        };

        if (navigator.mediaDevices && navigator.mediaDevices.addEventListener) {
            navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
            return () => {
                navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
            };
        }
    }, []);

    // Handle game start and mode changes
    useEffect(() => {
        if (isPlaying && selectedMode && gameCanvasRef.current) {
            const canvas = gameCanvasRef.current;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) return;

            const gameContext = {
                ctx,
                canvasElement: canvas,
                getSelectedMode: () => selectedModeRef.current,
                getLanguage: () => languageRef.current,
                getPlayers: () => playersRef.current,
                getCleanFrameCrop: (box: import('../types/game').Box) => {
                    const cleanCanvas = cleanBgCanvasRef.current;
                    if (!cleanCanvas) return null;
                    const temp = document.createElement('canvas');
                    temp.width = box.w;
                    temp.height = box.h;
                    const tCtx = temp.getContext('2d');
                    if (!tCtx) return null;
                    tCtx.drawImage(cleanCanvas, box.x, box.y, box.w, box.h, 0, 0, box.w, box.h);
                    return temp;
                },
                triggerWinScreen: (winnerPlayer: Player) => {
                    const tempCanvas = document.createElement('canvas');
                    if (winnerPlayer.box) {
                        tempCanvas.width = winnerPlayer.box.w;
                        tempCanvas.height = winnerPlayer.box.h;
                        const tctx = tempCanvas.getContext('2d');
                        if (tctx) {
                            winnerPlayer.pieces.forEach(p => {
                                if (winnerPlayer.box) {
                                    tctx.drawImage(
                                        p.image,
                                        p.drawX - winnerPlayer.box.x,
                                        p.drawY - winnerPlayer.box.y
                                    );
                                }
                            });
                        }
                    }

                    onWin({
                        id: winnerPlayer.id,
                        color: winnerPlayer.color,
                        elapsedTime: winnerPlayer.elapsedTime,
                        formattedTime: winnerPlayer.formatTime(winnerPlayer.elapsedTime),
                        imageSrc: tempCanvas.toDataURL('image/png')
                    });
                }
            };

            const isForced = isForcedLandscapeRef.current;
            const w = isForced ? Math.max(window.innerWidth, window.innerHeight) : canvas.width;
            const h = isForced ? Math.min(window.innerWidth, window.innerHeight) : canvas.height;

            const newPlayers: Player[] = [];
            if (selectedMode === 'single') {
                newPlayers.push(new Player(1, { x: 0, y: 0, w, h }, COLOR_P1, gameContext));
            } else {
                const halfW = w / 2;
                newPlayers.push(new Player(1, { x: 0, y: 0, w: halfW, h }, COLOR_P1, gameContext));
                newPlayers.push(new Player(2, { x: halfW, y: 0, w: halfW, h }, COLOR_P2, gameContext));
            }

            playersRef.current = newPlayers;
            setPlayersRef(newPlayers);
        } else if (!isPlaying) {
            playersRef.current.forEach(p => {
                if (p.intervalId) {
                    clearInterval(p.intervalId);
                    p.intervalId = null;
                }
            });
            playersRef.current = [];
            setPlayersRef([]);
        }
    }, [isPlaying, selectedMode, onWin, setPlayersRef]);

    useEffect(() => {
        const resizeCanvas = () => {
            if (gameCanvasRef.current && uiCursorCanvasRef.current) {
                const width = isForcedLandscapeRef.current
                    ? Math.max(window.innerWidth, window.innerHeight)
                    : window.innerWidth;
                const height = isForcedLandscapeRef.current
                    ? Math.min(window.innerWidth, window.innerHeight)
                    : window.innerHeight;

                gameCanvasRef.current.width = width;
                gameCanvasRef.current.height = height;
                uiCursorCanvasRef.current.width = width;
                uiCursorCanvasRef.current.height = height;
                if (cleanBgCanvasRef.current) {
                    cleanBgCanvasRef.current.width = width;
                    cleanBgCanvasRef.current.height = height;
                }

                if (playersRef.current.length > 0) {
                    const mode = selectedModeRef.current;
                    if (mode === 'single' && playersRef.current[0]) {
                        playersRef.current[0].updateBounds({ x: 0, y: 0, w: width, h: height });
                    } else if (mode === 'multi' && playersRef.current.length >= 2) {
                        const halfW = width / 2;
                        playersRef.current[0].updateBounds({ x: 0, y: 0, w: halfW, h: height });
                        playersRef.current[1].updateBounds({ x: halfW, y: 0, w: halfW, h: height });
                    }
                }
            }
        };

        resizeCanvasRef.current = resizeCanvas;
        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('orientationchange', resizeCanvas);
        resizeCanvas();

        const videoElement = videoRef.current;
        const gameCanvas = gameCanvasRef.current;
        const uiCursorCanvas = uiCursorCanvasRef.current;

        if (!videoElement || !gameCanvas || !uiCursorCanvas) return;

        const ctx = gameCanvas.getContext('2d', { willReadFrequently: true });
        const uiCursorCtx = uiCursorCanvas.getContext('2d');
        if (!ctx || !uiCursorCtx) return;

        const onResults = (results: MediaPipeResults) => {
            onCameraActive();

            if (!cleanBgCanvasRef.current) {
                cleanBgCanvasRef.current = document.createElement('canvas');
            }
            if (cleanBgCanvasRef.current.width !== gameCanvas.width || cleanBgCanvasRef.current.height !== gameCanvas.height) {
                cleanBgCanvasRef.current.width = gameCanvas.width;
                cleanBgCanvasRef.current.height = gameCanvas.height;
            }

            const canvasRatio = gameCanvas.width / gameCanvas.height;
            const videoRatio = (results.image.width || 1280) / (results.image.height || 720);
            let dw: number, dh: number, dx: number, dy: number;

            if (canvasRatio > videoRatio) {
                dw = gameCanvas.width;
                dh = gameCanvas.width / videoRatio;
                dx = 0;
                dy = (gameCanvas.height - dh) / 2;
            } else {
                dw = gameCanvas.height * videoRatio;
                dh = gameCanvas.height;
                dx = (gameCanvas.width - dw) / 2;
                dy = 0;
            }

            // Draw pristine mirrored webcam image to clean offscreen buffer
            const cleanCanvas = cleanBgCanvasRef.current;
            const cleanCtx = cleanCanvas.getContext('2d', { willReadFrequently: true });
            if (cleanCtx) {
                cleanCtx.save();
                cleanCtx.clearRect(0, 0, cleanCanvas.width, cleanCanvas.height);
                cleanCtx.translate(cleanCanvas.width, 0);
                cleanCtx.scale(-1, 1);
                cleanCtx.drawImage(results.image as CanvasImageSource, dx, dy, dw, dh);
                cleanCtx.restore();
            }

            // Draw dimmed mirrored background to visible gameCanvas
            ctx.save();
            ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
            ctx.filter = "brightness(0.5)";
            ctx.drawImage(cleanCanvas, 0, 0);
            ctx.filter = "none";
            ctx.restore();

            const isMenuOrWinOpen = !isPlayingRef.current || isWinOpenRef.current;
            const currentPlayers = playersRef.current;
            const activeMode = selectedModeRef.current;
            const maxHands = isPlayingRef.current && activeMode === 'multi' ? 4 : 2;

            const mappedHands: Landmarks[] = [];
            if (results.multiHandLandmarks) {
                const limitedLandmarks = results.multiHandLandmarks.slice(0, maxHands);
                for (const landmarks of limitedLandmarks) {
                    const mapped = landmarks.map(lm => {
                        let x = lm.x * dw + dx;
                        const y = lm.y * dh + dy;
                        x = gameCanvas.width - x;
                        return { x, y, z: lm.z };
                    });
                    mappedHands.push(mapped);
                }
            }

            uiCursorCtx.clearRect(0, 0, uiCursorCanvas.width, uiCursorCanvas.height);

            if (isPlayingRef.current && currentPlayers.length > 0) {
                if (activeMode === 'multi') {
                    ctx.save();
                    ctx.strokeStyle = "rgba(242, 243, 244, 0.4)";
                    ctx.shadowColor = "#f2f3f4";
                    ctx.shadowBlur = 10;
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    ctx.moveTo(gameCanvas.width / 2, 0);
                    ctx.lineTo(gameCanvas.width / 2, gameCanvas.height);
                    ctx.stroke();
                    ctx.restore();
                }

                let p1Hands: Landmarks[] = [];
                let p2Hands: Landmarks[] = [];

                if (activeMode === 'single') {
                    p1Hands = mappedHands.slice(0, 2);
                } else if (activeMode === 'multi') {
                    mappedHands.forEach(hand => {
                        const avgX = hand.reduce((sum, lm) => sum + lm.x, 0) / hand.length;
                        if (avgX < gameCanvas.width / 2) {
                            if (p1Hands.length < 2) p1Hands.push(hand);
                        } else {
                            if (p2Hands.length < 2) p2Hands.push(hand);
                        }
                    });
                }

                if (currentPlayers[0]) currentPlayers[0].update(p1Hands);
                if (currentPlayers[1]) currentPlayers[1].update(p2Hands);

                if (activeMode === 'multi') {
                    const bothReady = currentPlayers.every(p => p.state !== 'CALIBRATING');
                    if (bothReady) {
                        currentPlayers.forEach(p => {
                            if (p.state === 'WAITING') p.startPlaying();
                        });
                    }
                }

                // In-game skeleton drawing
                if (activeMode === 'single') {
                    mappedHands.forEach(hand => drawSkeleton(hand, COLOR_P1, ctx));
                } else {
                    mappedHands.forEach(hand => {
                        const avgX = hand.reduce((sum, lm) => sum + lm.x, 0) / hand.length;
                        if (avgX < gameCanvas.width / 2) drawSkeleton(hand, COLOR_P1, ctx);
                        else drawSkeleton(hand, COLOR_P2, ctx);
                    });
                }
            }

            // Process Hand Interaction with UI
            if (mappedHands.length > 0) {
                handUiControllerRef.current.processHandInteractions(
                    mappedHands,
                    isMenuOrWinOpen,
                    uiCursorCtx
                );
            }
        };

        const { hands, camera } = initMediaPipe({
            videoElement,
            onResultsCallback: onResults,
            onCameraInactive: () => {
                if (onCameraInactiveRef.current) {
                    onCameraInactiveRef.current();
                }
            },
            maxNumHands: 2
        });

        handsInstanceRef.current = hands;
        cameraInstanceRef.current = camera;

        const startCam = async (deviceId?: string) => {
            if (cameraInstanceRef.current) {
                try {
                    const targetId = deviceId || selectedDeviceIdRef.current || undefined;
                    await cameraInstanceRef.current.start(targetId);
                    const devices = await CameraController.getAvailableDevices();
                    if (onDevicesUpdatedRef.current) {
                        onDevicesUpdatedRef.current(devices);
                    }
                } catch (err) {
                    console.warn("Camera start failed, waiting for user click:", err);
                    throw err;
                }
            }
        };

        cameraTriggerRef.current = startCam;

        // Auto attempt to start camera
        startCam().catch(() => {});

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('orientationchange', resizeCanvas);
            resizeCanvasRef.current = null;
            if (cameraInstanceRef.current) {
                cameraInstanceRef.current.stop();
            }
            if (handsInstanceRef.current) {
                handsInstanceRef.current.close().catch(() => {});
                handsInstanceRef.current = null;
            }
        };
    }, [onCameraActive, cameraTriggerRef]);

    return (
        <>
            <video ref={videoRef} autoPlay playsInline className="hidden" />
            <canvas ref={gameCanvasRef} id="game-canvas" className="block w-full h-full object-cover" />
            <canvas ref={uiCursorCanvasRef} id="ui-cursor-canvas" className="absolute inset-0 z-[70] pointer-events-none w-full h-full" />
        </>
    );
};
