import { useEffect, useRef, useState, useCallback } from "react";
import {
  HandLandmarker,
  FilesetResolver,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";

const HAND_LANDMARK_INDEX = {
  INDEX_FINGER_TIP: 8, // Index finger tip
};

export function useHandTracking(
  videoElement: HTMLVideoElement | null,
  canvasElement: HTMLCanvasElement | null,
) {
  const [indexFingerPosition, setIndexFingerPosition] =
    useState<NormalizedLandmark | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef(-1);
  const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  // Initialize HandLandmarker
  useEffect(() => {
    const initializeHandLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm",
        );

        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 2,
        });

        handLandmarkerRef.current = landmarker;
        setIsReady(true);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to initialize hand tracking";
        setError(message);
        console.error("Hand tracking initialization error:", err);
      }
    };

    initializeHandLandmarker();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Setup canvas context
  useEffect(() => {
    if (canvasElement) {
      canvasCtxRef.current = canvasElement.getContext("2d");
    }
  }, [canvasElement]);

  // Detect hands from video
  const detectHands = useCallback(() => {
    if (
      !videoElement ||
      !handLandmarkerRef.current ||
      !isReady ||
      videoElement.paused
    ) {
      return;
    }

    try {
      const currentTime = videoElement.currentTime;

      if (lastVideoTimeRef.current !== currentTime) {
        lastVideoTimeRef.current = currentTime;
        const startTimeMs = performance.now();
        const results = handLandmarkerRef.current.detectForVideo(
          videoElement,
          startTimeMs,
        );

        // Update canvas dimensions to match screen size
        if (canvasElement) {
          canvasElement.width = window.innerWidth;
          canvasElement.height = window.innerHeight;
        }

        // Clear canvas
        if (canvasCtxRef.current && canvasElement) {
          canvasCtxRef.current.clearRect(
            0,
            0,
            canvasElement.width,
            canvasElement.height,
          );
        }

        // Draw landmarks and get finger position
        if (results.landmarks && results.landmarks.length > 0) {
          const landmarks = results.landmarks[0];

          // Draw hand skeleton
          if (canvasCtxRef.current) {
            // Draw connections (lines between joints)
            canvasCtxRef.current.strokeStyle = "#00FF00";
            canvasCtxRef.current.lineWidth = 5;
            canvasCtxRef.current.lineCap = "round";

            // Standard hand connections
            const connections = [
              [0, 1],
              [1, 2],
              [2, 3],
              [3, 4], // Thumb
              [5, 6],
              [6, 7],
              [7, 8], // Index
              [9, 10],
              [10, 11],
              [11, 12], // Middle
              [13, 14],
              [14, 15],
              [15, 16], // Ring
              [17, 18],
              [18, 19],
              [19, 20], // Pinky
              [0, 5],
              [5, 9],
              [9, 13],
              [13, 17],
              [0, 17], // Palm
            ];

            for (const [start, end] of connections) {
              const p1 = landmarks[start];
              const p2 = landmarks[end];
              if (p1 && p2 && canvasCtxRef.current) {
                canvasCtxRef.current.beginPath();
                canvasCtxRef.current.moveTo(
                  p1.x * window.innerWidth,
                  p1.y * window.innerHeight,
                );
                canvasCtxRef.current.lineTo(
                  p2.x * window.innerWidth,
                  p2.y * window.innerHeight,
                );
                canvasCtxRef.current.stroke();
              }
            }

            // Draw landmarks (circles at joints)
            canvasCtxRef.current.fillStyle = "#FF0000";
            for (const landmark of landmarks) {
              if (canvasCtxRef.current) {
                canvasCtxRef.current.beginPath();
                canvasCtxRef.current.arc(
                  landmark.x * window.innerWidth,
                  landmark.y * window.innerHeight,
                  5,
                  0,
                  2 * Math.PI,
                );
                canvasCtxRef.current.fill();
              }
            }

            // Highlight index finger tip with larger dot
            const indexTip = landmarks[HAND_LANDMARK_INDEX.INDEX_FINGER_TIP];
            if (indexTip && canvasCtxRef.current) {
              canvasCtxRef.current.fillStyle = "#FFFF00";
              canvasCtxRef.current.beginPath();
              canvasCtxRef.current.arc(
                indexTip.x * window.innerWidth,
                indexTip.y * window.innerHeight,
                12,
                0,
                2 * Math.PI,
              );
              canvasCtxRef.current.fill();

              // Store for collision detection
              setIndexFingerPosition(indexTip);
            }
          }
        } else {
          setIndexFingerPosition(null);
        }
      }
    } catch (err) {
      console.error("Hand detection error:", err);
    }

    animationFrameRef.current = requestAnimationFrame(detectHands);
  }, [videoElement, isReady, canvasElement]);

  // Start detection when video is ready
  useEffect(() => {
    if (!videoElement || !isReady) return;

    const handleLoadedMetadata = () => {
      detectHands();
    };

    const handlePlay = () => {
      if (!animationFrameRef.current) {
        detectHands();
      }
    };

    const handlePause = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };

    videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
    videoElement.addEventListener("play", handlePlay);
    videoElement.addEventListener("pause", handlePause);

    if (videoElement.readyState >= 2) {
      handleLoadedMetadata();
    }

    return () => {
      videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
      videoElement.removeEventListener("play", handlePlay);
      videoElement.removeEventListener("pause", handlePause);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [videoElement, isReady, detectHands]);

  // Check if a point collides with coin
  const checkCoinCollision = useCallback(
    (coinX: number, coinY: number, coinRadius: number): boolean => {
      if (!indexFingerPosition) return false;

      // Convert normalized coordinates (0-1) to full screen coordinates
      const fingerScreenX = indexFingerPosition.x * window.innerWidth;
      const fingerScreenY = indexFingerPosition.y * window.innerHeight;

      const distance = Math.hypot(fingerScreenX - coinX, fingerScreenY - coinY);
      return distance < coinRadius;
    },
    [indexFingerPosition],
  );

  return {
    indexFingerPosition,
    isReady,
    error,
    checkCoinCollision,
  };
}
