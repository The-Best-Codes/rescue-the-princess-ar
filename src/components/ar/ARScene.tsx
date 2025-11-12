import { useEffect, useRef } from "react";
import { GamePhase } from "../../types/game";

declare global {
  interface Window {
    AFRAME: any;
    THREE: any;
  }
}

interface ARSceneProps {
  onPhaseComplete: (nextPhase: GamePhase, coinsEarned?: number) => void;
}

export function ARScene({ onPhaseComplete }: ARSceneProps) {
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const coinsCollectedRef = useRef(0);

  useEffect(() => {
    // Import AR modules dynamically
    const initAR = async () => {
      try {
        // Import AR modules
        const { registerCoinBehaviorComponent } = await import("./coins");
        const {
          setupStartButton,
          setupExitButton,
          setupSceneEventListeners,
          setupGlobalErrorHandlers,
          checkXRSupport,
          resetExperience,
        } = await import("./xr-session");
        const { setupDebugButtonHandlers } = await import("./debug");

        // Register A-Frame components
        registerCoinBehaviorComponent();

        // Setup AR functionality
        setupDebugButtonHandlers();
        setupStartButton();
        setupExitButton();
        setupSceneEventListeners();
        setupGlobalErrorHandlers();

        resetExperience();
        checkXRSupport();

        // Setup game timer for 60 seconds
        let gameStarted = false;
        const scene = document.querySelector("a-scene");

        if (scene) {
          scene.addEventListener("ar-hit-test-select", () => {
            if (!gameStarted) {
              gameStarted = true;
              startGameTimer();
            }
          });
        }

        function startGameTimer() {
          gameTimerRef.current = setInterval(() => {
            // Check if all coins are collected or 60 seconds passed
            const remainingCoins =
              document.querySelectorAll("[coin-behavior]").length;

            if (remainingCoins === 0 || coinsCollectedRef.current >= 18) {
              endGame();
            }
          }, 1000);

          // Auto-end after 60 seconds
          setTimeout(() => {
            endGame();
          }, 60000);
        }

        function endGame() {
          if (gameTimerRef.current) {
            clearInterval(gameTimerRef.current);
          }

          // Count collected coins (18 - remaining)
          const remainingCoins =
            document.querySelectorAll("[coin-behavior]").length;
          const collected = 18 - remainingCoins;

          onPhaseComplete(GamePhase.WEAPON_SHOP, collected);
        }

        // Track coin collection
        document.addEventListener("coin-collected", () => {
          coinsCollectedRef.current++;
        });
      } catch (error) {
        console.error("Failed to initialize AR:", error);
        onPhaseComplete(GamePhase.WEAPON_SHOP, 0);
      }
    };

    // Wait for A-Frame to be available
    if (window.AFRAME) {
      initAR();
    } else {
      const checkAFRame = setInterval(() => {
        if (window.AFRAME) {
          clearInterval(checkAFRame);
          initAR();
        }
      }, 100);
    }

    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }
    };
  }, [onPhaseComplete]);

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `
        <div id="ui-root" class="ui">
          <div class="ui__card">
            <h1 class="ui__title">AR Coin Hunt</h1>
            <p class="ui__status" id="status-text">Checking device capabilities…</p>
            <div class="ui__actions">
              <button class="ui__button" id="start-ar" disabled>Enter AR</button>
              <button class="ui__button ui__button--secondary" id="toggle-debug">
                Show Debug
              </button>
            </div>
          </div>
          <div id="debug-panel" class="ui__debug ui__debug--hidden">
            <div class="ui__debug-head">
              <span>Debug Log</span>
              <button class="ui__button ui__button--tiny" id="clear-debug">
                Clear
              </button>
            </div>
            <pre id="debug-log" class="ui__debug-log">(no messages yet)</pre>
          </div>
        </div>

        <div id="overlay" class="overlay">
          <div class="overlay__card">
            <h1 class="overlay__title">AR Coin Hunt</h1>
            <p class="overlay__message" id="overlay-message">
              Tap <strong>Enter AR</strong> and move your device in a circle to scan
              the room.
            </p>
            <button class="overlay__button" id="exit-ar">Exit AR</button>
          </div>
        </div>

        <a-scene
          renderer="colorManagement: true; antialias: true;"
          webxr="optionalFeatures: hit-test, dom-overlay; overlayElement: #overlay"
          xr-mode-ui="XRMode: xr"
          ar-hit-test="target: #coin-root"
        >
          <a-entity id="cameraRig">
            <a-camera
              id="player"
              position="0 1.6 0"
              look-controls="pointerLockEnabled: false"
            ></a-camera>
          </a-entity>

          <a-entity id="coin-root" position="0 0 -1"></a-entity>

          <a-entity
            id="reticle"
            geometry="primitive: ring; radiusInner: 0.045; radiusOuter: 0.06"
            material="color: #4caf50; shader: flat"
            rotation="-90 0 0"
            visible="false"
          >
          </a-entity>
        </a-scene>

        <style>
          .ui {
            position: absolute;
            inset: 0;
            display: flex;
            gap: 16px;
            padding: 24px;
            justify-content: center;
            align-items: flex-start;
            flex-direction: column;
            pointer-events: auto;
            z-index: 5;
          }
          
          .ui__card {
            background: rgba(15, 23, 42, 0.85);
            color: #e2e8f0;
            border-radius: 18px;
            padding: 24px;
            max-width: 420px;
            width: min(90vw, 420px);
            box-shadow: 0 20px 60px rgba(15, 23, 42, 0.35);
            backdrop-filter: blur(14px);
          }
          
          .ui__title {
            margin: 0 0 8px;
            font-size: 1.5rem;
            font-weight: 600;
          }
          
          .ui__status {
            margin: 0 0 18px;
            font-size: 1rem;
            line-height: 1.6;
            color: #cbd5f5;
          }
          
          .ui__actions {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }
          
          .ui__button {
            border: none;
            border-radius: 12px;
            padding: 12px 18px;
            background: linear-gradient(135deg, #2563eb, #3b82f6);
            color: white;
            font-size: 0.95rem;
            font-weight: 600;
            letter-spacing: 0.01em;
            cursor: pointer;
            transition: transform 0.18s ease, box-shadow 0.18s ease;
            box-shadow: 0 12px 30px rgba(37, 99, 235, 0.35);
          }
          
          .ui__button--secondary {
            background: rgba(148, 163, 184, 0.2);
            box-shadow: none;
          }
          
          .ui__button--tiny {
            padding: 6px 10px;
            font-size: 0.8rem;
          }
          
          .ui__debug {
            background: rgba(15, 23, 42, 0.9);
            border-radius: 12px;
            padding: 16px;
            max-width: 500px;
            width: min(90vw, 500px);
            max-height: 300px;
            overflow: hidden;
          }
          
          .ui__debug--hidden {
            display: none;
          }
          
          .ui__debug-head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            color: #e2e8f0;
            font-weight: 600;
          }
          
          .ui__debug-log {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            padding: 12px;
            font-family: monospace;
            font-size: 0.8rem;
            color: #94a3b8;
            overflow-y: auto;
            max-height: 200px;
            margin: 0;
            white-space: pre-wrap;
          }
          
          .overlay {
            position: absolute;
            inset: 0;
            display: none;
            pointer-events: none;
            font-family: inherit;
            z-index: 4;
          }
          
          .overlay:xr-overlay {
            display: flex;
            justify-content: center;
            align-items: flex-end;
            padding: 24px;
            pointer-events: none;
          }
          
          .overlay__card {
            background: rgba(17, 24, 39, 0.75);
            color: #f9fafb;
            border-radius: 16px;
            padding: 18px 22px;
            max-width: 360px;
            width: 100%;
            box-shadow: 0 12px 48px rgba(15, 23, 42, 0.35);
            backdrop-filter: blur(12px);
            pointer-events: auto;
          }
          
          .overlay__title {
            margin: 0 0 6px;
            font-size: 1.1rem;
            font-weight: 600;
          }
          
          .overlay__message {
            margin: 0 0 14px;
            font-size: 0.95rem;
            line-height: 1.5;
          }
          
          .overlay__button {
            width: 100%;
            border: none;
            border-radius: 10px;
            background: rgba(251, 191, 36, 0.15);
            color: #fde68a;
            font-weight: 600;
            font-size: 0.95rem;
            padding: 10px 14px;
            cursor: pointer;
            transition: background 0.2s ease;
          }
          
          .overlay__coin {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 4rem;
            z-index: 10;
            pointer-events: none;
          }
          
          .overlay__coin--fade-out {
            animation: coinFadeOut 0.7s ease-in-out;
          }
          
          @keyframes coinFadeOut {
            0% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(1.5);
            }
          }
        </style>
      `,
      }}
    />
  );
}
