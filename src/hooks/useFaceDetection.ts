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
      videoElement.paused
    ) {
      detectionLoopRef.current = requestAnimationFrame(detectExpressions);
      return;
    }

    try {
      const currentTime = videoElement.currentTime;

      // Only run detection if video has advanced to new frame
      if (lastVideoTimeRef.current !== currentTime) {
        lastVideoTimeRef.current = currentTime;

        // Perform detection
        const result = await faceapi
          .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions();

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

          // Draw face detection box (optional visualization)
          if (canvasElement && canvasCtxRef.current) {
            canvasElement.width = videoElement.videoWidth;
            canvasElement.height = videoElement.videoHeight;

            const resizedDetection = faceapi.resizeResults(
              result,
              videoElement,
            );

            // Draw detection box with subtle styling
            const ctx = canvasCtxRef.current;
            const box = resizedDetection.detection.box;

            ctx.strokeStyle = "rgba(0, 255, 0, 0.3)";
            ctx.lineWidth = 2;
            ctx.strokeRect(box.x, box.y, box.width, box.height);

            // Optional: Draw landmarks
            // Uncomment for visualization
            // faceapi.draw.drawFaceLandmarks(canvasElement, resizedDetection);
          }
        } else {
          setCurrentExpressions(null);
          setTopExpression(null);

          // Clear canvas if no face detected
          if (canvasCtxRef.current && canvasElement) {
            canvasCtxRef.current.clearRect(
              0,
              0,
              canvasElement.width,
              canvasElement.height,
            );
          }
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
