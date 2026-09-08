# Your Face Puzzle

An interactive web-based sliding face puzzle game powered by real-time computer vision and webcam hand tracking. Players capture their face using a framing gesture, which is automatically sliced into puzzle tiles, and then solve the puzzle using touchless pinch gestures without needing a mouse or touchscreen.

---

## Key Features

- **Real-Time Face Capture**: Capture the player's face directly from the webcam using a two-handed framing gesture to generate dynamic puzzle pieces.
- **Hand Tracking & Pinch Control**: Powered by MediaPipe Hands for real-time hand and finger landmark detection. Move, drag-and-drop puzzle tiles, and trigger buttons using intuitive pinch gestures.
- **Game Modes**:
  - **Single Player**: Play solo and race against the clock to solve your face puzzle.
  - **Multiplayer**: Local 2-player competition on a single screen where the fastest player to solve the puzzle wins.
- **Cyberpunk Neon Aesthetic**: Futuristic dark theme styled with neon cyan and pink accents, glowing drop shadows, and responsive micro-interactions.
- **Multilingual Support**: Seamlessly toggle between English and Bahasa Indonesia.
- **In-Game Utility Controls**: On-the-fly puzzle reshuffling and tracking recalibration during active gameplay.

---

## Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Computer Vision**: [MediaPipe Hands](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker)
- **Typography**: Sora (Google Fonts)

---

## Prerequisites

Ensure your development environment meets the following requirements:
- [Node.js](https://nodejs.org/) (version 18 or later recommended)
- A working webcam with camera permissions enabled in your browser.

---

## Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ahdzacky/your-face-puzzle.git
   cd your-face-puzzle
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to the local URL displayed in your terminal (typically `http://localhost:5173`).

5. **Allow camera access**:
   When prompted by your browser, grant permission to access the webcam.

---

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the local development server with hot module replacement (HMR) |
| `npm run build` | Runs TypeScript type checking and compiles the production bundle into `dist/` |
| `npm run preview` | Locally serves the production build for verification |

---

## How to Play & Controls

1. **Menu Navigation**:
   - Switch language (EN or ID) using the selector at the top right.
   - Choose your preferred game mode: Single Player or Multiplayer.
   - Click or point your hand at the button to activate the camera and start the game.

2. **Face Capture**:
   - Hold up both hands to form a rectangular frame around your face.
   - Hold the position steady until the countdown finishes and your face image is captured.

3. **Solving the Puzzle**:
   - Bring your index finger and thumb together (pinch gesture) over a puzzle tile to pick it up.
   - Drag the tile over to an adjacent position and release your pinch to place or swap it.
   - Tiles will snap and lock into place when placed in their correct original positions.

4. **In-Game Controls**:
   - **Shuffle**: Re-scrambles the current puzzle pieces.
   - **Recalibrate**: Resets camera alignment and face detection if needed.
   - **Exit**: Returns to the main menu.

---

## Project Structure

```text
your-face-puzzle/
├── public/                  # Static assets and favicons
├── src/
│   ├── components/          # React UI components
│   │   ├── Footer.tsx
│   │   ├── GameCanvas.tsx
│   │   ├── InGameControls.tsx
│   │   ├── LanguageSelector.tsx
│   │   ├── MainMenu.tsx
│   │   └── WinScreen.tsx
│   ├── core/                # Core game logic and computer vision handlers
│   │   ├── Player.ts
│   │   └── handTracking.ts
│   ├── i18n/                # Localization dictionaries
│   │   └── translations.ts
│   ├── types/               # TypeScript interfaces and type definitions
│   │   ├── game.ts
│   │   └── mediapipe.d.ts
│   ├── App.tsx              # Root application component
│   ├── constants.ts         # Game configuration constants
│   ├── index.css            # Tailwind CSS configuration and custom styles
│   └── main.tsx             # Application entry point
├── index.html               # HTML entry file including MediaPipe CDN scripts
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

## Author

**Ahmad Miftahul Zaki**

- Website: [ahmadzacky.com](https://ahmadzacky.com)
- GitHub: [@ahdzacky](https://github.com/ahdzacky)
- LinkedIn: [Ahmad Miftahul Zaki](https://www.linkedin.com/in/ahdzacky/)
- Instagram: [@ahdzacky](https://www.instagram.com/ahdzacky/)
- TikTok: [@ahdzacky23](https://www.tiktok.com/@ahdzacky23)
