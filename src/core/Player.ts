import { PINCH_THRESHOLD, getDistance } from '../constants';
import { translations } from '../i18n/translations';
import { Box, GameEngineContext, HandState, Landmarks, PlayerState, PuzzlePiece, Slot } from '../types/game';

export class Player {
    public id: number;
    public bounds: Box;
    public color: string;
    public gameContext: GameEngineContext;
    public state: PlayerState;
    public box: Box | null;
    public pieces: PuzzlePiece[];
    public slots: Slot[];
    public handStates: HandState[];
    public startTime: number | null;
    public elapsedTime: number;
    public intervalId: ReturnType<typeof setInterval> | null;

    constructor(id: number, bounds: Box, color: string, gameContext: GameEngineContext) {
        this.id = id;
        this.bounds = bounds;
        this.color = color;
        this.gameContext = gameContext;
        this.state = 'CALIBRATING';
        this.box = null;
        this.pieces = [];
        this.slots = [];
        this.handStates = [];
        this.startTime = null;
        this.elapsedTime = 0;
        this.intervalId = null;
    }

    get ctx(): CanvasRenderingContext2D {
        return this.gameContext.ctx;
    }

    update(handsData: Landmarks[]): void {
        if (this.state === 'CALIBRATING') {
            this.handleCalibration(handsData);
        } else if (this.state === 'WAITING') {
            this.drawWaiting();
        } else if (this.state === 'PLAYING') {
            this.handleGameplay(handsData);
        } else if (this.state === 'LOSE') {
            this.drawWaiting(true);
        }
    }

    handleCalibration(handsData: Landmarks[]): void {
        const ctx = this.ctx;
        const lang = this.gameContext.getLanguage ? this.gameContext.getLanguage() : 'en';
        const t = translations[lang] || translations.en;

        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 18;
        ctx.font = "900 42px 'Sora', sans-serif";
        ctx.textAlign = "center";
        const msgX = this.bounds.x + this.bounds.w / 2;
        ctx.fillText(t.playerRaiseHands(this.id), msgX, 70);

        ctx.font = "bold 26px 'Sora', sans-serif";
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowColor = "#000000";
        ctx.shadowBlur = 12;
        ctx.fillText(t.spreadFingers, msgX, 115);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        ctx.fillText(t.pinchToCapture, msgX, 155);
        ctx.restore();

        if (handsData.length >= 2) {
            const hA = handsData[0];
            const hB = handsData[1];

            const leftHand = hA[0].x < hB[0].x ? hA : hB;
            const rightHand = hA[0].x < hB[0].x ? hB : hA;

            const pLeftThumb = leftHand[4];
            const pRightIndex = rightHand[8];

            const left = Math.min(pLeftThumb.x, pRightIndex.x);
            const right = Math.max(pLeftThumb.x, pRightIndex.x);
            const top = Math.min(pLeftThumb.y, pRightIndex.y);
            const bottom = Math.max(pLeftThumb.y, pRightIndex.y);

            const w = right - left;
            const h = bottom - top;

            if (w > 50 && h > 50) {
                this.box = { x: left, y: top, w, h };

                ctx.save();
                ctx.strokeStyle = "white";
                ctx.shadowColor = "white";
                ctx.shadowBlur = 15;
                ctx.lineWidth = 4;
                ctx.strokeRect(this.box.x, this.box.y, this.box.w, this.box.h);
                ctx.restore();

                const pinchLeft = getDistance(leftHand[4], leftHand[8]) < PINCH_THRESHOLD;
                const pinchRight = getDistance(rightHand[4], rightHand[8]) < PINCH_THRESHOLD;

                if (pinchLeft) {
                    ctx.save();
                    ctx.strokeStyle = "white";
                    ctx.shadowColor = "white";
                    ctx.shadowBlur = 20;
                    ctx.lineWidth = 6;
                    ctx.beginPath();
                    ctx.moveTo(leftHand[4].x, leftHand[4].y);
                    ctx.lineTo(leftHand[8].x, leftHand[8].y);
                    ctx.stroke();
                    ctx.restore();
                }

                if (pinchRight) {
                    ctx.save();
                    ctx.strokeStyle = "white";
                    ctx.shadowColor = "white";
                    ctx.shadowBlur = 20;
                    ctx.lineWidth = 6;
                    ctx.beginPath();
                    ctx.moveTo(rightHand[4].x, rightHand[4].y);
                    ctx.lineTo(rightHand[8].x, rightHand[8].y);
                    ctx.stroke();
                    ctx.restore();
                }

                if (pinchLeft && pinchRight) {
                    this.capturePuzzle();
                }
            }
        }
    }

    capturePuzzle(): void {
        if (!this.box) return;
        const tempCanvas = this.gameContext.getCleanFrameCrop(this.box);
        if (!tempCanvas) return;

        const pieceW = this.box.w / 3;
        const pieceH = this.box.h / 3;

        this.pieces = [];
        this.slots = [];

        for (let i = 0; i < 9; i++) {
            const row = Math.floor(i / 3);
            const col = i % 3;

            const pX = this.box.x + col * pieceW;
            const pY = this.box.y + row * pieceH;

            this.slots.push({ x: pX, y: pY, w: pieceW, h: pieceH });

            const pieceCanvas = document.createElement('canvas');
            pieceCanvas.width = pieceW;
            pieceCanvas.height = pieceH;
            const pieceCtx = pieceCanvas.getContext('2d');
            if (pieceCtx) {
                pieceCtx.drawImage(tempCanvas, col * pieceW, row * pieceH, pieceW, pieceH, 0, 0, pieceW, pieceH);
            }

            this.pieces.push({ id: i, currentSlot: i, image: pieceCanvas, drawX: pX, drawY: pY });
        }

        this.shufflePuzzle();

        if (this.gameContext.getSelectedMode() === 'multi') {
            this.state = 'WAITING';
        } else {
            this.startPlaying();
        }
    }

    shufflePuzzle(): void {
        if (this.pieces.length === 0) return;
        const slotIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        do {
            for (let i = slotIndices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [slotIndices[i], slotIndices[j]] = [slotIndices[j], slotIndices[i]];
            }
        } while (slotIndices.every((val, idx) => val === idx));

        this.handStates = [];
        this.pieces.forEach((p, index) => {
            p.currentSlot = slotIndices[index];
            this.snapToSlot(p);
        });
    }

    recalibrate(): void {
        this.state = 'CALIBRATING';
        this.box = null;
        this.pieces = [];
        this.slots = [];
        this.handStates = [];
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.elapsedTime = 0;
    }

    startPlaying(): void {
        this.state = 'PLAYING';
        this.startTime = Date.now();
        if (this.intervalId) clearInterval(this.intervalId);
        this.intervalId = setInterval(() => {
            if (this.startTime) {
                this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
            }
        }, 1000);
    }

    snapToSlot(piece: PuzzlePiece): void {
        const slot = this.slots[piece.currentSlot];
        if (slot) {
            piece.drawX = slot.x;
            piece.drawY = slot.y;
        }
    }

    drawWaiting(isLose: boolean = false): void {
        const ctx = this.ctx;
        this.pieces.forEach((p) => {
            ctx.drawImage(p.image, p.drawX, p.drawY);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
            ctx.lineWidth = 1;
            ctx.strokeRect(p.drawX, p.drawY, p.image.width, p.image.height);
        });

        if (!isLose) {
            const lang = this.gameContext.getLanguage ? this.gameContext.getLanguage() : 'en';
            const t = translations[lang] || translations.en;

            ctx.save();
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 20;
            ctx.font = "900 42px 'Sora', sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(t.waitingOpponent, this.bounds.x + this.bounds.w / 2, 75);
            ctx.restore();
        }
    }

    handleGameplay(handsData: Landmarks[]): void {
        const ctx = this.ctx;
        // Grid Background
        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 1;
        this.slots.forEach(slot => ctx.strokeRect(slot.x, slot.y, slot.w, slot.h));
        ctx.restore();

        // Release any held pieces from hands that are no longer detected
        if (this.handStates.length > handsData.length) {
            for (let i = handsData.length; i < this.handStates.length; i++) {
                const hs = this.handStates[i];
                if (hs && hs.heldPieceIndex !== -1) {
                    const piece = this.pieces[hs.heldPieceIndex];
                    if (piece) this.snapToSlot(piece);
                    hs.heldPieceIndex = -1;
                    hs.isPinching = false;
                }
            }
            this.handStates.length = handsData.length;
        }

        // Process each active hand independently
        handsData.forEach((h, hIdx) => {
            const cursor = { x: (h[4].x + h[8].x) / 2, y: (h[4].y + h[8].y) / 2 };
            const pinching = getDistance(h[4], h[8]) < PINCH_THRESHOLD;

            // Draw cursor & pinch feedback for this hand
            ctx.save();
            const pulse = pinching ? Math.abs(Math.sin(Date.now() / 120)) * 6 : 0;
            const radius = pinching ? 12 + pulse : 8;

            ctx.fillStyle = pinching ? this.color : "rgba(255, 255, 255, 0.8)";
            ctx.shadowColor = pinching ? this.color : "white";
            ctx.shadowBlur = pinching ? 20 + pulse * 2 : 10;

            if (pinching) {
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 4 + pulse / 2;
                ctx.beginPath();
                ctx.moveTo(h[4].x, h[4].y);
                ctx.lineTo(h[8].x, h[8].y);
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(cursor.x, cursor.y, radius + 10, 0, Math.PI * 2);
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            ctx.beginPath();
            ctx.arc(cursor.x, cursor.y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            const elemUnderCursor = document.elementFromPoint(cursor.x, cursor.y);
            const isOverInteractive = elemUnderCursor && elemUnderCursor.closest('button, .mode-card, a');

            let hState = this.handStates[hIdx];
            if (!hState) {
                hState = this.handStates[hIdx] = { isPinching: false, heldPieceIndex: -1 };
            }

            // Pinch started: grab a piece if available
            if (pinching && !hState.isPinching) {
                hState.isPinching = true;
                if (hState.heldPieceIndex === -1 && !isOverInteractive) {
                    for (let i = 0; i < this.pieces.length; i++) {
                        const p = this.pieces[i];
                        const slot = this.slots[p.currentSlot];
                        const alreadyHeld = this.handStates.some((hs, otherIdx) => otherIdx !== hIdx && hs.heldPieceIndex === i);
                        if (!alreadyHeld && slot &&
                            cursor.x >= slot.x && cursor.x <= slot.x + slot.w &&
                            cursor.y >= slot.y && cursor.y <= slot.y + slot.h) {
                            hState.heldPieceIndex = i;
                            break;
                        }
                    }
                }
            } else if (pinching && hState.isPinching) {
                // Dragging held piece
                if (hState.heldPieceIndex !== -1) {
                    const p = this.pieces[hState.heldPieceIndex];
                    if (p && this.slots[0]) {
                        p.drawX = cursor.x - this.slots[0].w / 2;
                        p.drawY = cursor.y - this.slots[0].h / 2;
                    }
                }
            } else if (!pinching && hState.isPinching) {
                // Pinch released: snap piece to nearest slot
                hState.isPinching = false;
                if (hState.heldPieceIndex !== -1) {
                    const heldPiece = this.pieces[hState.heldPieceIndex];
                    let targetSlotIndex = -1;
                    let minDist = Infinity;

                    for (let i = 0; i < this.slots.length; i++) {
                        const slot = this.slots[i];
                        const cx = slot.x + slot.w / 2;
                        const cy = slot.y + slot.h / 2;
                        const dist = getDistance(cursor, { x: cx, y: cy });
                        if (dist < minDist) {
                            minDist = dist;
                            targetSlotIndex = i;
                        }
                    }

                    if (targetSlotIndex !== -1 && heldPiece && targetSlotIndex !== heldPiece.currentSlot) {
                        const pieceInTarget = this.pieces.find(p => p.currentSlot === targetSlotIndex);
                        if (pieceInTarget) {
                            pieceInTarget.currentSlot = heldPiece.currentSlot;
                            const isTargetHeldByOther = this.handStates.some((hs, otherIdx) => otherIdx !== hIdx && hs.heldPieceIndex === pieceInTarget.id);
                            if (!isTargetHeldByOther) {
                                this.snapToSlot(pieceInTarget);
                            }
                        }
                        heldPiece.currentSlot = targetSlotIndex;
                    }

                    if (heldPiece) {
                        this.snapToSlot(heldPiece);
                    }
                    hState.heldPieceIndex = -1;
                    this.checkWin();
                }
            }
        });

        // Collect all currently held piece indices
        const heldIndices = this.handStates
            .map(hs => hs.heldPieceIndex)
            .filter(idx => idx !== -1);

        // Render non-held pieces first
        this.pieces.forEach((p, idx) => {
            if (!heldIndices.includes(idx)) {
                ctx.drawImage(p.image, p.drawX, p.drawY);
                ctx.strokeStyle = "#222";
                ctx.strokeRect(p.drawX, p.drawY, p.image.width, p.image.height);
            }
        });

        // Render all held pieces on top with glow effect
        heldIndices.forEach(pieceIdx => {
            const p = this.pieces[pieceIdx];
            if (!p) return;

            ctx.globalAlpha = 0.85;
            ctx.drawImage(p.image, p.drawX, p.drawY);
            ctx.globalAlpha = 1.0;

            ctx.save();
            const pulseGlow = Math.abs(Math.sin(Date.now() / 150)) * 15;
            ctx.strokeStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 15 + pulseGlow;
            ctx.lineWidth = 4 + pulseGlow / 4;
            ctx.strokeRect(p.drawX, p.drawY, p.image.width, p.image.height);
            ctx.restore();
        });

        // Timer Display
        const lang = this.gameContext.getLanguage ? this.gameContext.getLanguage() : 'en';
        const t = translations[lang] || translations.en;

        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20;
        ctx.font = "900 52px 'Sora', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`${t.timeLabel}: ${this.formatTime(this.elapsedTime)}`, this.bounds.x + this.bounds.w / 2, 75);
        ctx.restore();
    }

    checkWin(): void {
        const isWin = this.pieces.length === 9 && this.pieces.every(p => p.id === p.currentSlot);
        if (isWin && this.state !== 'SOLVED') {
            this.state = 'SOLVED';
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }

            if (this.gameContext.getSelectedMode() === 'multi') {
                const players = this.gameContext.getPlayers();
                const loser = players.find(x => x.id !== this.id);
                if (loser) {
                    loser.state = 'LOSE';
                    if (loser.intervalId) {
                        clearInterval(loser.intervalId);
                        loser.intervalId = null;
                    }
                }
            }

            this.gameContext.triggerWinScreen(this);
        }
    }

    formatTime(seconds: number): string {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }
}
