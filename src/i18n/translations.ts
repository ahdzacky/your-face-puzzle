export type Language = 'en' | 'id';

export interface TranslationSchema {
    // Main Menu
    titleFace: string;
    titlePuzzle: string;
    singlePlayerTitle: string;
    singlePlayerDesc: string;
    multiplayerTitle: string;
    multiplayerDesc: string;
    rulesTitle: string;
    rule1: string;
    rule2: string;
    start: string;
    game: string;
    activateCamera: string;
    loadingCamera: string;
    cameraActive: string;
    cameraSelect: string;
    defaultCamera: string;
    switchCamera: string;
    noCameraFound: string;
    cameraPermissionHint: string;
    cameraPermissionDenied: string;
    cameraPermissionNotGranted: string;
    cameraStatusDenied: string;
    cameraStatusPrompt: string;
    cameraStatusGranted: string;
    cameraPermissionGuide: string;
    retry: string;

    // In-game Controls
    shuffle: string;
    shuffleP1: string;
    shuffleP2: string;
    recalibrate: string;
    recalibrateP1: string;
    recalibrateP2: string;
    mainMenu: string;

    // Canvas Player Engine
    playerRaiseHands: (id: number) => string;
    spreadFingers: string;
    pinchToCapture: string;
    waitingOpponent: string;
    timeLabel: string;

    // Win Screen
    completed: string;
    playerWins: (id: number) => string;
    playAgain: string;

    // Footer
    createdBy: string;
}

export const translations: Record<Language, TranslationSchema> = {
    en: {
        titleFace: 'YOUR FACE',
        titlePuzzle: 'PUZZLE',
        singlePlayerTitle: 'SINGLE PLAYER',
        singlePlayerDesc: 'Play solo! Solve your face puzzle as fast as you can.',
        multiplayerTitle: 'MULTIPLAYER',
        multiplayerDesc: 'More fun together! The fastest to solve wins the game.',
        rulesTitle: 'RULES:',
        rule1: 'Use your hands to frame and capture your face. Then solve the puzzle using pinch gestures!',
        rule2: 'You can also click buttons with your hands. Pinch your fingers or hover over any button!',
        start: 'START',
        game: 'GAME',
        activateCamera: 'ACTIVATE CAMERA',
        loadingCamera: 'LOADING CAMERA...',
        cameraActive: 'CAMERA ACTIVE',
        cameraSelect: 'CAMERA',
        defaultCamera: 'DEFAULT CAMERA',
        switchCamera: 'CHANGE CAMERA',
        noCameraFound: 'NO CAMERA FOUND',
        cameraPermissionHint: 'ACTIVATE CAMERA TO LIST DEVICES',
        cameraPermissionDenied: 'Camera access blocked in browser settings',
        cameraPermissionNotGranted: 'Camera access has not been granted yet',
        cameraStatusDenied: 'CAMERA PERMISSION: DENIED',
        cameraStatusPrompt: 'CAMERA PERMISSION: NOT GRANTED',
        cameraStatusGranted: 'CAMERA PERMISSION: GRANTED',
        cameraPermissionGuide: 'Click the lock or site settings icon in the address bar to allow camera access, then retry.',
        retry: 'RETRY',

        shuffle: 'SHUFFLE',
        shuffleP1: 'P1: SHUFFLE',
        shuffleP2: 'P2: SHUFFLE',
        recalibrate: 'RETAKE PHOTO',
        recalibrateP1: 'P1: RETAKE',
        recalibrateP2: 'P2: RETAKE',
        mainMenu: 'MAIN MENU',

        playerRaiseHands: (id: number) => `PLAYER ${id}: Raise 2 Hands`,
        spreadFingers: 'Spread index & thumb to form a box.',
        pinchToCapture: 'Pinch both hands to snap photo!',
        waitingOpponent: 'Waiting for opponent...',
        timeLabel: 'TIME',

        completed: 'COMPLETED!',
        playerWins: (id: number) => `PLAYER ${id} WINS!`,
        playAgain: 'PLAY AGAIN',

        createdBy: 'Created by:'
    },
    id: {
        titleFace: 'YOUR FACE',
        titlePuzzle: 'PUZZLE',
        singlePlayerTitle: 'SINGLE PLAYER',
        singlePlayerDesc: 'Main sendiri! Selesaikan puzzle wajahmu secepat mungkin.',
        multiplayerTitle: 'MULTIPLAYER',
        multiplayerDesc: 'Berdua lebih seru! Siapa paling cepat, dia yang menang.',
        rulesTitle: 'ATURAN:',
        rule1: 'Gunakan tanganmu untuk screenshot wajahmu. Lalu susun puzzle dengan menjentikkan jari!',
        rule2: 'Tangan juga bisa untuk klik tombol. Jentikkan jari (pinch) atau tahan tangan di atas tombol!',
        start: 'START',
        game: 'GAME',
        activateCamera: 'AKTIFKAN KAMERA',
        loadingCamera: 'MEMUAT KAMERA...',
        cameraActive: 'KAMERA AKTIF',
        cameraSelect: 'KAMERA',
        defaultCamera: 'KAMERA UTAMA',
        switchCamera: 'GANTI KAMERA',
        noCameraFound: 'KAMERA TIDAK DITEMUKAN',
        cameraPermissionHint: 'AKTIFKAN KAMERA UNTUK MELIHAT PERANGKAT',
        cameraPermissionDenied: 'Akses kamera diblokir di pengaturan browser',
        cameraPermissionNotGranted: 'Akses kamera belum diizinkan',
        cameraStatusDenied: 'IZIN KAMERA: DITOLAK',
        cameraStatusPrompt: 'IZIN KAMERA: BELUM DIIZINKAN',
        cameraStatusGranted: 'IZIN KAMERA: SUDAH DIIZINKAN',
        cameraPermissionGuide: 'Klik ikon gembok atau pengaturan situs di address bar untuk mengizinkan kamera, lalu coba lagi.',
        retry: 'COBA LAGI',

        shuffle: 'ACAK ULANG',
        shuffleP1: 'P1: ACAK',
        shuffleP2: 'P2: ACAK',
        recalibrate: 'FOTO ULANG',
        recalibrateP1: 'P1: FOTO ULANG',
        recalibrateP2: 'P2: FOTO ULANG',
        mainMenu: 'MENU UTAMA',

        playerRaiseHands: (id: number) => `PLAYER ${id}: Angkat 2 Tangan`,
        spreadFingers: 'Bentangkan telunjuk & jempol untuk membuat kotak.',
        pinchToCapture: 'Jentikkan keduanya untuk memotret!',
        waitingOpponent: 'Menunggu lawan...',
        timeLabel: 'WAKTU',

        completed: 'SELESAI!',
        playerWins: (id: number) => `PLAYER ${id} MENANG!`,
        playAgain: 'MAIN LAGI',

        createdBy: 'Dibuat oleh:'
    }
};
