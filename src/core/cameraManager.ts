import { CameraDevice } from '../types/game';

export interface CameraControllerOptions {
    videoElement: HTMLVideoElement;
    onFrame: () => Promise<void>;
    width?: number;
    height?: number;
    onTrackEnded?: () => void;
}

export class CameraController {
    private videoElement: HTMLVideoElement;
    private onFrame: () => Promise<void>;
    private width: number;
    private height: number;
    private onTrackEnded?: () => void;
    private stream: MediaStream | null = null;
    private isRunning = false;
    private animFrameId: number | null = null;
    private lastVideoTime = -1;
    private activeDeviceId: string | null = null;
    private isProcessingFrame = false;

    constructor(options: CameraControllerOptions) {
        this.videoElement = options.videoElement;
        this.onFrame = options.onFrame;
        this.width = options.width || 1280;
        this.height = options.height || 720;
        this.onTrackEnded = options.onTrackEnded;
    }

    public getActiveDeviceId(): string | null {
        return this.activeDeviceId;
    }

    public async start(deviceId?: string): Promise<MediaStream> {
        this.stopStream();

        const videoConstraints: MediaTrackConstraints = {
            width: { ideal: this.width },
            height: { ideal: this.height }
        };

        if (deviceId) {
            videoConstraints.deviceId = { exact: deviceId };
        } else {
            videoConstraints.facingMode = 'user';
        }

        let mediaStream: MediaStream;
        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({
                video: videoConstraints,
                audio: false
            });
        } catch (err) {
            // Fallback without exact deviceId constraint if specific device request failed
            if (deviceId) {
                console.warn('Failed to open requested deviceId, falling back to default:', err);
                mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: this.width },
                        height: { ideal: this.height },
                        facingMode: 'user'
                    },
                    audio: false
                });
            } else {
                throw err;
            }
        }

        this.stream = mediaStream;
        const videoTrack = mediaStream.getVideoTracks()[0];
        if (videoTrack) {
            const settings = videoTrack.getSettings();
            this.activeDeviceId = settings.deviceId || deviceId || null;

            videoTrack.onended = () => {
                console.warn('Video track ended or revoked by browser.');
                this.stop();
                if (this.onTrackEnded) {
                    this.onTrackEnded();
                }
            };
        }

        this.videoElement.srcObject = mediaStream;

        await new Promise<void>((resolve) => {
            if (this.videoElement.readyState >= 2) {
                resolve();
            } else {
                this.videoElement.onloadeddata = () => resolve();
            }
        });

        try {
            await this.videoElement.play();
        } catch (playErr) {
            console.warn('Video play interrupted or aborted:', playErr);
        }

        this.isRunning = true;
        this.scheduleFrame();

        return mediaStream;
    }

    public async switchDevice(deviceId: string): Promise<void> {
        if (this.activeDeviceId === deviceId && this.isRunning) {
            return;
        }
        await this.start(deviceId);
    }

    private scheduleFrame(): void {
        if (!this.isRunning) return;

        this.animFrameId = requestAnimationFrame(async () => {
            if (!this.isRunning) return;

            if (
                !this.videoElement.paused &&
                !this.videoElement.ended &&
                this.videoElement.currentTime !== this.lastVideoTime
            ) {
                this.lastVideoTime = this.videoElement.currentTime;
                if (!this.isProcessingFrame) {
                    this.isProcessingFrame = true;
                    try {
                        await this.onFrame();
                    } catch (err) {
                        console.warn('Frame processing error:', err);
                    } finally {
                        this.isProcessingFrame = false;
                    }
                }
            }

            this.scheduleFrame();
        });
    }

    private stopStream(): void {
        if (this.animFrameId !== null) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
        }

        if (this.stream) {
            this.stream.getTracks().forEach((track) => track.stop());
            this.stream = null;
        }

        if (this.videoElement) {
            this.videoElement.srcObject = null;
        }

        this.lastVideoTime = -1;
    }

    public stop(): void {
        this.isRunning = false;
        this.stopStream();
    }

    public static async getAvailableDevices(): Promise<CameraDevice[]> {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            return [];
        }

        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter((d) => d.kind === 'videoinput');

            return videoDevices.map((device, index) => ({
                deviceId: device.deviceId,
                label: device.label || `Camera ${index + 1}`
            }));
        } catch (err) {
            console.warn('Failed to enumerate media devices:', err);
            return [];
        }
    }
}
