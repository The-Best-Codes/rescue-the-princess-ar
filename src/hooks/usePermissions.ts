import { useState } from "react";
import { type DeviceCapabilities, type PermissionState } from "../types/game";

export function usePermissions() {
  const [permissions, setPermissions] = useState<PermissionState>({
    camera: "prompt",
    deviceMotion: "prompt",
  });

  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    camera: false,
    ar: false,
    deviceMotion: false,
    handTracking: false,
    faceDetection: false,
  });

  const [isChecking, setIsChecking] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  const checkDeviceCapabilities = async (): Promise<DeviceCapabilities> => {
    const caps: DeviceCapabilities = {
      camera: false,
      ar: false,
      deviceMotion: false,
      handTracking: false,
      faceDetection: false,
    };

    // Check for camera support without actually requesting permission
    try {
      // Just check if getUserMedia is available, don't actually call it
      if (
        navigator.mediaDevices &&
        typeof navigator.mediaDevices.getUserMedia === "function"
      ) {
        caps.camera = true;
        caps.handTracking = true; // Assume hand tracking if camera API exists
        caps.faceDetection = true; // Assume face detection if camera API exists
      }
    } catch (error) {
      console.warn("Camera API not available:", error);
    }

    // Check for WebXR (AR) support
    if (
      "xr" in navigator &&
      (
        navigator as unknown as {
          xr?: { isSessionSupported: (mode: string) => Promise<boolean> };
        }
      ).xr
    ) {
      try {
        const xrSystem = (
          navigator as unknown as {
            xr: { isSessionSupported: (mode: string) => Promise<boolean> };
          }
        ).xr;
        const isSupported = await xrSystem.isSessionSupported("immersive-ar");
        caps.ar = isSupported || false;
      } catch {
        console.warn("AR not supported");
      }
    }

    // Check for device motion support (without requesting permission)
    if ("DeviceMotionEvent" in window) {
      const deviceMotionEvent = DeviceMotionEvent as unknown as {
        requestPermission?: () => Promise<string>;
      };
      if (typeof deviceMotionEvent.requestPermission === "function") {
        // iOS 13+ requires permission - just check if the API exists
        caps.deviceMotion = true; // API exists, permission can be requested later
      } else {
        // Android and older iOS - motion events available
        caps.deviceMotion = true;
      }
    }

    return caps;
  };

  const requestCameraPermission = async (): Promise<"granted" | "denied"> => {
    setPermissions((prev) => ({ ...prev, camera: "checking" }));

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      stream.getTracks().forEach((track) => track.stop());
      setPermissions((prev) => ({ ...prev, camera: "granted" }));
      return "granted";
    } catch {
      setPermissions((prev) => ({ ...prev, camera: "denied" }));
      return "denied";
    }
  };

  const requestDeviceMotionPermission = async (): Promise<
    "granted" | "denied"
  > => {
    setPermissions((prev) => ({ ...prev, deviceMotion: "checking" }));

    const deviceMotionEvent = DeviceMotionEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };
    if (typeof deviceMotionEvent.requestPermission === "function") {
      try {
        const permission = await deviceMotionEvent.requestPermission();
        const granted = permission === "granted";
        setPermissions((prev) => ({
          ...prev,
          deviceMotion: granted ? "granted" : "denied",
        }));
        return granted ? "granted" : "denied";
      } catch {
        setPermissions((prev) => ({ ...prev, deviceMotion: "denied" }));
        return "denied";
      }
    } else {
      // Auto-grant for devices that don't require permission
      setPermissions((prev) => ({ ...prev, deviceMotion: "granted" }));
      return "granted";
    }
  };

  const checkAllPermissions = async () => {
    if (hasChecked) return; // Only check once

    setIsChecking(true);

    try {
      const caps = await checkDeviceCapabilities();
      setCapabilities(caps);
      setHasChecked(true);
    } catch (error) {
      console.error("Error checking capabilities:", error);
    }

    setIsChecking(false);
  };

  return {
    permissions,
    capabilities,
    isChecking,
    hasChecked,
    requestCameraPermission,
    requestDeviceMotionPermission,
    checkAllPermissions,
  };
}
