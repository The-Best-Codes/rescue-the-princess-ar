import { useEffect, useRef, useState, useCallback } from "react";
import * as faceapi from "face-api.js";

export type ExpressionType =
  | "happy"
  | "sad"
  | "angry"
  | "surprised"
  | "disgusted"
  | "neutral";

export interface ExpressionScores {
  happy: number;
  sad: number;
  angry: number;
  surprised: number;
  disgusted: number;
  neutral: number;
}

export function useFaceDetection(
  videoElement: HTMLVideoElement | null,
  canvasElement: HTMLCanvasElement | null,
) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentExpressions, setCurrentExpressions] =
    useState<ExpressionScores | null>(null);
  const [topExpression, setTopExpression] = useState<ExpressionType | null>(
    null,
  );

  const modelsLoadedRef = useRef(false);
  const detectionLoopRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef(-1);
  const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  // Load models once
  useEffect(() => {
    const loadModels = async () => {
      try {
        // Load models from local /models directory
        const modelPath = "/models";

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
          faceapi.nets.faceExpressionNet.loadFromUri(modelPath),
        ]);

        modelsLoadedRef.current = true;
        setIsReady(true);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load face-api models";
        setError(message);
        console.error("Face detection model loading error:", err);
      }
    };

    loadModels();
  }, []);

  // Setup canvas context
  useEffect(() => {
    if (canvasElement) {
      canvasCtxRef.current = canvasElement.getContext("2d");
    }
  }, [canvasElement]);

  // Main detection loop
  const detectExpressions = useCallback(async () => {
    if (
      !videoElement ||
      !modelsLoadedRef.current ||
      !isReady ||
      videoElement.paused ||
      videoElement.readyState < 2
    ) {
      detectionLoopRef.current = requestAnimationFrame(detectExpressions);
      return;
    }

    try {
      const currentTime = videoElement.currentTime;

      // Only run detection if video has advanced to new frame
      if (lastVideoTimeRef.current !== currentTime) {
        lastVideoTimeRef.current = currentTime;

        // Check if video dimensions are valid before performing detection
        if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
          detectionLoopRef.current = requestAnimationFrame(detectExpressions);
          return;
        }

        // Perform detection
        const result = await faceapi
          .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions();

        // Clear canvas before drawing
        if (canvasElement && canvasCtxRef.current) {
          canvasElement.width = window.innerWidth;
          canvasElement.height = window.innerHeight;
          canvasCtxRef.current.clearRect(
            0,
            0,
            canvasElement.width,
            canvasElement.height,
          );
        }

        if (result) {
          // Convert to normalized scores
          const expressions = result.expressions;
          const scores: ExpressionScores = {
            happy: expressions.happy,
            sad: expressions.sad,
            angry: expressions.angry,
            surprised: expressions.surprised,
            disgusted: expressions.disgusted,
            neutral: expressions.neutral,
          };

          setCurrentExpressions(scores);

          // Find top expression
          const entries = Object.entries(scores);
          const topEntry = entries.reduce((prev, current) =>
            current[1] > prev[1] ? current : prev,
          );
          setTopExpression(topEntry[0] as ExpressionType);

          // Draw face detection box
          if (canvasElement && canvasCtxRef.current) {
            const displaySize = {
              width: videoElement.videoWidth,
              height: videoElement.videoHeight,
            };
            const resizedDetection = faceapi.resizeResults(result, displaySize);

            // Draw detection box with blue styling
            const ctx = canvasCtxRef.current;
            const box = resizedDetection.detection.box;

            // Get video element position and size on screen
            const videoRect = videoElement.getBoundingClientRect();

            // Calculate scale factors to map video coordinates to screen coordinates
            const scaleX = videoRect.width / videoElement.videoWidth;
            const scaleY = videoRect.height / videoElement.videoHeight;

            // Scale and position the box to match the video's screen position
            const screenX = videoRect.left + box.x * scaleX;
            const screenY = videoRect.top + box.y * scaleY;
            const screenWidth = box.width * scaleX;
            const screenHeight = box.height * scaleY;

            ctx.strokeStyle = "#0099ff";
            ctx.lineWidth = 4;
            ctx.strokeRect(screenX, screenY, screenWidth, screenHeight);
          }
        } else {
          setCurrentExpressions(null);
          setTopExpression(null);
        }
      }
    } catch (err) {
      console.error("Detection loop error:", err);
    }

    detectionLoopRef.current = requestAnimationFrame(detectExpressions);
  }, [videoElement, isReady, canvasElement]);

  // Start detection when video is ready
  useEffect(() => {
    if (!videoElement || !isReady) return;

    const handleLoadedMetadata = () => {
      if (!detectionLoopRef.current) {
        detectExpressions();
      }
    };

    const handlePlay = () => {
      if (!detectionLoopRef.current) {
        detectExpressions();
      }
    };

    const handlePause = () => {
      if (detectionLoopRef.current) {
        cancelAnimationFrame(detectionLoopRef.current);
        detectionLoopRef.current = null;
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
      if (detectionLoopRef.current) {
        cancelAnimationFrame(detectionLoopRef.current);
      }
    };
  }, [videoElement, isReady, detectExpressions]);

  // Check if current expression matches target with confidence threshold
  const checkExpressionMatch = useCallback(
    (targetExpression: ExpressionType, threshold = 0.6): boolean => {
      if (!currentExpressions) return false;
      return currentExpressions[targetExpression] >= threshold;
    },
    [currentExpressions],
  );

  return {
    currentExpressions,
    topExpression,
    isReady,
    error,
    checkExpressionMatch,
  };
}
