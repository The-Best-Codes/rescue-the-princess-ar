const MAX_DEBUG_LINES = 120;

const statusText = document.getElementById("status-text");
const overlayMessage = document.getElementById("overlay-message");
const toggleDebugBtn = document.getElementById("toggle-debug");
const debugPanel = document.getElementById("debug-panel");
const debugLogEl = document.getElementById("debug-log");
const clearDebugBtn = document.getElementById("clear-debug");
const uiRoot = document.getElementById("ui-root");

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
      } catch (error) {
        line += ` ${String(detail)}`;
      }
    }
  }
  debugMessages.push(line);
  if (debugMessages.length > MAX_DEBUG_LINES) {
    debugMessages.shift();
  }
  if (debugLogEl) {
    debugLogEl.textContent = debugMessages.join("\n");
  }
}

function clearDebug() {
  debugMessages.length = 0;
  if (debugLogEl) {
    debugLogEl.textContent = "(no messages yet)";
  }
}

function setStatus(message: string) {
  if (statusText) {
    statusText.textContent = message;
  }
  appendDebugLine("Status update", message);
}

function setOverlayMessage(message: string, useHTML = false) {
  if (overlayMessage) {
    if (useHTML) {
      overlayMessage.innerHTML = message;
    } else {
      overlayMessage.textContent = message;
    }
  }
}

function showUI(show: boolean) {
  if (uiRoot) {
    if (show) {
      uiRoot.classList.remove("ui--hidden");
    } else {
      uiRoot.classList.add("ui--hidden");
    }
  }
}

function setupDebugButtonHandlers() {
  if (toggleDebugBtn && debugPanel) {
    toggleDebugBtn.addEventListener("click", () => {
      const hidden = debugPanel.classList.toggle("ui__debug--hidden");
      toggleDebugBtn.textContent = hidden ? "Show Debug" : "Hide Debug";
    });
  }

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
  statusText,
  overlayMessage,
};
