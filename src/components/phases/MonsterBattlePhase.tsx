import { useState } from "react";
import { GamePhase } from "../../types/game";
import { ARDragonBattle } from "../ar/ARDragonBattle";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Sword, Shield, Crown } from "lucide-react";

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
      <div className="min-h-[100svh] bg-background flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-6">
          <div className="text-center space-y-2">
            <h1 className="retro-title text-4xl">DRAGON BATTLE</h1>
            <p className="retro-tagline">Face the ancient dragon!</p>
          </div>

          <Card className="retro-card">
            <CardContent className="p-6 space-y-4">
              <div className="text-center space-y-4">
                <div className="text-lg">
                  <p className="font-bold mb-4">
                    🐉 A fearsome dragon blocks your path to the princess!
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="font-semibold mb-2">Your Equipment:</p>
                    <div className="flex justify-center space-x-6 text-sm">
                      <div className="flex items-center space-x-1">
                        <Shield className="w-4 h-4" />
                        <span>{selectedWeapons.shield || "None"}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Sword className="w-4 h-4" />
                        <span>{selectedWeapons.sword || "None"}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Crown className="w-4 h-4" />
                        <span>{selectedWeapons.helmet || "None"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-left text-sm">
                    <p>• Find a safe space and place the dragon in AR</p>
                    <p>• Tap rapidly on the dragon to attack</p>
                    <p>• Watch damage numbers appear where you tap</p>
                    <p>• Defeat the dragon to rescue the princess!</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  onClick={() => setShowInstructions(false)}
                  className="retro-button"
                >
                  Begin Battle
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
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
