/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Comprehensive cleanup utilities for AR scenes
 * Ensures proper cleanup of DOM elements, event listeners, and A-Frame resources
 */

export function cleanupARScene() {
  // Remove fullscreen class
  document.documentElement.classList.remove("a-fullscreen");

  // Clean up A-Frame scene if it exists
  const scene = document.querySelector("a-scene");
  if (scene) {
    try {
      // End XR session if active
      if ((scene as any).renderer?.xr?.getSession?.()) {
        try {
          const session = (scene as any).renderer.xr.getSession();
          if (session) {
            session.end();
          }
        } catch (error) {
          console.warn("Error ending XR session during cleanup:", error);
        }
      }

      // Remove all event listeners from scene
      const sceneClone = scene.cloneNode(false);
      if (scene.parentNode) {
        scene.parentNode.replaceChild(sceneClone, scene);
      }
    } catch (error) {
      console.warn("Error cleaning up A-Frame scene:", error);
      // Fallback: remove the scene entirely
      if (scene.parentNode) {
        scene.parentNode.removeChild(scene);
      }
    }
  }

  // Clean up all AR-related DOM elements
  const arElements = [
    "#ui-root",
    "#overlay",
    "#reticle",
    "#coin-root",
    "#dragon-root",
    "#cameraRig",
    "#player",
  ];

  arElements.forEach((selector) => {
    const element = document.querySelector(selector);
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  });

  // Clean up any remaining A-Frame elements
  const aframeElements = document.querySelectorAll(
    "a-scene, a-entity, a-camera",
  );
  aframeElements.forEach((element) => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  });

  // Remove AR-specific classes from body
  document.body.classList.remove("a-fullscreen", "ar-mode");

  // Clear any global AR state
  if ((window as any).AFRAME) {
    try {
      // Reset A-Frame global state if possible
      delete (window as any).AFRAME.scenes[0];
    } catch (error) {
      console.warn("Error resetting A-Frame global state:", error);
    }
  }
}

export function cleanupEventListeners(elementId: string) {
  const element = document.getElementById(elementId);
  if (element) {
    // Clone the element to remove all event listeners
    const clone = element.cloneNode(true);
    if (element.parentNode) {
      element.parentNode.replaceChild(clone, element);
    }
  }
}

export function removeCustomElements() {
  // Remove any custom elements that might have been registered
  const customElements = ["coin-behavior", "dragon-behavior"];

  customElements.forEach((tagName) => {
    const elements = document.querySelectorAll(`[${tagName}]`);
    elements.forEach((element) => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
  });
}

export function resetGlobalState() {
  // Reset any global variables that might have been set
  const globalProps = [
    "reticleTrackingActive",
    "scanningReminderId",
    "scanningReminderTimeoutId",
    "dragonPlaced",
    "damageBonus",
    "dragonSelectHandler",
  ];

  globalProps.forEach((prop) => {
    if ((window as any)[prop] !== undefined) {
      delete (window as any)[prop];
    }
  });
}

export function comprehensiveCleanup() {
  console.log("Starting comprehensive AR cleanup...");

  try {
    cleanupARScene();
    cleanupEventListeners("start-ar");
    cleanupEventListeners("exit-ar");
    removeCustomElements();
    resetGlobalState();

    console.log("AR cleanup completed successfully");
  } catch (error) {
    console.error("Error during AR cleanup:", error);
  }
}
