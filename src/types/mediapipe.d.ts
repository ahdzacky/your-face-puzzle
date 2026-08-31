export interface MediaPipeResults {
    image: HTMLVideoElement | HTMLCanvasElement | ImageBitmap;
    multiHandLandmarks?: Array<Array<{ x: number; y: number; z: number }>>;
    multiHandedness?: Array<{ index: number; label: string; score: number }>;
}

export interface HandsConfig {
    locateFile?: (file: string) => string;
}

export interface HandsOptions {
    maxNumHands?: number;
    modelComplexity?: number;
    minDetectionConfidence?: number;
    minTrackingConfidence?: number;
}

export declare class Hands {
    constructor(config?: HandsConfig);
    setOptions(options: HandsOptions): void;
    onResults(callback: (results: MediaPipeResults) => void): void;
    send(input: { image: HTMLVideoElement | HTMLCanvasElement }): Promise<void>;
    close(): Promise<void>;
}

export interface CameraOptions {
    onFrame: () => Promise<void>;
    width?: number;
    height?: number;
}

export declare class Camera {
    constructor(videoElement: HTMLVideoElement, options: CameraOptions);
    start(): Promise<void>;
    stop(): Promise<void>;
}

declare global {
    interface Window {
        Hands: typeof Hands;
        Camera: typeof Camera;
    }
}
