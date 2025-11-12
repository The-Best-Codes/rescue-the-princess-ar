/**
 * Facial Expression Phase - Coin Collection via Expression Recognition
 *
 * 30-second phase where players make facial expressions to match coins
 * Uses face-api.js for real-time emotion detection
 */

import { useEffect, useRef, useState } from "react";
import {
  useFaceDetection,
  type ExpressionType,
} from "../../hooks/useFaceDetection";
import { InstructionsScreen } from "./InstructionsScreen";
import { ExpressionCoin } from "../ui/ExpressionCoin";
import { GamePhase } from "../../types/game";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { playCoinCollectSound } from "../../lib/coinAudio";

interface FacialExpressionPhaseProps {
  onPhaseComplete: (nextPhase: GamePhase, coinsCollected: number) => void;
}

interface CoinData {
  id: string;
  x: number;
  y: number;
  size: number;
  targetExpression: ExpressionType;
  emoji: string;
  label: string;
  coinCountdown: number;
  createdAt: number;
  collected: boolean;
  fadeStartTime: number | null;
  matchedAtTime: number | null; // Track when expression matched
}

const PHASE_DURATION = 30;
const COIN_COUNTDOWN = 3;
const FADE_DURATION = 0.5; // Must be >= longest animation duration + buffer
const EXPRESSION_MATCH_THRESHOLD = 0.65; // Confidence threshold for expression match
const EXPRESSION_MATCH_DURATION = 0.3; // How long expression must be held (seconds)

const EXPRESSIONS = {
  happy: { emoji: "😊", label: "HAPPY" },
  sad: { emoji: "😢", label: "SAD" },
  angry: { emoji: "😠", label: "ANGRY" },
  surprised: { emoji: "😮", label: "SURPRISED" },
  disgusted: { emoji: "🤢", label: "DISGUSTED" },
  neutral: { emoji: "😐", label: "NEUTRAL" },
} as const;

const DIFFICULTY_STAGES = {
  stage1: {
    duration: 10,
    maxCoins: 1,
    spawnInterval: [1500, 2000],
    sizes: [80, 100],
    expressions: ["happy", "sad", "neutral"] as ExpressionType[],
  },
  stage2: {
    duration: 10,
    maxCoins: 2,
    spawnInterval: [1000, 1500],
    sizes: [60, 80],
    expressions: ["happy", "sad", "neutral", "angry"] as ExpressionType[],
  },
  stage3: {
    duration: 10,
    maxCoins: 3,
    spawnInterval: [500, 1000],
    sizes: [40, 60],
    expressions: [
      "happy",
      "sad",
      "angry",
      "surprised",
      "disgusted",
      "neutral",
    ] as ExpressionType[],
  },
};

export function FacialExpressionPhase({
  onPhaseComplete,
}: FacialExpressionPhaseProps) {
  const [phase, setPhase] = useState<"instructions" | "playing" | "results">(
    "instructions",
  );
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(PHASE_DURATION);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number | null>(null);
  const spawnTimerRef = useRef<number | null>(null);
  const phaseStartRef = useRef<number | null>(null);
  const nextCoinIdRef = useRef(0);

  const { isReady, checkExpressionMatch, currentExpressions, topExpression } =
    useFaceDetection(
      phase === "playing" ? videoRef.current : null,
      phase === "playing" ? canvasRef.current : null,
    );

  // Initialize camera
  useEffect(() => {
    if (phase !== "playing") return;

    const videoElement = videoRef.current;

    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (videoElement) {
          videoElement.srcObject = stream;
          await new Promise((resolve) => {
            if (videoElement) {
              videoElement.onloadedmetadata = () => resolve(null);
            }
          });
        }
      } catch (err) {
        console.error("Camera access error:", err);
      }
    };

    initCamera();

    return () => {
      if (videoElement?.srcObject) {
        const tracks = (videoElement.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [phase]);

  const getCurrentStage = (elapsed: number) => {
    if (elapsed < 10) return DIFFICULTY_STAGES.stage1;
    if (elapsed < 20) return DIFFICULTY_STAGES.stage2;
    return DIFFICULTY_STAGES.stage3;
  };

  // Spawn coins on interval
  useEffect(() => {
    if (phase !== "playing" || !videoRef.current || !isReady) return;

    const spawnCoin = () => {
      setCoins((prevCoins) => {
        const stage = getCurrentStage(PHASE_DURATION - timeRemaining);
        // Only spawn if under max coins for current stage
        if (prevCoins.filter((c) => !c.collected).length >= stage.maxCoins) {
          return prevCoins;
        }

        // Pick random expression from stage's available expressions
        const targetExpression =
          stage.expressions[
            Math.floor(Math.random() * stage.expressions.length)
          ];

        const newCoin: CoinData = {
          id: `expr-coin-${nextCoinIdRef.current++}`,
          x: Math.random() * 0.8 + 0.1,
          y: Math.random() * 0.7 + 0.15,
          size:
            Math.floor(
              Math.random() * (stage.sizes[1] - stage.sizes[0]) +
                stage.sizes[0],
            ) || 50,
          targetExpression,
          emoji: EXPRESSIONS[targetExpression].emoji,
          label: EXPRESSIONS[targetExpression].label,
          coinCountdown: COIN_COUNTDOWN,
          createdAt: Date.now(),
          collected: false,
          fadeStartTime: null,
          matchedAtTime: null,
        };

        return [...prevCoins, newCoin];
      });

      // Schedule next spawn
      const stage = getCurrentStage(PHASE_DURATION - timeRemaining);
      const nextSpawnTime =
        Math.random() * (stage.spawnInterval[1] - stage.spawnInterval[0]) +
        stage.spawnInterval[0];
      spawnTimerRef.current = window.setTimeout(spawnCoin, nextSpawnTime);
    };

    // Spawn first coin immediately
    spawnCoin();

    return () => {
      if (spawnTimerRef.current) {
        clearTimeout(spawnTimerRef.current);
      }
    };
  }, [phase, isReady, timeRemaining]);

  // Expression matching loop
  useEffect(() => {
    if (phase !== "playing" || !isReady) return;

    const gameLoop = () => {
      setCoins((prevCoins) => {
        return prevCoins.map((coin) => {
          // Don't re-collect already collected coins
          if (coin.collected) return coin;

          // Check if expression matches
          const isMatching = checkExpressionMatch(
            coin.targetExpression,
            EXPRESSION_MATCH_THRESHOLD,
          );

          if (isMatching) {
            // First match - record time
            if (!coin.matchedAtTime) {
              return { ...coin, matchedAtTime: Date.now() };
            }

            // Check if expression has been held long enough
            const heldDuration = (Date.now() - coin.matchedAtTime) / 1000;
            if (heldDuration >= EXPRESSION_MATCH_DURATION) {
              // Collect the coin!
              setCoinsCollected((prev) => prev + 1);
              playCoinCollectSound();
              return {
                ...coin,
                collected: true,
                fadeStartTime: Date.now(),
              };
            }

            return coin;
          } else {
            // Expression no longer matching - reset match timer
            if (coin.matchedAtTime) {
              return { ...coin, matchedAtTime: null };
            }
          }

          return coin;
        });
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [phase, isReady, checkExpressionMatch]);

  // Main game timer
  useEffect(() => {
    if (phase !== "playing") return;

    if (!phaseStartRef.current) {
      phaseStartRef.current = Date.now();
    }

    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - (phaseStartRef.current || 0)) / 1000);
      const remaining = Math.max(0, PHASE_DURATION - elapsed);

      setTimeRemaining(remaining);

      // Update coins - handle expiration and fading
      setCoins((prevCoins) =>
        prevCoins
          .map((coin) => {
            // Already collected - handle fade
            if (coin.collected) {
              if (!coin.fadeStartTime) {
                return { ...coin, fadeStartTime: now };
              }
              return coin;
            }

            // Not collected - check if expired
            const coinElapsed = (now - coin.createdAt) / 1000;
            const coinTimeLeft = Math.max(0, COIN_COUNTDOWN - coinElapsed);

            // If coin time is up, start fade
            if (coinTimeLeft <= 0 && !coin.fadeStartTime) {
              return { ...coin, fadeStartTime: now };
            }

            return coin;
          })
          // Remove coins that finished fading (use <= instead of < for safety margin)
          .filter((coin) => {
            if (!coin.fadeStartTime) return true;

            const fadeElapsed = (now - coin.fadeStartTime) / 1000;
            return fadeElapsed <= FADE_DURATION;
          }),
      );

      if (remaining === 0) {
        setPhase("results");
      }
    }, 50);

    return () => clearInterval(timer);
  }, [phase]);

  const handleStartGame = () => {
    setPhase("playing");
    setCoinsCollected(0);
    setCoins([]);
    setTimeRemaining(PHASE_DURATION);
    phaseStartRef.current = null;
  };

  const handleContinue = () => {
    onPhaseComplete(GamePhase.AR_HUNT, coinsCollected);
  };

  const instructions = [
    "Make the facial expression shown on the coin to collect it!",
    "Expressions: 😊 Happy, 😠 Angry, 😮 Surprised, 😢 Sad, 🤢 Disgusted, 😐 Neutral",
    "Hold your expression for a moment to collect the coin!",
  ];

  if (phase === "instructions") {
    return (
      <InstructionsScreen
        title="EMOJI MIMIC"
        instructions={instructions}
        onStart={handleStartGame}
        isLoading={!isReady}
      />
    );
  }

  if (phase === "results") {
    return (
      <div className="min-h-[100svh] bg-background flex items-center justify-center p-4">
        <div className="max-w-xl w-full text-center space-y-6">
          <h1 className="retro-title">COMPLETE!</h1>

          <Card className="retro-card">
            <CardContent className="p-6 space-y-3 text-center">
              <p className="text-xs font-bold text-muted-foreground uppercase">
                Coins Collected
              </p>
              <p className="text-5xl font-bold text-primary">
                {coinsCollected}
              </p>
            </CardContent>
          </Card>

          <Button onClick={handleContinue} className="retro-button w-full">
            Continue to Phase 3
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[100svh] bg-black overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />

      <div className="absolute inset-0">
        {coins.map((coin) => {
          const now = Date.now();
          const coinElapsed = (now - coin.createdAt) / 1000;
          const remainingTime = Math.max(0, COIN_COUNTDOWN - coinElapsed);
          const isFading = coin.fadeStartTime !== null;

          return (
            <ExpressionCoin
              key={coin.id}
              id={coin.id}
              x={coin.x}
              y={coin.y}
              size={coin.size}
              emoji={coin.emoji}
              expressionLabel={coin.label}
              remainingTime={remainingTime}
              isCollected={coin.collected}
              isFading={isFading}
            />
          );
        })}
      </div>

      {/* Coin counter */}
      <div className="absolute top-4 left-4 z-10">
        <div className="hud-box">
          <p className="hud-label">Coins</p>
          <p className="hud-value">{coinsCollected}</p>
        </div>
      </div>

      {/* Timer */}
      <div className="absolute top-4 right-4 z-10">
        <div className="hud-box">
          <p className="hud-label">Time</p>
          <p className="hud-value">
            {Math.floor(timeRemaining / 60)}:
            {(timeRemaining % 60).toString().padStart(2, "0")}
          </p>
        </div>
      </div>

      {/* Current emotion feedback */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="hud-box">
          <p className="hud-label">Detected</p>
          <p className="hud-value text-xl">
            {topExpression ? `${EXPRESSIONS[topExpression].emoji}` : "—"}
          </p>
          {currentExpressions && topExpression && (
            <p className="text-xs text-primary/70">
              {Math.round(currentExpressions[topExpression] * 100)}%
            </p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-4 right-4 z-10 max-w-xs">
        <Progress
          value={(timeRemaining / PHASE_DURATION) * 100}
          className="h-2"
        />
      </div>

      {/* Loading state */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
          <div className="text-center">
            <p className="text-white text-lg mb-4">Loading face detection...</p>
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        </div>
      )}
    </div>
  );
}
