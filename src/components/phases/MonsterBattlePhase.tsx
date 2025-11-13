import { useState } from "react";
import { GamePhase } from "../../types/game";
import { ARDragonBattle } from "../ar/ARDragonBattle";
import { InstructionsScreen } from "./InstructionsScreen";

interface MonsterBattlePhaseProps {
  onPhaseComplete: (nextPhase: GamePhase) => void;
  hasARSupport: boolean;
  selectedWeapons: {
    shield: string | null;
    sword: string | null;
    helmet: string | null;
  };
}

export function MonsterBattlePhase({
  onPhaseComplete,
  hasARSupport,
  selectedWeapons,
}: MonsterBattlePhaseProps) {
  const [showInstructions, setShowInstructions] = useState(true);

  if (showInstructions) {
    return (
      <InstructionsScreen
        title="DRAGON BATTLE"
        instructions={[
          "A fearsome dragon blocks your path to the princess!",
          "Find a safe space and place the dragon in AR",
          "Tap the dragon to attack it with your weapons",
          "Watch damage numbers appear with each attack",
          "Defeat the dragon to rescue the princess!",
        ]}
        onStart={() => setShowInstructions(false)}
      />
    );
  }

  return (
    <ARDragonBattle
      onPhaseComplete={onPhaseComplete}
      hasARSupport={hasARSupport}
      selectedWeapons={selectedWeapons}
    />
  );
}
