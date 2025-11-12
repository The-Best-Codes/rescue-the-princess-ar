/**
 * Hand Tracking Phase - Coin Game
 *
 * Simplified coin logic:
 * - Single parent timer manages ALL coins (no per-coin timers)
 * - Coins are pure data with calculated properties
 * - All expiration logic is centralized and predictable
 * - Clean separation: parent manages logic, Coin component just renders
 */

import { useEffect, useRef, useState } from "react";
import { useHandTracking } from "../../hooks/useHandTracking";
import { InstructionsScreen } from "./InstructionsScreen";
import { Coin } from "../ui/Coin";
import { GamePhase } from "../../types/game";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { playCoinCollectSound } from "../../lib/coinAudio";

interface HandTrackingPhaseProps {
  onPhaseComplete: (nextPhase: GamePhase, coinsCollected: number) => void;
}

interface CoinData {
  id: string;
  x: number;
  y: number;
  size: number;
  coinCountdown: number; // Starting countdown value (always 3)
  createdAt: number; // Timestamp when coin was created (server of truth)
  collected: boolean; // Whether the user has collected this coin
  fadeStartTime: number | null; // When fade animation started (for cleanup)
}

const PHASE_DURATION = 30;
const COIN_COUNTDOWN = 3; // Coins last 3 seconds
const FADE_DURATION = 0.5; // Fade animation duration in seconds (must be >= longest animation + buffer)

const DIFFICULTY_STAGES = {
  stage1: {
    duration: 10,
    maxCoins: 1,
    spawnInterval: [1000, 1500],
    sizes: [80, 100],
  },
  stage2: {
    duration: 10,
    maxCoins: 3,
    spawnInterval: [800, 1200],
    sizes: [60, 80],
  },
  stage3: {
    duration: 10,
    maxCoins: 4,
    spawnInterval: [500, 1000],
    sizes: [40, 60],
  },
};

export function HandTrackingPhase({ onPhaseComplete }: HandTrackingPhaseProps) {
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

  const { isReady, checkCoinCollision } = useHandTracking(
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

        const newCoin: CoinData = {
          id: `coin-${nextCoinIdRef.current++}`,
          x: Math.random() * 0.8 + 0.1,
          y: Math.random() * 0.7 + 0.15,
          size:
            Math.floor(
              Math.random() * (stage.sizes[1] - stage.sizes[0]) +
                stage.sizes[0],
            ) || 50,
          coinCountdown: COIN_COUNTDOWN,
          createdAt: Date.now(),
          collected: false,
          fadeStartTime: null,
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

  // Collision detection loop
  useEffect(() => {
    if (phase !== "playing" || !videoRef.current) return;

    const gameLoop = () => {
      setCoins((prevCoins) => {
        return prevCoins.map((coin) => {
          // Don't re-collect already collected coins
          if (coin.collected) return coin;

          const radius = coin.size / 2;
          const isColliding = checkCoinCollision(
            coin.x * window.innerWidth,
            coin.y * window.innerHeight,
            radius * 1.5,
          );

          if (isColliding) {
            setCoinsCollected((prev) => prev + 1);
            playCoinCollectSound();
            return { ...coin, collected: true, fadeStartTime: Date.now() };
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
  }, [phase, checkCoinCollision]);

  // Main game timer - handles both phase timer and coin expiration
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

      // Update coins - calculate remaining time and mark for fade
      setCoins((prevCoins) =>
        prevCoins
          .map((coin) => {
            // Already collected - handle fade
            if (coin.collected) {
              // If fade just started, mark it
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
    }, 50); // Update 20x per second for smooth countdown

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
    onPhaseComplete(GamePhase.FACIAL_EXPRESSION, coinsCollected);
  };

  const instructions = [
    "Pinch your thumb and index finger together to collect coins!",
    "You'll see blue dot on your thumb and yellow dot on your index finger",
    "The number on the coin shows the time before it disappears",
    "Move your hand quickly and pinch coins to collect them!",
  ];

  if (phase === "instructions") {
    return (
      <InstructionsScreen
        title="COIN PINCHING"
        instructions={instructions}
        onStart={handleStartGame}
        isLoading={false}
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
            Continue to Phase 2
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
        className="w-full h-full object-cover scale-x-[-1]"
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
            <Coin
              key={coin.id}
              id={coin.id}
              x={coin.x}
              y={coin.y}
              size={coin.size}
              remainingTime={remainingTime}
              isCollected={coin.collected}
              isFading={isFading}
            />
          );
        })}
      </div>

      <div className="absolute top-4 left-4 z-10">
        <div className="hud-box">
          <p className="hud-label">Coins</p>
          <p className="hud-value">{coinsCollected}</p>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <div className="hud-box">
          <p className="hud-label">Time</p>
          <p className="hud-value">
            {Math.floor(timeRemaining / 60)}:
            {(timeRemaining % 60).toString().padStart(2, "0")}
          </p>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 z-10">
        <Progress
          value={(timeRemaining / PHASE_DURATION) * 100}
          className="h-2"
        />
      </div>

      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
          <div className="text-center">
            <p className="text-white text-lg mb-4">Loading hand tracking...</p>
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        </div>
      )}
    </div>
  );
}
