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
  reticle,
  setReticleShouldBeVisible,
} from "./reticle.js";
import { scatterCoins, clearCoins, stopShakeDetection } from "./coins.js";

const SCAN_PROMPT_DELAY = 2500;
const SCAN_PROMPT_REPEAT = 9000;

const scene = document.querySelector("a-scene");
const startButton = document.getElementById("start-ar");
const exitButton = document.getElementById("exit-ar");

let scanningReminderId: any = null;
let scanningReminderTimeoutId: any = null;

function startScanningReminder() {
  stopScanningReminder();
  scanningReminderTimeoutId = setTimeout(() => {
    if (!scene || !(scene as any).is("ar-mode")) return;
    setOverlayMessage("Keep scanning so we can place the coins.");
    scanningReminderId = setInterval(() => {
      if (!scene || !(scene as any).is("ar-mode")) {
        stopScanningReminder();
        return;
      }
      setOverlayMessage("Keep scanning so we can place the coins.");
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

function resetExperience() {
  clearCoins();
  stopShakeDetection();
  stopReticleTracking();
  stopScanningReminder();
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
      setStatus("Ready when you are! Find a safe space and tap Enter AR.");
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
    setStatus("AR session active — look around to find the coins.");
    if (startButton) {
      (startButton as HTMLButtonElement).disabled = false;
    }
    setOverlayMessage(
      "Move your phone slowly in a circle to scan the room.",
      false,
    );
    startScanningReminder();
  }
}

function handleExitVREvent() {
  appendDebugLine("exit-vr", { arMode: scene && (scene as any).is("ar-mode") });
  showUI(true);
  if (startButton) {
    (startButton as HTMLButtonElement).disabled = false;
  }
  setStatus("Session ended. Tap Enter AR to explore again.");
  resetExperience();
  stopReticleTracking();
}

function setupStartButton() {
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

function setupExitButton() {
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

function setupSceneEventListeners() {
  if (scene) {
    scene.addEventListener("loaded", () => {
      appendDebugLine("A-Frame scene loaded");
      appendDebugLine("THREE revision", (window as any).THREE?.REVISION);
    });

    scene.addEventListener("enter-vr", handleEnterVREvent);
    scene.addEventListener("exit-vr", handleExitVREvent);

    scene.addEventListener("ar-hit-test-start", () => {
      appendDebugLine("ar-hit-test-start");
      setReticleShouldBeVisible(false);
      if (reticle) {
        reticle.setAttribute("visible", "false");
      }
      setOverlayMessage("Scanning… keep moving your device.");
      startScanningReminder();
      ensureReticleTracking();
    });

    scene.addEventListener("ar-hit-test-achieved", (event: any) => {
      appendDebugLine("ar-hit-test-achieved", event.detail?.position);
      const hitMesh = getHitTestMesh();
      const hasPose = hitMesh && updateReticlePoseFromHitTest();
      if (!hasPose && event.detail?.position && reticle) {
        (reticle as any).object3D.position.copy(event.detail.position);
        (reticle as any).object3D.quaternion.set(0, 0, 0, 1);
      }
      setOverlayMessage(
        "Point your phone at the floor until a green circle appears, then tap to place coins.",
      );
      setReticleShouldBeVisible(true);
      if (reticle && !reticle.getAttribute("visible")) {
        reticle.setAttribute("visible", "true");
      }
      if (reticle) {
        reticle.setAttribute(
          "animation__pulse",
          "property: scale; dir: alternate; dur: 600; easing: easeInOutSine; from: 1 1 1; to: 1.12 1.12 1.12; loop: true",
        );
      }
      stopScanningReminder();
      ensureReticleTracking();
    });

    scene.addEventListener("ar-hit-test-select", (event: any) => {
      const target = event.detail?.position;
      appendDebugLine("ar-hit-test-select", target);
      if (!target && reticle) {
        const hasPose = updateReticlePoseFromHitTest();
        if (!hasPose) return;
        scatterCoins((reticle as any).object3D.position.clone());
      } else {
        if (reticle) {
          (reticle as any).object3D.position.copy(target);
        }
        scatterCoins(target);
      }
      setOverlayMessage(
        "Collect the floating coins! Move close to change their color.",
      );
      setReticleShouldBeVisible(false);
      if (reticle) {
        reticle.removeAttribute("animation__pulse");
        reticle.setAttribute("visible", "false");
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
        "We lost track of the room. Try moving the device slowly.",
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
  setupStartButton,
  setupExitButton,
  setupSceneEventListeners,
  setupGlobalErrorHandlers,
  checkXRSupport,
  resetExperience,
};
