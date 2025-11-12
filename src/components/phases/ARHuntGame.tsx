import { GamePhase } from "../../types/game";
import { ARScene } from "../ar/ARScene";

interface ARHuntGameProps {
  onPhaseComplete: (nextPhase: GamePhase, coinsEarned?: number) => void;
  hasARSupport: boolean;
}

export function ARHuntGame({ onPhaseComplete, hasARSupport }: ARHuntGameProps) {
  return (
    <ARScene onPhaseComplete={onPhaseComplete} hasARSupport={hasARSupport} />
  );
}
