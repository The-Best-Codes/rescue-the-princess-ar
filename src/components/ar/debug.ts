/* eslint-disable @typescript-eslint/no-explicit-any */
const MAX_DEBUG_LINES = 120;

// Helper functions to get DOM elements dynamically
const getStatusText = () => document.getElementById("status-text");
const getOverlayMessage = () => document.getElementById("overlay-message");
const getToggleDebugBtn = () => document.getElementById("toggle-debug");
const getDebugPanel = () => document.getElementById("debug-panel");
const getDebugLogEl = () => document.getElementById("debug-log");
const getClearDebugBtn = () => document.getElementById("clear-debug");
const getUiRoot = () => document.getElementById("ui-root");

const debugMessages: string[] = [];

const INITIAL_OVERLAY_HTML =
  "Tap <strong>Enter AR</strong> and move your device in a circle to scan the room.";

function clampDecimals(value: any, digits = 2) {
  if (typeof value !== "number") return value;
  return Number(value.toFixed(digits));
}

function toPositionObject(vec3: any) {
  if (!vec3) return null;
  return {
    x: clampDecimals(vec3.x),
    y: clampDecimals(vec3.y),
    z: clampDecimals(vec3.z),
  };
}

function appendDebugLine(message: string, detail?: any) {
  const time = new Date().toLocaleTimeString();
  let line = `[${time}] ${message}`;
  if (detail !== undefined) {
    if (detail && detail.isVector3) {
      line += ` ${JSON.stringify(toPositionObject(detail))}`;
    } else {
      try {
        line += ` ${JSON.stringify(detail)}`;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error: any) {
        line += ` ${String(detail)}`;
      }
    }
  }
  debugMessages.push(line);
  if (debugMessages.length > MAX_DEBUG_LINES) {
    debugMessages.shift();
  }
  const debugLogEl = getDebugLogEl();
  if (debugLogEl) {
    debugLogEl.textContent = debugMessages.join("\n");
  }
}

function clearDebug() {
  debugMessages.length = 0;
  const debugLogEl = getDebugLogEl();
  if (debugLogEl) {
    debugLogEl.textContent = "(no messages yet)";
  }
}

function setStatus(message: string) {
  const statusText = getStatusText();
  if (statusText) {
    statusText.textContent = message;
  }
  appendDebugLine("Status update", message);
}

function setOverlayMessage(message: string, useHTML = false) {
  const overlayMessage = getOverlayMessage();
  if (overlayMessage) {
    if (useHTML) {
      overlayMessage.innerHTML = message;
    } else {
      overlayMessage.textContent = message;
    }
  }
}

function showUI(show: boolean) {
  const uiRoot = getUiRoot();
  if (uiRoot) {
    if (show) {
      uiRoot.classList.remove("ui--hidden");
    } else {
      uiRoot.classList.add("ui--hidden");
    }
  }
}

function setupDebugButtonHandlers() {
  const toggleDebugBtn = getToggleDebugBtn();
  const debugPanel = getDebugPanel();
  if (toggleDebugBtn && debugPanel) {
    toggleDebugBtn.addEventListener("click", () => {
      const hidden = debugPanel.classList.toggle("ui__debug--hidden");
      toggleDebugBtn.textContent = hidden ? "Show Debug" : "Hide Debug";
    });
  }

  const clearDebugBtn = getClearDebugBtn();
  if (clearDebugBtn) {
    clearDebugBtn.addEventListener("click", () => {
      clearDebug();
      appendDebugLine("Debug log cleared");
    });
  }
}

export {
  appendDebugLine,
  toPositionObject,
  clearDebug,
  setStatus,
  setOverlayMessage,
  showUI,
  setupDebugButtonHandlers,
  INITIAL_OVERLAY_HTML,
};
