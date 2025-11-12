import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";
import { GamePhase } from "../../types/game";

// WebXR types
interface XRSystem {
  isSessionSupported(mode: string): Promise<boolean>;
  requestSession(mode: string, options?: XRSessionInit): Promise<XRSession>;
}

interface XRSessionInit {
  requiredFeatures?: string[];
  optionalFeatures?: string[];
  domOverlay?: { root: HTMLElement | null };
}

interface XRSession {
  end(): Promise<void>;
}

// Extend Navigator interface for WebXR
declare global {
  interface Navigator {
    xr?: XRSystem;
  }
}

// Game constants
const COIN_COUNT = 18;
const COIN_DISTANCE_MIN = 1.0;
const COIN_DISTANCE_MAX = 1.8;
const SHAKE_THRESHOLD = 25;
const SHAKE_TIMEOUT = 500;

interface Coin {
  id: string;
  x: number;
  y: number;
  z: number;
  collected: boolean;
  isNear: boolean;
}

interface ARHuntGameProps {
  onPhaseComplete: (nextPhase: GamePhase, coinsEarned?: number) => void;
  hasARSupport: boolean;
}

export function ARHuntGame({ onPhaseComplete, hasARSupport }: ARHuntGameProps) {
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState("");
  const [isXRActive, setIsXRActive] = useState(false);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [nearCoin, setNearCoin] = useState<Coin | null>(null);
  const [gameState, setGameState] = useState<
    "setup" | "scanning" | "playing" | "finished"
  >("setup");

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const shakeDetectionRef = useRef<boolean>(false);
  const lastShakeTimeRef = useRef<number>(0);

  const collectCoin = useCallback((coinId: string) => {
    setCoins((prev) =>
      prev.map((coin) => {
        if (coin.id === coinId && !coin.collected) {
          setCoinsCollected((c) => c + 1);
          return { ...coin, collected: true };
        }
        return coin;
      }),
    );

    setNearCoin(null);

    // Play collection sound effect (simulated)
    console.log("Coin collected!");
  }, []);

  const stopShakeDetection = useCallback(() => {
    const stopFn = (window as { __stopShakeDetection?: () => void })
      .__stopShakeDetection;
    if (stopFn) {
      stopFn();
    }
  }, []);

  const startShakeDetection = useCallback(() => {
    if (shakeDetectionRef.current) return;
    shakeDetectionRef.current = true;

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

      const magnitude = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);
      const now = Date.now();

      if (
        magnitude > SHAKE_THRESHOLD &&
        now - lastShakeTimeRef.current > SHAKE_TIMEOUT
      ) {
        lastShakeTimeRef.current = now;
        if (nearCoin && !nearCoin.collected) {
          collectCoin(nearCoin.id);
        }
      }
    };

    window.addEventListener("devicemotion", handleDeviceMotion, true);

    (window as { __stopShakeDetection?: () => void }).__stopShakeDetection =
      () => {
        window.removeEventListener("devicemotion", handleDeviceMotion, true);
        shakeDetectionRef.current = false;
      };
  }, [nearCoin, collectCoin]);

  const endGame = useCallback(() => {
    setGameStarted(false);
    setShowOverlay(false);
    setIsXRActive(false);
    setGameState("finished");
    stopShakeDetection();
    onPhaseComplete(GamePhase.WEAPON_SHOP, coinsCollected);
  }, [onPhaseComplete, coinsCollected, stopShakeDetection]);

  // Game timer
  useEffect(() => {
    if (gameStarted && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && gameStarted) {
      endGame();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [gameStarted, timeRemaining, endGame]);

  // Shake detection
  useEffect(() => {
    if (gameStarted && gameState === "playing") {
      startShakeDetection();
    } else {
      stopShakeDetection();
    }

    return () => {
      stopShakeDetection();
    };
  }, [gameStarted, gameState, startShakeDetection, stopShakeDetection]);

  const startGame = async () => {
    setGameStarted(true);
    setShowOverlay(true);

    if (hasARSupport) {
      setGameState("scanning");
      setOverlayMessage("Move your phone slowly in a circle to map the room.");
      try {
        await initializeXR();
      } catch {
        console.error("Failed to start AR session");
        // Fallback to non-AR mode
        setOverlayMessage("AR not available. Using standard mode.");
        setTimeout(() => {
          startStandardMode();
        }, 2000);
      }
    } else {
      startStandardMode();
    }
  };

  const startStandardMode = () => {
    setOverlayMessage("Coins will appear on your screen. Shake to collect!");
    setGameState("playing");
    generateCoins();
    startCoinSpawning();
  };

  const initializeXR = async () => {
    if (!navigator.xr) {
      throw new Error("WebXR not supported");
    }

    const isSupported = await navigator.xr.isSessionSupported("immersive-ar");
    if (!isSupported) {
      throw new Error("AR not supported");
    }

    try {
      await navigator.xr.requestSession("immersive-ar", {
        requiredFeatures: ["hit-test"],
        optionalFeatures: ["dom-overlay"],
        domOverlay: { root: document.getElementById("xr-overlay") },
      });

      setIsXRActive(true);
      setupXRSession();
    } catch {
      throw new Error("Failed to start AR session");
    }
  };

  const setupXRSession = () => {
    setOverlayMessage("Tap to place coins in your space.");

    // Simulate finding a surface and placing coins
    setTimeout(() => {
      setOverlayMessage(
        "Collect the floating coins! Move close to change their color.",
      );
      setGameState("playing");
      generateCoins();
      simulateCoinProximity();
    }, 3000);
  };

  const generateCoins = () => {
    const newCoins: Coin[] = [];
    for (let i = 0; i < COIN_COUNT; i++) {
      const angle = (Math.PI * 2 * i) / COIN_COUNT;
      const distance =
        COIN_DISTANCE_MIN +
        Math.random() * (COIN_DISTANCE_MAX - COIN_DISTANCE_MIN);
      const height = -0.15 + Math.random() * 0.3;

      newCoins.push({
        id: `coin-${i}`,
        x: Math.sin(angle) * distance,
        y: height,
        z: Math.cos(angle) * distance,
        collected: false,
        isNear: false,
      });
    }
    setCoins(newCoins);
  };

  const simulateCoinProximity = () => {
    // Simulate user moving around and getting close to coins
    const proximityInterval = setInterval(() => {
      if (gameState !== "playing" || timeRemaining <= 0) {
        clearInterval(proximityInterval);
        return;
      }

      setCoins((prevCoins) => {
        const updatedCoins = prevCoins.map((coin) => {
          if (coin.collected) return coin;

          // Simulate random proximity
          const isNear = Math.random() < 0.1; // 10% chance per interval
          return { ...coin, isNear };
        });

        const nearCoins = updatedCoins.filter((c) => c.isNear && !c.collected);
        if (nearCoins.length > 0) {
          setNearCoin(nearCoins[0]);
        } else {
          setNearCoin(null);
        }

        return updatedCoins;
      });
    }, 1000);
  };

  const startCoinSpawning = () => {
    // For non-AR mode, spawn coins on screen
    const spawnInterval = setInterval(() => {
      if (
        gameState !== "playing" ||
        timeRemaining <= 0 ||
        coinsCollected >= 20
      ) {
        clearInterval(spawnInterval);
        return;
      }

      // Simulate coin appearing on screen
      const newCoin: Coin = {
        id: `screen-coin-${Date.now()}`,
        x: Math.random() * 80 - 40, // -40 to 40%
        y: Math.random() * 60 - 30, // -30 to 30%
        z: 0,
        collected: false,
        isNear: true, // All screen coins are immediately collectible
      };

      setCoins((prev) => [...prev, newCoin]);

      // Remove coin after 3 seconds if not collected
      setTimeout(() => {
        setCoins((prev) => prev.filter((c) => c.id !== newCoin.id));
      }, 3000);
    }, 2000);
  };

  const handleExit = () => {
    if (isXRActive) {
      // End XR session - note: getSession is not part of standard WebXR API
      // In a real implementation, we would store the session reference
      setIsXRActive(false);
    }
    endGame();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleARClick = () => {
    if (gameState === "scanning") {
      setOverlayMessage(
        "Collect the floating coins! Move close to change their color.",
      );
      setGameState("playing");
      generateCoins();
      simulateCoinProximity();
    }
  };

  return (
    <div className="relative min-h-[100svh] bg-black">
      {/* Game UI Overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="flex justify-between items-start">
          <Card className="px-4 py-2">
            <div className="text-yellow-500 font-bold">
              🪙 Coins: {coinsCollected}
            </div>
          </Card>
          <Card className="px-4 py-2">
            <div className="font-bold">⏰ {formatTime(timeRemaining)}</div>
          </Card>
        </div>
      </div>

      {/* AR Scene Container */}
      <div className="w-full h-full relative" onClick={handleARClick}>
        {!gameStarted && (
          <div className="min-h-[100svh] bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-6 text-center">
              <h2 className="retro-title text-2xl mb-4">
                Ready to Hunt Coins?
              </h2>
              <p className="mb-6">
                {hasARSupport
                  ? "Enter AR mode to find coins in your real space!"
                  : "Get ready to collect coins on your screen!"}
              </p>
              <Button onClick={startGame} className="retro-button w-full">
                Start Game
              </Button>
            </Card>
          </div>
        )}

        {/* Coins Display */}
        {gameStarted && (
          <div className="absolute inset-0">
            {coins
              .filter((coin) => !coin.collected)
              .map((coin) => (
                <div
                  key={coin.id}
                  className={`absolute w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all duration-300 ${
                    coin.isNear
                      ? "bg-green-500 scale-125 shadow-lg shadow-green-500/50"
                      : "bg-yellow-500"
                  }`}
                  style={{
                    left: hasARSupport ? "50%" : `${50 + coin.x}%`,
                    top: hasARSupport ? "50%" : `${50 + coin.y}%`,
                    transform: `translate(-50%, -50%) ${hasARSupport ? "" : "scale(0.8)"}`,
                  }}
                >
                  🪙
                  {coin.isNear && (
                    <div className="absolute -bottom-8 text-xs text-white bg-black/70 px-2 py-1 rounded whitespace-nowrap">
                      Shake to collect!
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* XR Overlay */}
      {showOverlay && (
        <div
          id="xr-overlay"
          className="absolute inset-0 z-20 pointer-events-none"
        >
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-auto">
            <Card className="p-4 max-w-sm text-center">
              <p className="text-lg">{overlayMessage}</p>
              {isXRActive && (
                <Button onClick={handleExit} variant="outline" className="mt-4">
                  Exit AR
                </Button>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {gameStarted && (
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
          <Progress value={((60 - timeRemaining) / 60) * 100} className="h-2" />
        </div>
      )}
    </div>
  );
}
