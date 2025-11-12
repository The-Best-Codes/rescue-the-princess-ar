import { useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { GamePhase } from "../../types/game";
import { ARHuntGame } from "./ARHuntGame";

interface ARHuntPhaseProps {
  onPhaseComplete: (nextPhase: GamePhase, coinsEarned?: number) => void;
  hasARSupport: boolean;
}

export function ARHuntPhase({
  onPhaseComplete,
  hasARSupport,
}: ARHuntPhaseProps) {
  const [showInstructions, setShowInstructions] = useState(true);

  const handleStart = () => {
    setShowInstructions(false);
  };

  if (!showInstructions) {
    return (
      <ARHuntGame
        onPhaseComplete={onPhaseComplete}
        hasARSupport={hasARSupport}
      />
    );
  }

  return (
    <div className="min-h-[100svh] bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 text-center">
        <h1 className="retro-title text-4xl mb-6">AR Coin Hunt</h1>

        <div className="space-y-6 mb-8">
          {hasARSupport ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">AR Mode Instructions</h2>
              <div className="text-left space-y-3">
                <p className="flex items-start">
                  <span className="text-2xl mr-3">🎯</span>
                  Follow the instructions to place coins in your real space
                </p>
                <p className="flex items-start">
                  <span className="text-2xl mr-3">📱</span>
                  Move your phone in a circle to scan the room
                </p>
                <p className="flex items-start">
                  <span className="text-2xl mr-3">👆</span>
                  Tap the screen when the green reticle appears to place coins
                </p>
                <p className="flex items-start">
                  <span className="text-2xl mr-3">✨</span>
                  When you get close to a coin, it will glow brightly
                </p>
                <p className="flex items-start">
                  <span className="text-2xl mr-3">🔊</span>
                  Shake your phone to collect glowing coins
                </p>
                <p className="flex items-start">
                  <span className="text-2xl mr-3">⏰</span>
                  Collect as many as you can in 60 seconds!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">
                Standard Mode Instructions
              </h2>
              <div className="text-left space-y-3">
                <p className="flex items-start">
                  <span className="text-2xl mr-3">🪙</span>
                  Coins will appear on your screen over the next 60 seconds
                </p>
                <p className="flex items-start">
                  <span className="text-2xl mr-3">📱</span>
                  Shake your phone to collect them!
                </p>
                <p className="flex items-start">
                  <span className="text-2xl mr-3">🎯</span>
                  You can collect up to 20 coins total
                </p>
                <p className="flex items-start">
                  <span className="text-2xl mr-3">⏰</span>
                  Each coin stays for 3 seconds before disappearing
                </p>
              </div>
            </div>
          )}
        </div>

        <Button
          onClick={handleStart}
          className="retro-button text-lg px-8 py-4"
        >
          Start AR Hunt
        </Button>
      </Card>
    </div>
  );
}
