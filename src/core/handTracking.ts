import { HAND_CONNECTIONS, PINCH_THRESHOLD, getDistance, COLOR_P1, COLOR_P2 } from '../constants';
import { ClickRipple, HandUiState, Landmarks, Point } from '../types/game';
import { Camera, Hands, MediaPipeResults } from '../types/mediapipe';

export function drawSkeleton(landmarks: Landmarks, color: string, targetCtx: CanvasRenderingContext2D): void {
    if (!landmarks || landmarks.length === 0) return;
    targetCtx.save();
    targetCtx.strokeStyle = color;
    targetCtx.fillStyle = color;
    targetCtx.shadowColor = color;
    targetCtx.shadowBlur = 12;
    targetCtx.lineWidth = 3;

    HAND_CONNECTIONS.forEach(conn => {
        const p1 = landmarks[conn[0]];
        const p2 = landmarks[conn[1]];
        if (p1 && p2) {
            targetCtx.beginPath();
            targetCtx.moveTo(p1.x, p1.y);
            targetCtx.lineTo(p2.x, p2.y);
            targetCtx.stroke();
        }
    });

    landmarks.forEach(p => {
        targetCtx.beginPath();
        targetCtx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
        targetCtx.fill();
    });
    targetCtx.restore();
}

export function createHandUiController() {
    const handUiStates: HandUiState[] = [
        { isPinching: false, hoverElem: null, hoverStartTime: 0, lastClickTime: 0 },
        { isPinching: false, hoverElem: null, hoverStartTime: 0, lastClickTime: 0 },
        { isPinching: false, hoverElem: null, hoverStartTime: 0, lastClickTime: 0 },
        { isPinching: false, hoverElem: null, hoverStartTime: 0, lastClickTime: 0 }
    ];
    const clickRipples: ClickRipple[] = [];

    function triggerHandClick(elem: HTMLElement | null, x: number, y: number, color?: string): void {
        if (!elem) return;
        elem.click();
        clickRipples.push({
            x,
            y,
            radius: 10,
            maxRadius: 70,
            alpha: 1.0,
            color: color || '#00f0ff'
        });
    }

    function processHandInteractions(
        mappedHands: Landmarks[],
        isMenuOrWinOpen: boolean,
        uiCursorCtx: CanvasRenderingContext2D
    ): void {
        const now = Date.now();

        mappedHands.forEach((hand, idx) => {
            const handColor = idx === 0 ? COLOR_P1 : (idx === 1 ? COLOR_P2 : '#00f0ff');

            // If in menu/win overlay, draw glowing skeleton on top cursor canvas
            if (isMenuOrWinOpen) {
                drawSkeleton(hand, handColor, uiCursorCtx);
            }

            const cursor: Point = { x: (hand[4].x + hand[8].x) / 2, y: (hand[4].y + hand[8].y) / 2 };
            const pinchDist = getDistance(hand[4], hand[8]);
            const isPinching = pinchDist < PINCH_THRESHOLD;

            const elem = document.elementFromPoint(cursor.x, cursor.y);
            const clickable = elem ? (elem.closest('button:not(:disabled), .mode-card, a') as HTMLElement | null) : null;

            let state = handUiStates[idx];
            if (!state) {
                state = handUiStates[idx] = { isPinching: false, hoverElem: null, hoverStartTime: 0, lastClickTime: 0 };
            }

            let dwellProgress = 0;
            if (clickable) {
                if (state.hoverElem === clickable) {
                    const elapsed = now - state.hoverStartTime;
                    dwellProgress = Math.min(elapsed / 1000, 1);
                    if (dwellProgress >= 1 && (now - state.lastClickTime > 1000)) {
                        triggerHandClick(clickable, cursor.x, cursor.y, handColor);
                        state.lastClickTime = now;
                        state.hoverStartTime = now;
                    }
                } else {
                    state.hoverElem = clickable;
                    state.hoverStartTime = now;
                }

                // Instant pinch-to-click
                if (isPinching && !state.isPinching && (now - state.lastClickTime > 400)) {
                    triggerHandClick(clickable, cursor.x, cursor.y, handColor);
                    state.lastClickTime = now;
                    state.hoverStartTime = now + 1200; // prevent immediate dwell trigger right after pinch
                }
            } else {
                state.hoverElem = null;
                state.hoverStartTime = 0;
            }

            state.isPinching = isPinching;

            // Render UI Laser / Neon Cursor on top canvas when in menu or hovering an interactive button
            if (isMenuOrWinOpen || clickable) {
                uiCursorCtx.save();

                // Lightning line connecting thumb and index (in menu)
                if (isMenuOrWinOpen) {
                    uiCursorCtx.strokeStyle = isPinching ? "#FFFFFF" : handColor;
                    uiCursorCtx.shadowColor = handColor;
                    uiCursorCtx.shadowBlur = isPinching ? 25 : 12;
                    uiCursorCtx.lineWidth = isPinching ? 5 : 2.5;
                    uiCursorCtx.beginPath();
                    uiCursorCtx.moveTo(hand[4].x, hand[4].y);
                    uiCursorCtx.lineTo(hand[8].x, hand[8].y);
                    uiCursorCtx.stroke();
                }

                // Cursor core & pulsing ring
                const pulse = isPinching ? Math.abs(Math.sin(now / 100)) * 8 : (clickable ? Math.abs(Math.sin(now / 150)) * 4 : 0);
                const baseRadius = clickable ? 14 : 9;
                const radius = baseRadius + pulse;

                uiCursorCtx.fillStyle = isPinching ? "#FFFFFF" : handColor;
                uiCursorCtx.shadowColor = handColor;
                uiCursorCtx.shadowBlur = isPinching ? 25 : 15;
                uiCursorCtx.beginPath();
                uiCursorCtx.arc(cursor.x, cursor.y, radius, 0, Math.PI * 2);
                uiCursorCtx.fill();

                // Target ring when hovering clickable
                if (clickable) {
                    uiCursorCtx.strokeStyle = isPinching ? "#FFFFFF" : handColor;
                    uiCursorCtx.lineWidth = isPinching ? 3 : 2;
                    uiCursorCtx.beginPath();
                    uiCursorCtx.arc(cursor.x, cursor.y, radius + 8, 0, Math.PI * 2);
                    uiCursorCtx.stroke();

                    // Dwell Progress Arc
                    if (dwellProgress > 0 && dwellProgress < 1) {
                        uiCursorCtx.strokeStyle = "#FFFFFF";
                        uiCursorCtx.shadowColor = "#FFFFFF";
                        uiCursorCtx.shadowBlur = 10;
                        uiCursorCtx.lineWidth = 4;
                        uiCursorCtx.beginPath();
                        uiCursorCtx.arc(cursor.x, cursor.y, radius + 12, -Math.PI / 2, -Math.PI / 2 + dwellProgress * Math.PI * 2);
                        uiCursorCtx.stroke();
                    }
                }

                uiCursorCtx.restore();
            }
        });

        // Animate & draw click ripples
        if (clickRipples.length > 0) {
            uiCursorCtx.save();
            for (let r = clickRipples.length - 1; r >= 0; r--) {
                const rip = clickRipples[r];
                rip.radius += 4;
                rip.alpha -= 0.05;
                if (rip.alpha <= 0 || rip.radius >= rip.maxRadius) {
                    clickRipples.splice(r, 1);
                    continue;
                }
                uiCursorCtx.strokeStyle = rip.color;
                uiCursorCtx.shadowColor = rip.color;
                uiCursorCtx.shadowBlur = 20;
                uiCursorCtx.lineWidth = 4;
                uiCursorCtx.globalAlpha = Math.max(0, rip.alpha);
                uiCursorCtx.beginPath();
                uiCursorCtx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
                uiCursorCtx.stroke();
            }
            uiCursorCtx.restore();
        }
    }

    return {
        processHandInteractions,
        triggerHandClick
    };
}

export function initMediaPipe({
    videoElement,
    onResultsCallback
}: {
    videoElement: HTMLVideoElement;
    onResultsCallback: (results: MediaPipeResults) => void;
}): { hands: Hands | null; camera: Camera | null } {
    if (typeof window === 'undefined' || !window.Hands || !window.Camera) {
        console.warn('MediaPipe Hands or Camera is not yet loaded on window.');
        return { hands: null, camera: null };
    }

    const hands = new window.Hands({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
        maxNumHands: 4,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7
    });

    hands.onResults(onResultsCallback);

    const camera = new window.Camera(videoElement, {
        onFrame: async () => {
            await hands.send({ image: videoElement });
        },
        width: 1280,
        height: 720
    });

    return { hands, camera };
}
