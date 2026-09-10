import React, { useState, useRef, useEffect } from 'react';
import { CameraDevice, CameraPermissionState } from '../types/game';
import { Language, translations } from '../i18n/translations';

interface CameraSelectorProps {
    language: Language;
    devices: CameraDevice[];
    selectedDeviceId: string | null;
    onSelectDevice: (deviceId: string) => void;
    isCameraOn: boolean;
    cameraPermission?: CameraPermissionState;
    onActivateCamera?: () => void;
    compact?: boolean;
}

export const CameraSelector: React.FC<CameraSelectorProps> = ({
    language,
    devices,
    selectedDeviceId,
    onSelectDevice,
    isCameraOn,
    cameraPermission = 'unknown',
    onActivateCamera,
    compact = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const t = translations[language];

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const selectedDevice = devices.find((d) => d.deviceId === selectedDeviceId);
    const displayLabel = selectedDevice
        ? selectedDevice.label
        : devices.length > 0
            ? devices[0].label
            : t.defaultCamera;

    const handleSelect = (deviceId: string) => {
        onSelectDevice(deviceId);
        setIsOpen(false);
    };

    return (
        <div ref={dropdownRef} className="relative w-full max-w-xs sm:max-w-sm select-none z-20">
            {/* Main Toggle Button */}
            <button
                id="btn-camera-selector-toggle"
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-12 px-4 sm:px-6 rounded-full border-2 transition-all duration-300 cursor-pointer backdrop-blur-md shadow-md flex items-center justify-between gap-2.5 ${compact
                        ? 'h-8 px-3 text-xs bg-[#090f1d]/80 border-cyan-500/40 text-cyan-300 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                        : 'bg-[#090e1a]/60 border-gray-600/80 hover:border-cyan-400 text-gray-200 hover:text-white hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] font-bold text-xs sm:text-sm md:text-base tracking-wider'
                    }`}
                title={t.cameraSelect}
            >
                <div className="flex items-center gap-2.5 truncate">
                    {/* Camera SVG Icon */}
                    <svg
                        className="shrink-0 text-[#00f0ff] drop-shadow-[0_0_8px_rgba(0,240,255,0.8)] w-4 h-4 sm:w-5 sm:h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                    >
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                    </svg>

                    {/* Device Name */}
                    <span className="truncate text-left">
                        {displayLabel}
                    </span>
                </div>

                {/* Chevron Arrow */}
                <svg
                    className={`shrink-0 transition-transform duration-300 text-cyan-400 w-3.5 h-3.5 sm:w-4 sm:h-4 ${isOpen ? 'rotate-180' : ''
                        }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    id="camera-selector-dropdown"
                    className="absolute left-0 right-0 mt-2 rounded-2xl bg-[#080d1a]/95 border border-cyan-500/50 backdrop-blur-xl shadow-[0_0_30px_rgba(0,240,255,0.35)] p-2 z-[80] overflow-hidden animate-fadeIn"
                >
                    {/* Header Label */}
                    <div className="px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-cyan-400 border-b border-cyan-500/20 mb-1 flex items-center justify-between">
                        <span>{t.cameraSelect}</span>
                        <span className="text-[10px] text-gray-400 font-normal">
                            {devices.length} {devices.length === 1 ? 'device' : 'devices'}
                        </span>
                    </div>

                    {/* Device List */}
                    <div className="max-h-56 overflow-y-auto flex flex-col gap-1 py-1">
                        {devices.length === 0 ? (
                            <div className="px-3 py-3 text-xs text-gray-400 text-center">
                                {cameraPermission === 'denied' ? (
                                    <div className="flex flex-col items-center gap-1.5 text-red-300">
                                        <p className="font-bold text-red-400">{t.cameraPermissionDenied}</p>
                                        <p className="text-[10px] text-gray-300 leading-normal">{t.cameraPermissionGuide}</p>
                                        {onActivateCamera && (
                                            <button
                                                id="btn-dropdown-retry-cam"
                                                type="button"
                                                onClick={() => {
                                                    onActivateCamera();
                                                    setIsOpen(false);
                                                }}
                                                className="mt-1 px-3 py-1 bg-red-500/20 border border-red-400 text-red-300 rounded-full text-xs font-bold hover:bg-red-500/30 transition-all cursor-pointer"
                                            >
                                                {t.retry}
                                            </button>
                                        )}
                                    </div>
                                ) : !isCameraOn ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <p>{t.cameraPermissionHint}</p>
                                        {onActivateCamera && (
                                            <button
                                                id="btn-dropdown-activate-cam"
                                                type="button"
                                                onClick={() => {
                                                    onActivateCamera();
                                                    setIsOpen(false);
                                                }}
                                                className="px-3 py-1 bg-cyan-500/20 border border-cyan-400 text-cyan-300 rounded-full text-xs font-bold hover:bg-cyan-500/30 transition-all cursor-pointer"
                                            >
                                                {t.activateCamera}
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <p>{t.noCameraFound}</p>
                                )}
                            </div>
                        ) : (
                            devices.map((device, idx) => {
                                const isSelected =
                                    device.deviceId === selectedDeviceId ||
                                    (!selectedDeviceId && idx === 0);

                                return (
                                    <button
                                        key={device.deviceId || `cam-${idx}`}
                                        id={`btn-select-cam-${idx}`}
                                        type="button"
                                        onClick={() => handleSelect(device.deviceId)}
                                        className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center justify-between gap-2 cursor-pointer ${isSelected
                                                ? 'bg-cyan-500/20 border border-cyan-400/80 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.3)] font-bold'
                                                : 'text-gray-300 hover:bg-white/10 hover:text-white border border-transparent'
                                            }`}
                                    >
                                        <span className="truncate pr-2">{device.label}</span>
                                        {isSelected && (
                                            <span className="shrink-0 w-2 h-2 rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]" />
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
