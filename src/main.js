import { COLOR_P1, COLOR_P2 } from './constants.js';
import { Player } from './Player.js';
import { drawSkeleton, createHandUiController, initMediaPipe } from './handTracking.js';

// --- DOM ELEMENTS ---
const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('game-canvas');
const ctx = canvasElement.getContext('2d', { willReadFrequently: true });
const uiCursorCanvas = document.getElementById('ui-cursor-canvas');
const uiCursorCtx = uiCursorCanvas.getContext('2d');

// UI Layers
const uiLayer = document.getElementById('ui-layer');
const winScreen = document.getElementById('win-screen');
const ingameUi = document.getElementById('ingame-ui');

// Menu Elements
const cardSingle = document.getElementById('card-single');
const cardMulti = document.getElementById('card-multi');
const btnStartCam = document.getElementById('btn-start-cam');
const btnStartGame = document.getElementById('btn-start-game');

// Win Screen Elements
const winTitle = document.getElementById('win-title');
const winCard = document.getElementById('win-card');
const winImage = document.getElementById('win-image');
const winTime = document.getElementById('win-time');
const btnPlayAgain = document.getElementById('btn-play-again');

// Ingame Controls Elements
const p1Controls = document.getElementById('p1-controls');
const p2Controls = document.getElementById('p2-controls');
const btnShuffleP1 = document.getElementById('btn-shuffle-p1');
const btnRecalibP1 = document.getElementById('btn-recalib-p1');
const btnShuffleP2 = document.getElementById('btn-shuffle-p2');
const btnRecalibP2 = document.getElementById('btn-recalib-p2');
const btnExitGame = document.getElementById('btn-exit-game');

// --- GLOBAL STATE ---
let selectedMode = null; // 'single' or 'multi'
let isCameraOn = false;
let isPlaying = false;
let players = [];
let globalWinner = null;

const handUiController = createHandUiController();

function resizeCanvas() {
    canvasElement.width = window.innerWidth;
    canvasElement.height = window.innerHeight;
    uiCursorCanvas.width = window.innerWidth;
    uiCursorCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Game context passed to players
const gameContext = {
    ctx,
    canvasElement,
    getSelectedMode: () => selectedMode,
    getPlayers: () => players,
    triggerWinScreen: (winnerPlayer) => triggerWinScreen(winnerPlayer)
};

// --- UPDATE MENU UI ---
function updateMenuUI() {
    if (selectedMode === 'single') {
        cardSingle.classList.add('selected');
        cardMulti.classList.remove('selected');
    } else if (selectedMode === 'multi') {
        cardMulti.classList.add('selected');
        cardSingle.classList.remove('selected');
    } else {
        cardSingle.classList.remove('selected');
        cardMulti.classList.remove('selected');
    }

    if (isCameraOn && selectedMode) {
        btnStartGame.classList.remove('cursor-not-allowed', 'opacity-40');
        btnStartGame.classList.add('cursor-pointer', 'opacity-100', 'hover:scale-[1.03]');
        btnStartGame.disabled = false;
    } else {
        btnStartGame.classList.add('cursor-not-allowed', 'opacity-40');
        btnStartGame.classList.remove('cursor-pointer', 'opacity-100', 'hover:scale-[1.03]');
        btnStartGame.disabled = true;
    }
}

// Menu Event Listeners
cardSingle.addEventListener('click', () => { selectedMode = 'single'; updateMenuUI(); });
cardMulti.addEventListener('click', () => { selectedMode = 'multi'; updateMenuUI(); });

function startCamera() {
    if (!isCameraOn) {
        btnStartCam.innerText = "LOADING CAMERA...";
        btnStartCam.disabled = true;
        if (typeof cameraInstance !== 'undefined' && cameraInstance) {
            cameraInstance.start().catch(err => {
                console.warn("Camera start error, waiting for user click:", err);
                btnStartCam.innerText = "ACTIVATE CAMERA";
                btnStartCam.disabled = false;
            });
        }
    }
}

btnStartCam.addEventListener('click', startCamera);

function cameraReady() {
    if (!isCameraOn) {
        isCameraOn = true;
        btnStartCam.innerText = "CAMERA ACTIVE";
        btnStartCam.classList.remove('border-gray-600/80', 'text-gray-300');
        btnStartCam.classList.add('bg-[#00f0ff]/20', 'text-[#00f0ff]', 'border-[#00f0ff]', 'shadow-[0_0_15px_rgba(0,240,255,0.6)]');
        btnStartCam.disabled = true;
        updateMenuUI();
    }
}

btnStartGame.addEventListener('click', () => {
    if (isCameraOn && selectedMode) {
        uiLayer.classList.add('hidden');
        ingameUi.classList.remove('hidden');
        players = [];
        if (selectedMode === 'single') {
            p2Controls.classList.add('hidden');
            btnShuffleP1.innerText = "ACAK ULANG";
            btnRecalibP1.innerText = "FOTO ULANG";
            players.push(new Player(1, { x: 0, y: 0, w: canvasElement.width, h: canvasElement.height }, COLOR_P1, gameContext));
        } else {
            p2Controls.classList.remove('hidden');
            btnShuffleP1.innerText = "P1: ACAK";
            btnRecalibP1.innerText = "P1: FOTO ULANG";
            btnShuffleP2.innerText = "P2: ACAK";
            btnRecalibP2.innerText = "P2: FOTO ULANG";
            let halfW = canvasElement.width / 2;
            players.push(new Player(1, { x: 0, y: 0, w: halfW, h: canvasElement.height }, COLOR_P1, gameContext));
            players.push(new Player(2, { x: halfW, y: 0, w: halfW, h: canvasElement.height }, COLOR_P2, gameContext));
        }
        globalWinner = null;
        isPlaying = true;
    }
});

function returnToMainMenu() {
    ingameUi.classList.add('hidden');
    winScreen.classList.add('hidden');
    uiLayer.classList.remove('hidden');
    players.forEach(p => {
        if (p.intervalId) clearInterval(p.intervalId);
    });
    selectedMode = null;
    isPlaying = false;
    players = [];
    globalWinner = null;
    updateMenuUI();
}

btnExitGame.addEventListener('click', returnToMainMenu);
btnPlayAgain.addEventListener('click', returnToMainMenu);

// In-game reset / shuffle / recalibrate handlers
btnShuffleP1.addEventListener('click', () => {
    if (players[0] && players[0].pieces.length > 0) {
        players[0].shufflePuzzle();
    }
});

btnRecalibP1.addEventListener('click', () => {
    if (selectedMode === 'multi') {
        players.forEach(p => p && p.recalibrate());
    } else if (players[0]) {
        players[0].recalibrate();
    }
});

btnShuffleP2.addEventListener('click', () => {
    if (players[1] && players[1].pieces.length > 0) {
        players[1].shufflePuzzle();
    }
});

btnRecalibP2.addEventListener('click', () => {
    if (selectedMode === 'multi') {
        players.forEach(p => p && p.recalibrate());
    } else if (players[1]) {
        players[1].recalibrate();
    }
});

// --- GLOBAL WIN OVERLAY FUNCTION ---
function triggerWinScreen(winnerPlayer) {
    isPlaying = false;
    ingameUi.classList.add('hidden');

    let tempCanvas = document.createElement('canvas');
    tempCanvas.width = winnerPlayer.box.w;
    tempCanvas.height = winnerPlayer.box.h;
    let tctx = tempCanvas.getContext('2d');

    winnerPlayer.pieces.forEach(p => {
        tctx.drawImage(p.image, p.drawX - winnerPlayer.box.x, p.drawY - winnerPlayer.box.y);
    });

    winImage.src = tempCanvas.toDataURL('image/png');
    winTime.innerText = `WAKTU: ${winnerPlayer.formatTime(winnerPlayer.elapsedTime)}`;

    if (selectedMode === 'multi') {
        winTitle.innerText = `PLAYER ${winnerPlayer.id} MENANG!`;
        winTitle.style.color = winnerPlayer.color;
        winTitle.style.textShadow = `0 0 15px ${winnerPlayer.color}`;
        winCard.style.borderColor = winnerPlayer.color;
        winCard.style.boxShadow = `0 0 30px ${winnerPlayer.color}66`;
    } else {
        winTitle.innerText = `SELESAI!`;
        winTitle.style.color = COLOR_P1;
        winTitle.style.textShadow = `0 0 15px ${COLOR_P1}`;
        winCard.style.borderColor = COLOR_P1;
        winCard.style.boxShadow = `0 0 30px ${COLOR_P1}66`;
    }

    winScreen.classList.remove('hidden');
}

// --- MEDIAPIPE FRAME HANDLER ---
function onResults(results) {
    cameraReady();

    ctx.save();
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    const canvasRatio = canvasElement.width / canvasElement.height;
    const videoRatio = results.image.width / results.image.height;
    let dw, dh, dx, dy;

    if (canvasRatio > videoRatio) {
        dw = canvasElement.width;
        dh = canvasElement.width / videoRatio;
        dx = 0;
        dy = (canvasElement.height - dh) / 2;
    } else {
        dw = canvasElement.height * videoRatio;
        dh = canvasElement.height;
        dx = (canvasElement.width - dw) / 2;
        dy = 0;
    }

    ctx.translate(canvasElement.width, 0);
    ctx.scale(-1, 1);
    ctx.filter = "brightness(0.5)";
    ctx.drawImage(results.image, dx, dy, dw, dh);
    ctx.filter = "none";
    ctx.restore();

    let mappedHands = [];
    if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
            let mapped = landmarks.map(lm => {
                let x = lm.x * dw + dx;
                let y = lm.y * dh + dy;
                x = canvasElement.width - x;
                return { x, y, z: lm.z };
            });
            mappedHands.push(mapped);
        }
    }

    uiCursorCtx.clearRect(0, 0, uiCursorCanvas.width, uiCursorCanvas.height);

    const isMenuOrWinOpen = !isPlaying || !winScreen.classList.contains('hidden');

    if (isPlaying && players.length > 0) {
        if (selectedMode === 'multi') {
            ctx.save();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
            ctx.shadowColor = "white";
            ctx.shadowBlur = 10;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(canvasElement.width / 2, 0);
            ctx.lineTo(canvasElement.width / 2, canvasElement.height);
            ctx.stroke();
            ctx.restore();
        }

        let p1Hands = [];
        let p2Hands = [];

        if (selectedMode === 'single') {
            p1Hands = mappedHands;
        } else if (selectedMode === 'multi') {
            mappedHands.forEach(hand => {
                let avgX = hand.reduce((sum, lm) => sum + lm.x, 0) / hand.length;
                if (avgX < canvasElement.width / 2) {
                    p1Hands.push(hand);
                } else {
                    p2Hands.push(hand);
                }
            });
        }

        if (players[0]) players[0].update(p1Hands);
        if (players[1]) players[1].update(p2Hands);

        if (selectedMode === 'multi') {
            let bothReady = players.every(p => p.state !== 'CALIBRATING');
            if (bothReady) {
                players.forEach(p => {
                    if (p.state === 'WAITING') p.startPlaying();
                });
            }
        }

        // In-game skeleton drawing
        if (selectedMode === 'single') {
            mappedHands.forEach(hand => drawSkeleton(hand, COLOR_P1, ctx));
        } else {
            mappedHands.forEach(hand => {
                let avgX = hand.reduce((sum, lm) => sum + lm.x, 0) / hand.length;
                if (avgX < canvasElement.width / 2) drawSkeleton(hand, COLOR_P1, ctx);
                else drawSkeleton(hand, COLOR_P2, ctx);
            });
        }
    }

    // Process Hand Interaction with UI
    if (mappedHands.length > 0) {
        handUiController.processHandInteractions(mappedHands, isMenuOrWinOpen, uiCursorCtx);
    }
}

// Inisialisasi MediaPipe
const { camera: cameraInstance } = initMediaPipe({
    videoElement,
    onResultsCallback: onResults
});

// Otomatis nyalakan kamera saat halaman dibuka
startCamera();
