import { useEffect, useRef, useState } from "react";
import { useHandTracking } from "../../hooks/useHandTracking";
import { InstructionsScreen } from "./InstructionsScreen";
import { Coin } from "../ui/Coin";
import { GamePhase } from "../../types/game";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";

interface HandTrackingPhaseProps {
  onPhaseComplete: (nextPhase: GamePhase, coinsCollected: number) => void;
}

interface CoinData {
  id: string;
  x: number;
  y: number;
  size: number;
  countdown: number;
  createdAt: number;
  collected?: boolean;
}

const PHASE_DURATION = 30;
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

  useEffect(() => {
    if (phase !== "playing") return;

    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await new Promise((resolve) => {
            if (videoRef.current) {
              videoRef.current.onloadedmetadata = () => resolve(null);
            }
          });
        }
      } catch (err) {
        console.error("Camera access error:", err);
      }
    };

    initCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [phase]);

  const getCurrentStage = (elapsed: number) => {
    if (elapsed < 10) return DIFFICULTY_STAGES.stage1;
    if (elapsed < 20) return DIFFICULTY_STAGES.stage2;
    return DIFFICULTY_STAGES.stage3;
  };

  useEffect(() => {
    if (phase !== "playing" || !videoRef.current || !isReady) return;

    const spawnCoin = () => {
      setCoins((prevCoins) => {
        const stage = getCurrentStage(PHASE_DURATION - timeRemaining);
        if (prevCoins.length >= stage.maxCoins) return prevCoins;

        const newCoin: CoinData = {
          id: `coin-${nextCoinIdRef.current++}`,
          x: Math.random() * 0.8 + 0.1,
          y: Math.random() * 0.7 + 0.15,
          size:
            Math.floor(
              Math.random() * (stage.sizes[1] - stage.sizes[0]) +
                stage.sizes[0],
            ) || 50,
          countdown: 3,
          createdAt: Date.now(),
        };

        return [...prevCoins, newCoin];
      });

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

  useEffect(() => {
    if (phase !== "playing" || !videoRef.current) return;

    const gameLoop = () => {
      setCoins((prevCoins) => {
        const updated = prevCoins.map((coin) => {
          if (coin.collected) return coin; // Already collected, don't process again

          const radius = coin.size / 2;
          // Convert normalized coordinates to screen coordinates
          const isColliding = checkCoinCollision(
            coin.x * window.innerWidth,
            coin.y * window.innerHeight,
            radius * 1.5,
          );

          if (isColliding) {
            setCoinsCollected((prev) => prev + 1);
            return { ...coin, collected: true };
          }

          return coin;
        });

        return updated;
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

  useEffect(() => {
    if (phase !== "playing") return;

    if (!phaseStartRef.current) {
      phaseStartRef.current = Date.now();
    }

    const timer = setInterval(() => {
      const elapsed = Math.floor(
        (Date.now() - (phaseStartRef.current || 0)) / 1000,
      );
      const remaining = Math.max(0, PHASE_DURATION - elapsed);

      setTimeRemaining(remaining);

      if (remaining === 0) {
        setPhase("results");
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [phase]);

  const handleCoinExpire = (coinId: string) => {
    setCoins((prev) => prev.filter((c) => c.id !== coinId));
  };

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
    "Line up your fingertip with the coins to collect them!",
    "The number on the coin shows how long you have to grab it",
    "Move your hand quickly to collect as many coins as possible!",
  ];

  if (phase === "instructions") {
    return (
      <InstructionsScreen
        title="HAND TRACKING"
        instructions={instructions}
        onStart={handleStartGame}
        isLoading={false}
      />
    );
  }

  if (phase === "results") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center space-y-8">
          <h1 className="retro-title">PHASE COMPLETE!</h1>

          <div className="bg-card rounded-lg border-2 border-primary p-8">
            <div className="space-y-2 text-center">
              <p className="text-muted-foreground text-sm">COINS COLLECTED</p>
              <p className="text-6xl font-bold text-primary">
                {coinsCollected}
              </p>
            </div>
          </div>

          <Button
            onClick={handleContinue}
            className="retro-button px-8 py-3 text-lg"
          >
            Continue to Phase 2
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
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
        {coins.map((coin) => (
          <Coin
            key={coin.id}
            id={coin.id}
            x={coin.x}
            y={coin.y}
            size={coin.size}
            countdown={coin.countdown}
            onExpire={handleCoinExpire}
            collected={coin.collected}
          />
        ))}
      </div>

      <div className="absolute top-4 left-4 z-10">
        <div className="bg-black px-6 py-3 rounded-lg border-2 border-primary shadow-lg">
          <p className="text-xs font-bold text-yellow-300">COINS</p>
          <p className="text-3xl font-bold text-yellow-300">{coinsCollected}</p>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <div className="bg-black px-6 py-3 rounded-lg border-2 border-primary shadow-lg">
          <p className="text-xs font-bold text-yellow-300">TIME</p>
          <p className="text-3xl font-bold text-yellow-300">
            {Math.floor(timeRemaining / 60)}:
            {(timeRemaining % 60).toString().padStart(2, "0")}
          </p>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 z-10 max-w-xs">
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
