/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  appendDebugLine,
  setStatus,
  setOverlayMessage,
  showUI,
  INITIAL_OVERLAY_HTML,
} from "./debug.js";
import {
  stopReticleTracking,
  ensureReticleTracking,
  updateReticlePoseFromHitTest,
  getHitTestMesh,
  getReticle,
  setReticleShouldBeVisible,
} from "./reticle.js";
import { placeDragon, clearDragon } from "./dragon.js";

const SCAN_PROMPT_DELAY = 2500;
const SCAN_PROMPT_REPEAT = 9000;

const scene = document.querySelector("a-scene");
const startButton = document.getElementById("start-ar");
const exitButton = document.getElementById("exit-ar");

let scanningReminderId: any = null;
let scanningReminderTimeoutId: any = null;
let damageBonus = 0;
let dragonPlaced = false;
let dragonSelectHandler: any = null;

function startScanningReminder() {
  stopScanningReminder();
  scanningReminderTimeoutId = setTimeout(() => {
    if (!scene || !(scene as any).is("ar-mode")) return;
    setOverlayMessage("Keep scanning to place the dragon.");
    scanningReminderId = setInterval(() => {
      if (!scene || !(scene as any).is("ar-mode")) {
        stopScanningReminder();
        return;
      }
      setOverlayMessage("Keep scanning your surroundings to place the dragon.");
    }, SCAN_PROMPT_REPEAT);
  }, SCAN_PROMPT_DELAY);
}

function stopScanningReminder() {
  if (scanningReminderTimeoutId) {
    clearTimeout(scanningReminderTimeoutId);
    scanningReminderTimeoutId = null;
  }
  if (scanningReminderId) {
    clearInterval(scanningReminderId);
    scanningReminderId = null;
  }
}

function setupDragonTapHandler() {
  if (!scene) return;

  const renderer = (scene as any).renderer;
  const session = renderer?.xr?.getSession?.();

  if (!session) {
    appendDebugLine("No XR session found for dragon tap handler");
    return;
  }

  // Remove existing handler if any
  if (dragonSelectHandler) {
    session.removeEventListener("select", dragonSelectHandler);
  }

  // Create new handler for dragon damage
  dragonSelectHandler = () => {
    appendDebugLine("Dragon tap detected");

    // Get the dragon entity
    const dragonEntity = document.querySelector("[dragon-behavior]");
    if (dragonEntity) {
      const dragonComponent = (dragonEntity as any).components[
        "dragon-behavior"
      ];
      if (dragonComponent && !dragonComponent.isDead) {
        dragonComponent.damageDragon();
      }
    }
  };

  session.addEventListener("select", dragonSelectHandler);
  appendDebugLine("Dragon tap handler setup complete");
}

function resetDragonExperience() {
  clearDragon();
  stopReticleTracking();
  stopScanningReminder();
  dragonPlaced = false; // Reset placement flag
  setOverlayMessage(INITIAL_OVERLAY_HTML, true);
}

async function checkXRSupport() {
  if (!("xr" in navigator)) {
    setStatus(
      "WebXR not available in this browser. Try Chrome or Firefox Reality.",
    );
    if (startButton) {
      (startButton as HTMLButtonElement).disabled = true;
    }
    return;
  }

  try {
    const supported = await (navigator as any).xr.isSessionSupported(
      "immersive-ar",
    );
    if (supported) {
      setStatus("Ready for battle! Find a safe space and tap Enter AR.");
      if (startButton) {
        (startButton as HTMLButtonElement).disabled = false;
      }
    } else {
      setStatus("This device does not support immersive AR sessions.");
      if (startButton) {
        (startButton as HTMLButtonElement).disabled = true;
      }
    }
  } catch (error) {
    appendDebugLine(
      "Failed to check XR support",
      error && (error as any).message ? (error as any).message : error,
    );
    setStatus("Could not determine AR support. See debug log.");
    if (startButton) {
      (startButton as HTMLButtonElement).disabled = false;
    }
  }
}

function handleEnterVREvent() {
  appendDebugLine("enter-vr", {
    arMode: scene && (scene as any).is("ar-mode"),
  });
  if (scene && (scene as any).is("ar-mode")) {
    showUI(false);
    setStatus("AR session active — prepare for battle!");
    if (startButton) {
      (startButton as HTMLButtonElement).disabled = false;
    }
    setOverlayMessage(
      "Move your phone slowly in a circle to scan your surroundings.",
      false,
    );
    startScanningReminder();
  }
}

function handleExitVREvent() {
  appendDebugLine("exit-vr", { arMode: scene && (scene as any).is("ar-mode") });
  // Remove fullscreen class to allow scrolling on the page
  document.documentElement.classList.remove("a-fullscreen");
  showUI(true);
  if (startButton) {
    (startButton as HTMLButtonElement).disabled = false;
  }
  setStatus("Battle ended. Tap Enter AR to try again.");
  resetDragonExperience();
  stopReticleTracking();
}

function setupDragonStartButton(weaponDamageBonus: number = 0) {
  damageBonus = weaponDamageBonus;

  if (startButton) {
    startButton.addEventListener("click", async () => {
      if (scene && (scene as any).is("vr-mode")) {
        appendDebugLine("Start button pressed while already in XR");
        return;
      }

      (startButton as HTMLButtonElement).disabled = true;
      setStatus("Requesting AR session…");
      appendDebugLine("Attempting to enter AR mode");

      try {
        if (typeof (scene as any).enterAR === "function") {
          await (scene as any).enterAR();
          appendDebugLine("enterAR() resolved");
        } else {
          throw new Error("AR session API unavailable on this device.");
        }
      } catch (error) {
        appendDebugLine(
          "Failed to start AR session",
          error && (error as any).message ? (error as any).message : error,
        );
        setStatus(
          "AR session request was denied. Try again or check permissions.",
        );
        (startButton as HTMLButtonElement).disabled = false;
      }
    });
  }
}

function setupDragonExitButton() {
  if (exitButton) {
    exitButton.addEventListener("click", () => {
      appendDebugLine("Exit AR button tapped");
      const session = (scene as any)?.renderer?.xr?.getSession?.();
      if (session) {
        session.end();
      } else {
        handleExitVREvent();
      }
      stopReticleTracking();
    });
  }
}

function setupDragonSceneEventListeners() {
  if (scene) {
    scene.addEventListener("loaded", () => {
      appendDebugLine("A-Frame scene loaded for dragon battle");
      appendDebugLine("THREE revision", (window as any).THREE?.REVISION);
    });

    scene.addEventListener("enter-vr", handleEnterVREvent);
    scene.addEventListener("exit-vr", handleExitVREvent);

    scene.addEventListener("ar-hit-test-start", () => {
      appendDebugLine("ar-hit-test-start");
      setReticleShouldBeVisible(false);
      const reticleStartEl = getReticle();
      if (reticleStartEl) {
        reticleStartEl.setAttribute("visible", "false");
      }
      setOverlayMessage("Scanning your surroundings… keep moving your device.");
      startScanningReminder();
      ensureReticleTracking();
    });

    scene.addEventListener("ar-hit-test-achieved", (event: any) => {
      // Don't show reticle if dragon is already placed
      if (dragonPlaced) {
        appendDebugLine("Dragon already placed, ignoring hit test achieved");
        return;
      }

      appendDebugLine("ar-hit-test-achieved", event.detail?.position);
      const hitMesh = getHitTestMesh();
      const hasPose = hitMesh && updateReticlePoseFromHitTest();
      const reticleAchievedEl = getReticle();
      if (!hasPose && event.detail?.position && reticleAchievedEl) {
        (reticleAchievedEl as any).object3D.position.copy(
          event.detail.position,
        );
        (reticleAchievedEl as any).object3D.quaternion.set(0, 0, 0, 1);
      }
      setOverlayMessage(
        "Point your phone at a flat surface until the red reticle appears, then tap to place the dragon.",
      );
      setReticleShouldBeVisible(true);
      if (reticleAchievedEl && !reticleAchievedEl.getAttribute("visible")) {
        reticleAchievedEl.setAttribute("visible", "true");
      }
      if (reticleAchievedEl) {
        reticleAchievedEl.setAttribute(
          "animation__pulse",
          "property: scale; dir: alternate; dur: 600; easing: easeInOutSine; from: 1 1 1; to: 1.12 1.12 1.12; loop: true",
        );
      }
      stopScanningReminder();
      ensureReticleTracking();
    });

    scene.addEventListener("ar-hit-test-select", (event: any) => {
      // Only place dragon if not already placed
      if (dragonPlaced) {
        appendDebugLine("Dragon already placed, ignoring hit test select");
        return;
      }

      const target = event.detail?.position;
      appendDebugLine("ar-hit-test-select", target);
      const reticleSelectEl = getReticle();
      if (!target && reticleSelectEl) {
        const hasPose = updateReticlePoseFromHitTest();
        if (!hasPose) return;
        placeDragon(
          (reticleSelectEl as any).object3D.position.clone(),
          damageBonus,
        );
      } else {
        if (reticleSelectEl) {
          (reticleSelectEl as any).object3D.position.copy(target);
        }
        placeDragon(target, damageBonus);
      }

      // Mark dragon as placed
      dragonPlaced = true;

      // Disable ar-hit-test to stop placement events
      if (scene) {
        scene.setAttribute("ar-hit-test", "enabled: false");
        appendDebugLine("Disabled ar-hit-test after placement");
      }

      // Setup tap handler for dragon damage
      setupDragonTapHandler();

      setOverlayMessage("Attack the dragon! Tap the dragon to deal damage.");
      setReticleShouldBeVisible(false);
      const reticleHideEl = getReticle();
      if (reticleHideEl) {
        reticleHideEl.removeAttribute("animation__pulse");
        reticleHideEl.setAttribute("visible", "false");
      }
    });

    scene.addEventListener("ar-hit-test-select-start", () => {
      appendDebugLine("ar-hit-test-select-start");
      ensureReticleTracking();
    });

    scene.addEventListener("ar-hit-test-error", (event: any) => {
      appendDebugLine("ar-hit-test-error", event.detail || "Unknown error");
      setReticleShouldBeVisible(false);
      setOverlayMessage(
        "Lost track of the room. Try moving the device slowly.",
      );
    });
  }
}

function setupGlobalErrorHandlers() {
  window.addEventListener("error", (event) => {
    appendDebugLine("Window error", event.message || event.error);
  });

  window.addEventListener("unhandledrejection", (event) => {
    appendDebugLine("Unhandled promise rejection", event.reason);
  });
}

export {
  setupDragonStartButton,
  setupDragonExitButton,
  setupDragonSceneEventListeners,
  setupGlobalErrorHandlers,
  checkXRSupport,
  resetDragonExperience,
};
