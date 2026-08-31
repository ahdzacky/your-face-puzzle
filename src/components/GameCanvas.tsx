import React, { useEffect, useRef } from 'react';
import { COLOR_P1, COLOR_P2 } from '../constants';
import { Player } from '../core/Player';
import { createHandUiController, drawSkeleton, initMediaPipe } from '../core/handTracking';
import { GameMode, Landmarks, Language, WinnerInfo } from '../types/game';
import { Camera, MediaPipeResults } from '../types/mediapipe';

interface GameCanvasProps {
    language: Language;
    isPlaying: boolean;
    selectedMode: GameMode | null;
    isWinOpen: boolean;
    onCameraActive: () => void;
    onWin: (winnerInfo: WinnerInfo) => void;
    setPlayersRef: (players: Player[]) => void;
    cameraTriggerRef: React.MutableRefObject<(() => Promise<void>) | null>;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
    language,
    isPlaying,
    selectedMode,
    isWinOpen,
    onCameraActive,
    onWin,
    setPlayersRef,
    cameraTriggerRef
}) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const gameCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const uiCursorCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const cleanBgCanvasRef = useRef<HTMLCanvasElement | null>(null);

    const playersRef = useRef<Player[]>([]);
    const cameraInstanceRef = useRef<Camera | null>(null);
    const handUiControllerRef = useRef(createHandUiController());

    // Keep props in refs for use in the MediaPipe callback
    const languageRef = useRef(language);
    const isPlayingRef = useRef(isPlaying);
    const selectedModeRef = useRef(selectedMode);
    const isWinOpenRef = useRef(isWinOpen);

    useEffect(() => {
        languageRef.current = language;
    }, [language]);

    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    useEffect(() => {
        selectedModeRef.current = selectedMode;
    }, [selectedMode]);

    useEffect(() => {
        isWinOpenRef.current = isWinOpen;
    }, [isWinOpen]);

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

            const newPlayers: Player[] = [];
            if (selectedMode === 'single') {
                newPlayers.push(new Player(1, { x: 0, y: 0, w: canvas.width, h: canvas.height }, COLOR_P1, gameContext));
            } else {
                const halfW = canvas.width / 2;
                newPlayers.push(new Player(1, { x: 0, y: 0, w: halfW, h: canvas.height }, COLOR_P1, gameContext));
                newPlayers.push(new Player(2, { x: halfW, y: 0, w: halfW, h: canvas.height }, COLOR_P2, gameContext));
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
                gameCanvasRef.current.width = window.innerWidth;
                gameCanvasRef.current.height = window.innerHeight;
                uiCursorCanvasRef.current.width = window.innerWidth;
                uiCursorCanvasRef.current.height = window.innerHeight;
                if (cleanBgCanvasRef.current) {
                    cleanBgCanvasRef.current.width = window.innerWidth;
                    cleanBgCanvasRef.current.height = window.innerHeight;
                }
            }
        };

        window.addEventListener('resize', resizeCanvas);
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

            const mappedHands: Landmarks[] = [];
            if (results.multiHandLandmarks) {
                for (const landmarks of results.multiHandLandmarks) {
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

            const isMenuOrWinOpen = !isPlayingRef.current || isWinOpenRef.current;
            const currentPlayers = playersRef.current;
            const activeMode = selectedModeRef.current;

            if (isPlayingRef.current && currentPlayers.length > 0) {
                if (activeMode === 'multi') {
                    ctx.save();
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
                    ctx.shadowColor = "white";
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
                    p1Hands = mappedHands;
                } else if (activeMode === 'multi') {
                    mappedHands.forEach(hand => {
                        const avgX = hand.reduce((sum, lm) => sum + lm.x, 0) / hand.length;
                        if (avgX < gameCanvas.width / 2) {
                            p1Hands.push(hand);
                        } else {
                            p2Hands.push(hand);
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

        const { camera } = initMediaPipe({
            videoElement,
            onResultsCallback: onResults
        });

        cameraInstanceRef.current = camera;

        const startCam = async () => {
            if (cameraInstanceRef.current) {
                try {
                    await cameraInstanceRef.current.start();
                } catch (err) {
                    console.warn("Camera start failed, waiting for user click:", err);
                }
            }
        };

        cameraTriggerRef.current = startCam;

        // Auto attempt to start camera
        startCam();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (cameraInstanceRef.current) {
                cameraInstanceRef.current.stop().catch(() => {});
            }
        };
    }, [onCameraActive, cameraTriggerRef]);

    return (
        <>
            <video ref={videoRef} autoPlay playsInline className="hidden" />
            <canvas ref={gameCanvasRef} id="game-canvas" className="block w-screen h-screen object-cover" />
            <canvas ref={uiCursorCanvasRef} id="ui-cursor-canvas" className="absolute inset-0 z-[70] pointer-events-none" />
        </>
    );
};
