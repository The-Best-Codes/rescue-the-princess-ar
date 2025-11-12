import { useState } from "react";
import { InstructionsScreen } from "./InstructionsScreen";
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

  const instructions = hasARSupport
    ? [
        "Move your phone in a circle to scan the room and find surfaces",
        "Point your phone at the floor near you until the green reticle appears",
        "Tap the screen to place coins on the detected surface",
        "When you get close to a coin, it will glow brightly",
        "Shake your phone to collect glowing coins",
        "Collect as many coins as you can in 60 seconds!",
      ]
    : [
        "Coins will appear on your screen over the next 60 seconds",
        "Shake your phone to collect them!",
        "You can collect up to 20 coins total",
        "Each coin stays for 3 seconds before disappearing",
      ];

  return (
    <InstructionsScreen
      title="AR COIN HUNT"
      instructions={instructions}
      onStart={handleStart}
      isLoading={false}
    />
  );
}
