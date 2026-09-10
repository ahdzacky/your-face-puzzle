/**
 * Utility functions for screen orientation, fullscreen management, and mobile detection.
 */

interface LockableOrientation {
    lock?: (orientation: string) => Promise<void>;
    unlock?: () => void;
}

interface ExtendedDocument extends Document {
    webkitFullscreenElement?: Element | null;
    mozFullScreenElement?: Element | null;
    msFullscreenElement?: Element | null;
    webkitExitFullscreen?: () => Promise<void>;
    mozCancelFullScreen?: () => Promise<void>;
    msExitFullscreen?: () => Promise<void>;
}

interface ExtendedHTMLElement extends HTMLElement {
    webkitRequestFullscreen?: () => Promise<void>;
    mozRequestFullScreen?: () => Promise<void>;
    msRequestFullscreen?: () => Promise<void>;
}

const getOrientation = (): LockableOrientation | null => {
    if (typeof screen === 'undefined') return null;
    const extScreen = screen as unknown as {
        orientation?: LockableOrientation;
        mozOrientation?: LockableOrientation;
        msOrientation?: LockableOrientation;
    };
    return extScreen.orientation || extScreen.mozOrientation || extScreen.msOrientation || null;
};

export const isMobileDevice = (): boolean => {
    if (typeof window === 'undefined') return false;
    return (
        /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (Boolean(navigator.maxTouchPoints && navigator.maxTouchPoints > 0) && window.innerWidth <= 1024)
    );
};

export const isAppFullscreen = (): boolean => {
    if (typeof document === 'undefined') return false;
    const doc = document as ExtendedDocument;
    return Boolean(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
    );
};

export const requestAppFullscreen = async (element?: HTMLElement): Promise<boolean> => {
    if (typeof document === 'undefined') return false;
    const el = (element || document.documentElement) as ExtendedHTMLElement;

    try {
        if (el.requestFullscreen) {
            await el.requestFullscreen();
            return true;
        } else if (el.webkitRequestFullscreen) {
            await el.webkitRequestFullscreen();
            return true;
        } else if (el.mozRequestFullScreen) {
            await el.mozRequestFullScreen();
            return true;
        } else if (el.msRequestFullscreen) {
            await el.msRequestFullscreen();
            return true;
        }
    } catch (err) {
        console.warn('Fullscreen request rejected:', err);
    }
    return false;
};

export const exitAppFullscreen = async (): Promise<boolean> => {
    if (typeof document === 'undefined') return false;
    const doc = document as ExtendedDocument;

    try {
        if (isAppFullscreen()) {
            if (doc.exitFullscreen) {
                await doc.exitFullscreen();
                return true;
            } else if (doc.webkitExitFullscreen) {
                await doc.webkitExitFullscreen();
                return true;
            } else if (doc.mozCancelFullScreen) {
                await doc.mozCancelFullScreen();
                return true;
            } else if (doc.msExitFullscreen) {
                await doc.msExitFullscreen();
                return true;
            }
        }
    } catch (err) {
        console.warn('Exit fullscreen rejected:', err);
    }
    return false;
};

export const lockOrientationLandscape = async (): Promise<boolean> => {
    try {
        const orientation = getOrientation();
        if (orientation && typeof orientation.lock === 'function') {
            await orientation.lock('landscape');
            return true;
        }
    } catch (err) {
        console.warn('Orientation lock rejected or unsupported:', err);
    }
    return false;
};

export const unlockOrientation = (): void => {
    try {
        const orientation = getOrientation();
        if (orientation && typeof orientation.unlock === 'function') {
            orientation.unlock();
        }
    } catch (err) {
        console.warn('Orientation unlock rejected or unsupported:', err);
    }
};
