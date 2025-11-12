/* eslint-disable @typescript-eslint/no-explicit-any */
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
  hasARSupport: boolean;
}

export function ARScene({ onPhaseComplete, hasARSupport }: ARSceneProps) {
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const coinsCollectedRef = useRef(0);
  const timeRemainingRef = useRef(60);

  useEffect(() => {
    // If AR is not supported, show warning and skip option
    if (!hasARSupport) {
      const uiRoot = document.getElementById("ui-root");
      if (uiRoot) {
        uiRoot.innerHTML = `
          <div class="ui__card" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
            <h1 class="ui__title">AR Not Supported</h1>
            <p class="ui__status">Your device doesn't support augmented reality.</p>
            <div class="ui__actions">
              <button class="ui__button" id="skip-phase">Skip Phase</button>
            </div>
          </div>
        `;

        const skipButton = document.getElementById("skip-phase");
        if (skipButton) {
          skipButton.addEventListener("click", () => {
            // Remove fullscreen class if it was added
            document.documentElement.classList.remove("a-fullscreen");
            onPhaseComplete(GamePhase.WEAPON_SHOP, 10); // Give 10 coins for skipping
          });
        }
      }
      return;
    }

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

        // Register A-Frame components
        registerCoinBehaviorComponent();

        // Setup AR functionality
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
          timeRemainingRef.current = 60;

          // Show countdown timer
          const overlayTimer = document.getElementById("overlay-timer");
          if (overlayTimer) {
            overlayTimer.style.display = "block";
          }

          gameTimerRef.current = setInterval(() => {
            timeRemainingRef.current -= 1;

            // Update countdown display
            const timerText = document.getElementById("timer-text");
            if (timerText) {
              timerText.textContent = timeRemainingRef.current.toString();
            }

            // Check if all coins are collected or 60 seconds passed
            const remainingCoins =
              document.querySelectorAll("[coin-behavior]").length;

            if (
              remainingCoins === 0 ||
              coinsCollectedRef.current >= 18 ||
              timeRemainingRef.current <= 0
            ) {
              endGame();
            }
          }, 1000);
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
            </div>
          </div>
        </div>

        <div id="overlay" class="overlay">
          <div class="overlay__card">
            <div class="overlay__header">
              <h1 class="overlay__title">AR Coin Hunt</h1>
              <div class="overlay__timer" id="overlay-timer" style="display: none;">
                ⏰ <span id="timer-text">60</span>s
              </div>
            </div>
            <p class="overlay__message" id="overlay-message">
              Tap <strong>Enter AR</strong> and follow instructions to place coins in your real space.
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
            align-items: center;
            flex-direction: column;
            pointer-events: auto;
            z-index: 5;
          }

          .ui__card {
            background: oklch(0.98 0.015 50 / 0.85);
            color: oklch(0.15 0.03 30);
            border: 4px solid oklch(0.65 0.15 45);
            border-radius: 10px;
            padding: 24px;
            max-width: 420px;
            width: min(90vw, 420px);
            box-shadow: 0 4px 0 oklch(0.45 0.12 35);
            backdrop-filter: blur(14px);
            font-family: "Courier New", monospace;
          }

          .ui__title {
            margin: 0 0 8px;
            font-size: 1.5rem;
            font-weight: bold;
            color: oklch(0.65 0.15 45);
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          .ui__status {
            margin: 0 0 18px;
            font-size: 1rem;
            line-height: 1.6;
            color: oklch(0.5 0.03 35);
          }

          .ui__actions {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }

          .ui__button {
            border: none;
            border-radius: 8px;
            padding: 12px 18px;
            background: oklch(0.65 0.15 45);
            color: oklch(0.98 0.01 50);
            font-size: 0.95rem;
            font-weight: bold;
            font-family: "Courier New", monospace;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.05s ease;
            box-shadow: 0 4px 0 oklch(0.45 0.12 35);
          }

          .ui__button--secondary {
            background: oklch(0.85 0.08 50);
            color: oklch(0.25 0.04 30);
            box-shadow: 0 4px 0 oklch(0.65 0.12 40);
          }

          .ui__button--tiny {
            padding: 6px 10px;
            font-size: 0.8rem;
          }

          .ui__button:hover:not(:disabled) {
            transform: translateY(2px);
            box-shadow: 0 2px 0 oklch(0.45 0.12 35);
          }

          .ui__button:active:not(:disabled) {
            transform: translateY(4px);
            box-shadow: 0 0px 0 oklch(0.45 0.12 35);
          }

          .ui__debug {
            background: oklch(0.15 0.02 40 / 0.9);
            border: 2px solid oklch(0.65 0.15 45);
            border-radius: 8px;
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
            color: oklch(0.9 0.03 50);
            font-weight: bold;
            font-family: "Courier New", monospace;
          }

          .ui__debug-log {
            background: oklch(0.1 0.02 35 / 0.5);
            border-radius: 6px;
            padding: 12px;
            font-family: "Courier New", monospace;
            font-size: 0.8rem;
            color: oklch(0.6 0.04 45);
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
            background: oklch(0.98 0.015 50 / 0.85);
            color: oklch(0.15 0.03 30);
            border: 4px solid oklch(0.65 0.15 45);
            border-radius: 8px;
            padding: 18px 22px;
            max-width: 360px;
            width: 100%;
            box-shadow: 0 4px 0 oklch(0.45 0.12 35);
            backdrop-filter: blur(12px);
            pointer-events: auto;
            font-family: "Courier New", monospace;
          }

          .overlay__header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;
          }

          .overlay__title {
            margin: 0;
            font-size: 1.1rem;
            font-weight: bold;
            color: oklch(0.65 0.15 45);
            letter-spacing: 0.05em;
            text-transform: uppercase;
          }

          .overlay__timer {
            background: oklch(0.65 0.15 45);
            color: oklch(0.98 0.01 50);
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.9rem;
            font-weight: bold;
            font-family: "Courier New", monospace;
            box-shadow: 0 2px 0 oklch(0.45 0.12 35);
          }

          .overlay__message {
            margin: 0 0 14px;
            font-size: 0.95rem;
            line-height: 1.5;
            color: oklch(0.5 0.03 35);
          }

          .overlay__button {
            width: 100%;
            border: none;
            border-radius: 6px;
            background: oklch(0.75 0.12 40);
            color: oklch(0.98 0.01 50);
            font-weight: bold;
            font-size: 0.95rem;
            font-family: "Courier New", monospace;
            padding: 10px 14px;
            cursor: pointer;
            transition: all 0.05s ease;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            box-shadow: 0 3px 0 oklch(0.55 0.1 35);
          }

          .overlay__button:hover {
            transform: translateY(1px);
            box-shadow: 0 2px 0 oklch(0.55 0.1 35);
          }

          .overlay__button:active {
            transform: translateY(3px);
            box-shadow: 0 0px 0 oklch(0.55 0.1 35);
          }

          .overlay__coin {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 4rem;
            z-index: 10;
            pointer-events: none;
            filter: drop-shadow(0 0 20px oklch(0.65 0.15 45));
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
