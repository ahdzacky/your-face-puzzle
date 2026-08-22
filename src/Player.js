import { PINCH_THRESHOLD, getDistance, COLOR_P1 } from './constants.js';

export class Player {
    constructor(id, bounds, color, gameContext) {
        this.id = id;
        this.bounds = bounds;
        this.color = color;
        this.gameContext = gameContext; // { ctx, canvasElement, getSelectedMode, getPlayers, triggerWinScreen }
        this.state = 'CALIBRATING'; // CALIBRATING, WAITING, PLAYING, SOLVED, LOSE
        this.box = null;
        this.pieces = [];
        this.slots = [];
        this.handStates = []; // Array of { isPinching: false, heldPieceIndex: -1 } for each active hand
        this.startTime = null;
        this.elapsedTime = 0;
        this.intervalId = null;
    }

    get ctx() {
        return this.gameContext.ctx;
    }

    update(handsData) {
        if (this.state === 'CALIBRATING') {
            this.handleCalibration(handsData);
        } else if (this.state === 'WAITING') {
            this.drawWaiting();
        } else if (this.state === 'PLAYING') {
            this.handleGameplay(handsData);
        } else if (this.state === 'LOSE') {
            this.drawWaiting(true); // Draw frozen
        }
    }

    handleCalibration(handsData) {
        const ctx = this.ctx;
        // Neon instruction text - enlarged for distance viewing
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 18;
        ctx.font = "900 42px 'Orbitron', 'Sora', sans-serif";
        ctx.textAlign = "center";
        let msgX = this.bounds.x + this.bounds.w / 2;
        ctx.fillText(`PLAYER ${this.id}: Angkat 2 Tangan`, msgX, 70);

        ctx.font = "bold 28px 'Segoe UI', 'Sora', sans-serif";
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowColor = "#000000";
        ctx.shadowBlur = 12;
        ctx.fillText(`Bentangkan telunjuk & jempol untuk membuat kotak.`, msgX, 115);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        ctx.fillText(`Jentikkan keduanya untuk memotret!`, msgX, 155);
        ctx.restore();

        if (handsData.length >= 2) {
            let hA = handsData[0];
            let hB = handsData[1];

            let leftHand = hA[0].x < hB[0].x ? hA : hB;
            let rightHand = hA[0].x < hB[0].x ? hB : hA;

            let pLeftThumb = leftHand[4];
            let pRightIndex = rightHand[8];

            let left = Math.min(pLeftThumb.x, pRightIndex.x);
            let right = Math.max(pLeftThumb.x, pRightIndex.x);
            let top = Math.min(pLeftThumb.y, pRightIndex.y);
            let bottom = Math.max(pLeftThumb.y, pRightIndex.y);

            let w = right - left;
            let h = bottom - top;

            if (w > 50 && h > 50) {
                this.box = { x: left, y: top, w: w, h: h };

                ctx.save();
                ctx.strokeStyle = "white";
                ctx.shadowColor = "white";
                ctx.shadowBlur = 15;
                ctx.lineWidth = 4;
                ctx.strokeRect(this.box.x, this.box.y, this.box.w, this.box.h);
                ctx.restore();

                let pinchLeft = getDistance(leftHand[4], leftHand[8]) < PINCH_THRESHOLD;
                let pinchRight = getDistance(rightHand[4], rightHand[8]) < PINCH_THRESHOLD;

                // Glowing line effect when about to capture in calibration
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

    capturePuzzle() {
        const ctx = this.ctx;
        let imageData = ctx.getImageData(this.box.x, this.box.y, this.box.w, this.box.h);
        let tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.box.w;
        tempCanvas.height = this.box.h;
        tempCanvas.getContext('2d').putImageData(imageData, 0, 0);

        let pieceW = this.box.w / 3;
        let pieceH = this.box.h / 3;

        this.pieces = [];
        this.slots = [];

        for (let i = 0; i < 9; i++) {
            let row = Math.floor(i / 3);
            let col = i % 3;

            let pX = this.box.x + col * pieceW;
            let pY = this.box.y + row * pieceH;

            this.slots.push({ x: pX, y: pY, w: pieceW, h: pieceH });

            let pieceCanvas = document.createElement('canvas');
            pieceCanvas.width = pieceW;
            pieceCanvas.height = pieceH;
            pieceCanvas.getContext('2d').drawImage(tempCanvas, col * pieceW, row * pieceH, pieceW, pieceH, 0, 0, pieceW, pieceH);

            this.pieces.push({ id: i, currentSlot: i, image: pieceCanvas, drawX: pX, drawY: pY });
        }

        this.shufflePuzzle();

        if (this.gameContext.getSelectedMode() === 'multi') {
            this.state = 'WAITING';
        } else {
            this.startPlaying();
        }
    }

    shufflePuzzle() {
        if (this.pieces.length === 0) return;
        let slotIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8];
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

    recalibrate() {
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

    startPlaying() {
        this.state = 'PLAYING';
        this.startTime = Date.now();
        if (this.intervalId) clearInterval(this.intervalId);
        this.intervalId = setInterval(() => {
            this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
        }, 1000);
    }

    snapToSlot(piece) {
        let slot = this.slots[piece.currentSlot];
        if (slot) {
            piece.drawX = slot.x;
            piece.drawY = slot.y;
        }
    }

    drawWaiting(isLose = false) {
        const ctx = this.ctx;
        this.pieces.forEach((p) => {
            ctx.drawImage(p.image, p.drawX, p.drawY);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
            ctx.lineWidth = 1;
            ctx.strokeRect(p.drawX, p.drawY, p.image.width, p.image.height);
        });

        if (!isLose) {
            ctx.save();
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 20;
            ctx.font = "900 42px 'Orbitron', 'Sora', sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("Menunggu lawan...", this.bounds.x + this.bounds.w / 2, 75);
            ctx.restore();
        }
    }

    handleGameplay(handsData) {
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
                let hs = this.handStates[i];
                if (hs && hs.heldPieceIndex !== -1) {
                    let piece = this.pieces[hs.heldPieceIndex];
                    if (piece) this.snapToSlot(piece);
                    hs.heldPieceIndex = -1;
                    hs.isPinching = false;
                }
            }
            this.handStates.length = handsData.length;
        }

        // Process each active hand independently
        handsData.forEach((h, hIdx) => {
            let cursor = { x: (h[4].x + h[8].x) / 2, y: (h[4].y + h[8].y) / 2 };
            let pinching = getDistance(h[4], h[8]) < PINCH_THRESHOLD;

            // Draw cursor & pinch feedback for this hand
            ctx.save();
            let pulse = pinching ? Math.abs(Math.sin(Date.now() / 120)) * 6 : 0;
            let radius = pinching ? 12 + pulse : 8;

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

            let elemUnderCursor = document.elementFromPoint(cursor.x, cursor.y);
            let isOverInteractive = elemUnderCursor && elemUnderCursor.closest('button, .mode-card, a');

            let hState = this.handStates[hIdx];
            if (!hState) {
                hState = this.handStates[hIdx] = { isPinching: false, heldPieceIndex: -1 };
            }

            // Pinch started: grab a piece if available
            if (pinching && !hState.isPinching) {
                hState.isPinching = true;
                if (hState.heldPieceIndex === -1 && !isOverInteractive) {
                    for (let i = 0; i < this.pieces.length; i++) {
                        let p = this.pieces[i];
                        let slot = this.slots[p.currentSlot];
                        let alreadyHeld = this.handStates.some((hs, otherIdx) => otherIdx !== hIdx && hs.heldPieceIndex === i);
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
                    let p = this.pieces[hState.heldPieceIndex];
                    if (p && this.slots[0]) {
                        p.drawX = cursor.x - this.slots[0].w / 2;
                        p.drawY = cursor.y - this.slots[0].h / 2;
                    }
                }
            } else if (!pinching && hState.isPinching) {
                // Pinch released: snap piece to nearest slot
                hState.isPinching = false;
                if (hState.heldPieceIndex !== -1) {
                    let heldPiece = this.pieces[hState.heldPieceIndex];
                    let targetSlotIndex = -1;
                    let minDist = Infinity;

                    for (let i = 0; i < this.slots.length; i++) {
                        let slot = this.slots[i];
                        let cx = slot.x + slot.w / 2;
                        let cy = slot.y + slot.h / 2;
                        let dist = getDistance(cursor, { x: cx, y: cy });
                        if (dist < minDist) {
                            minDist = dist;
                            targetSlotIndex = i;
                        }
                    }

                    if (targetSlotIndex !== -1 && heldPiece && targetSlotIndex !== heldPiece.currentSlot) {
                        let pieceInTarget = this.pieces.find(p => p.currentSlot === targetSlotIndex);
                        if (pieceInTarget) {
                            pieceInTarget.currentSlot = heldPiece.currentSlot;
                            let isTargetHeldByOther = this.handStates.some((hs, otherIdx) => otherIdx !== hIdx && hs.heldPieceIndex === pieceInTarget.id);
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
            let p = this.pieces[pieceIdx];
            if (!p) return;

            ctx.globalAlpha = 0.85;
            ctx.drawImage(p.image, p.drawX, p.drawY);
            ctx.globalAlpha = 1.0;

            ctx.save();
            let pulseGlow = Math.abs(Math.sin(Date.now() / 150)) * 15;
            ctx.strokeStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 15 + pulseGlow;
            ctx.lineWidth = 4 + pulseGlow / 4;
            ctx.strokeRect(p.drawX, p.drawY, p.image.width, p.image.height);
            ctx.restore();
        });

        // Timer Display - Enlarged for distance readability
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20;
        ctx.font = "900 52px 'Orbitron', 'Sora', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`WAKTU: ${this.formatTime(this.elapsedTime)}`, this.bounds.x + this.bounds.w / 2, 75);
        ctx.restore();
    }

    checkWin() {
        let isWin = this.pieces.length === 9 && this.pieces.every(p => p.id === p.currentSlot);
        if (isWin && this.state !== 'SOLVED') {
            this.state = 'SOLVED';
            clearInterval(this.intervalId);

            if (this.gameContext.getSelectedMode() === 'multi') {
                let players = this.gameContext.getPlayers();
                let loser = players.find(x => x.id !== this.id);
                if (loser) {
                    loser.state = 'LOSE';
                    clearInterval(loser.intervalId);
                }
            }

            // Call win screen
            this.gameContext.triggerWinScreen(this);
        }
    }

    formatTime(seconds) {
        let m = Math.floor(seconds / 60).toString().padStart(2, '0');
        let s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }
}
