export type GameMode = 'single' | 'multi';

export type PlayerState = 'CALIBRATING' | 'WAITING' | 'PLAYING' | 'SOLVED' | 'LOSE';

export interface Point {
    x: number;
    y: number;
    z?: number;
}

export type Landmarks = Point[];

export interface Box {
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface Slot {
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface PuzzlePiece {
    id: number;
    currentSlot: number;
    image: HTMLCanvasElement;
    drawX: number;
    drawY: number;
}

export interface HandState {
    isPinching: boolean;
    heldPieceIndex: number;
}

export interface HandUiState {
    isPinching: boolean;
    hoverElem: HTMLElement | null;
    hoverStartTime: number;
    lastClickTime: number;
}

export interface ClickRipple {
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    alpha: number;
    color: string;
}

export interface WinnerInfo {
    id: number;
    color: string;
    elapsedTime: number;
    formattedTime: string;
    imageSrc: string;
}

export interface GameEngineContext {
    ctx: CanvasRenderingContext2D;
    canvasElement: HTMLCanvasElement;
    getSelectedMode: () => GameMode | null;
    getPlayers: () => import('../core/Player').Player[];
    triggerWinScreen: (winnerPlayer: import('../core/Player').Player) => void;
}
