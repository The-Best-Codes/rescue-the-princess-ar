/* eslint-disable @typescript-eslint/no-explicit-any */

export const SHAKE_THRESHOLD = 25;
export const SHAKE_TIMEOUT = 500;

export interface ShakeDetectionConfig {
  onShake: () => void;
  threshold?: number;
  timeout?: number;
}

let shakeDetectionActive = false;
let lastShakeTime = 0;
let currentConfig: ShakeDetectionConfig | null = null;

export function startShakeDetection(config: ShakeDetectionConfig) {
  if (shakeDetectionActive) {
    // If shake detection is already active, update the callback
    currentConfig = config;
    return;
  }

  shakeDetectionActive = true;
  currentConfig = config;
  lastShakeTime = 0;

  const threshold = config.threshold ?? SHAKE_THRESHOLD;
  const timeout = config.timeout ?? SHAKE_TIMEOUT;

  const handleDeviceMotion = (event: DeviceMotionEvent) => {
    const acc = event.accelerationIncludingGravity;
    if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

    const magnitude = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);
    const now = Date.now();

    if (magnitude > threshold && now - lastShakeTime > timeout) {
      lastShakeTime = now;
      if (currentConfig) {
        currentConfig.onShake();
      }
    }
  };

  window.addEventListener("devicemotion", handleDeviceMotion, true);

  (window as any).__stopShakeDetection = () => {
    window.removeEventListener("devicemotion", handleDeviceMotion, true);
    shakeDetectionActive = false;
    currentConfig = null;
  };
}

export function stopShakeDetection() {
  if ((window as any).__stopShakeDetection) {
    (window as any).__stopShakeDetection();
  }
}

export function isShakeDetectionActive(): boolean {
  return shakeDetectionActive;
}
