/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";
import { GamePhase } from "../../types/game";

declare global {
  interface Window {
    AFRAME: any;
    THREE: any;
  }
}

interface ARDragonBattleProps {
  onPhaseComplete: (nextPhase: GamePhase) => void;
  hasARSupport: boolean;
  selectedWeapons: {
    shield: string | null;
    sword: string | null;
    helmet: string | null;
  };
}

export function ARDragonBattle({
  onPhaseComplete,
  hasARSupport,
  selectedWeapons,
}: ARDragonBattleProps) {
  const dragonHealthRef = useRef(100);
  const battleTimerRef = useRef<NodeJS.Timeout | null>(null);

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
            onPhaseComplete(GamePhase.VICTORY); // Victory for skipping
          });
        }
      }
      return;
    }

    // Import AR modules dynamically
    const initAR = async () => {
      try {
        // Import AR modules
        const { registerDragonBehaviorComponent, calculateDamageBonus } =
          await import("./dragon");
        const {
          setupDragonStartButton,
          setupDragonExitButton,
          setupDragonSceneEventListeners,
          setupGlobalErrorHandlers,
          checkXRSupport,
          resetDragonExperience,
        } = await import("./xr-session-dragon");

        // Register A-Frame components
        registerDragonBehaviorComponent();

        // Calculate total damage bonus from weapons
        const damageBonus = calculateDamageBonus(selectedWeapons);

        // Setup AR functionality
        setupDragonStartButton(damageBonus);
        setupDragonExitButton();
        setupDragonSceneEventListeners();
        setupGlobalErrorHandlers();

        resetDragonExperience();
        checkXRSupport();

        // Setup battle mechanics
        let battleStarted = false;
        const scene = document.querySelector("a-scene");

        if (scene) {
          scene.addEventListener("dragon-placed", () => {
            if (!battleStarted) {
              battleStarted = true;
              startBattle();
            }
          });
        }

        function startBattle() {
          // Show battle UI
          const overlayHealth = document.getElementById("overlay-health");
          if (overlayHealth) {
            overlayHealth.style.display = "block";
            updateHealthDisplay();
          }

          // Start monitoring dragon health
          battleTimerRef.current = setInterval(() => {
            updateHealthDisplay();

            if (dragonHealthRef.current <= 0) {
              endBattle(true); // Victory
            }
          }, 100);
        }

        function updateHealthDisplay() {
          const healthText = document.getElementById("health-text");
          const healthBar = document.getElementById("health-bar-fill");

          if (healthText) {
            healthText.textContent = `${Math.max(0, dragonHealthRef.current)}`;
          }

          if (healthBar) {
            const healthPercent = Math.max(0, dragonHealthRef.current);
            healthBar.style.width = `${healthPercent}%`;

            // Change color based on health
            if (healthPercent > 60) {
              healthBar.style.backgroundColor = "#22c55e"; // Green
            } else if (healthPercent > 30) {
              healthBar.style.backgroundColor = "#eab308"; // Yellow
            } else {
              healthBar.style.backgroundColor = "#ef4444"; // Red
            }
          }
        }

        function endBattle(victory: boolean) {
          if (battleTimerRef.current) {
            clearInterval(battleTimerRef.current);
          }

          if (victory) {
            // Show victory message
            const overlayMessage = document.getElementById("overlay-message");
            if (overlayMessage) {
              overlayMessage.innerHTML =
                "<strong>Victory!</strong> The dragon has been defeated!";
            }

            // Transition to victory phase after delay
            setTimeout(() => {
              onPhaseComplete(GamePhase.VICTORY);
            }, 3000);
          }
        }

        // Track dragon damage
        document.addEventListener("dragon-damaged", (event: any) => {
          const damage = event.detail?.damage || 10;
          dragonHealthRef.current = Math.max(
            0,
            dragonHealthRef.current - damage,
          );

          if (dragonHealthRef.current <= 0) {
            // Dragon defeated
            document.dispatchEvent(new CustomEvent("dragon-defeated"));
          }
        });
      } catch (error) {
        alert(`Failed to initialize AR: ${error}`);
        console.error("Failed to initialize AR:", error);
        onPhaseComplete(GamePhase.VICTORY);
      }
    };

    // Wait for A-Frame to be available
    if (window.AFRAME) {
      initAR();
    } else {
      const checkAFrame = setInterval(() => {
        if (window.AFRAME) {
          clearInterval(checkAFrame);
          initAR();
        }
      }, 100);
    }

    return () => {
      if (battleTimerRef.current) {
        clearInterval(battleTimerRef.current);
      }
    };
  }, [onPhaseComplete, hasARSupport, selectedWeapons]);

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `
        <div id="ui-root" class="ui">
          <div class="ui__card">
            <h1 class="ui__title">Dragon Battle</h1>
            <p class="ui__status" id="status-text">Checking device capabilities…</p>
            <div class="ui__actions">
              <button class="ui__button" id="start-ar" disabled>Enter AR</button>
            </div>
          </div>
        </div>

        <div id="overlay" class="overlay">
          <div class="overlay__card">
            <div class="overlay__header">
              <h1 class="overlay__title">Dragon Battle</h1>
              <div class="overlay__health" id="overlay-health" style="display: none;">
                Dragon: <span id="health-text">100</span> HP
                <div class="health-bar">
                  <div id="health-bar-fill" class="health-bar-fill"></div>
                </div>
              </div>
            </div>
            <p class="overlay__message" id="overlay-message">
              Tap <strong>Enter AR</strong> and find a safe space to place the dragon.
            </p>
            <button class="overlay__button" id="exit-ar">Exit AR</button>
          </div>
        </div>

        <a-scene
          renderer="colorManagement: true; antialias: true;"
          webxr="optionalFeatures: hit-test, dom-overlay; overlayElement: #overlay"
          xr-mode-ui="XRMode: xr"
          ar-hit-test="target: #dragon-root"
        >
          <a-entity id="cameraRig">
            <a-camera
              id="player"
              position="0 1.6 0"
              look-controls="pointerLockEnabled: false"
            ></a-camera>
          </a-entity>

          <a-entity id="dragon-root" position="0 0 -1"></a-entity>

          <a-entity
            id="reticle"
            geometry="primitive: ring; radiusInner: 0.045; radiusOuter: 0.06"
            material="color: #ef4444; shader: flat"
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

          .ui__button:hover:not(:disabled) {
            transform: translateY(2px);
            box-shadow: 0 2px 0 oklch(0.45 0.12 35);
          }

          .ui__button:active:not(:disabled) {
            transform: translateY(4px);
            box-shadow: 0 0px 0 oklch(0.45 0.12 35);
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
            align-items: flex-start;
            margin-bottom: 6px;
            flex-wrap: wrap;
            gap: 8px;
          }

          .overlay__title {
            margin: 0;
            font-size: 1.1rem;
            font-weight: bold;
            color: oklch(0.65 0.15 45);
            letter-spacing: 0.05em;
            text-transform: uppercase;
          }

          .overlay__health {
            background: oklch(0.65 0.15 45);
            color: oklch(0.98 0.01 50);
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.9rem;
            font-weight: bold;
            font-family: "Courier New", monospace;
            box-shadow: 0 2px 0 oklch(0.45 0.12 35);
            min-width: 120px;
          }

          .health-bar {
            width: 100%;
            height: 6px;
            background: rgba(255,255,255,0.3);
            border-radius: 3px;
            margin-top: 4px;
            overflow: hidden;
          }

          .health-bar-fill {
            height: 100%;
            width: 100%;
            background: #22c55e;
            transition: width 0.3s ease, background-color 0.3s ease;
            border-radius: 3px;
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

          .damage-number {
            position: absolute;
            color: #ef4444;
            font-size: 2rem;
            font-weight: bold;
            font-family: "Courier New", monospace;
            pointer-events: none;
            z-index: 20;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
          }

          .damage-number--fade {
            animation: damageFloat 1.5s ease-out forwards;
          }

          @keyframes damageFloat {
            0% {
              opacity: 1;
              transform: translateY(0px) scale(1);
            }
            100% {
              opacity: 0;
              transform: translateY(-60px) scale(1.2);
            }
          }
        </style>
      `,
      }}
    />
  );
}
