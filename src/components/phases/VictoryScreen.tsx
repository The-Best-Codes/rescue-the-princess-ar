import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Trophy, Sparkles, Heart } from "lucide-react";

interface VictoryScreenProps {
  totalCoins: number;
}

export function VictoryScreen({ totalCoins }: VictoryScreenProps) {
  const handlePlayAgain = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-[100svh] bg-background flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-2xl w-full space-y-6">
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <Trophy className="w-20 h-20 text-yellow-500" />
          </div>
          <h1 className="retro-title text-4xl">VICTORY!</h1>
          <p className="retro-tagline">The dragon has been defeated</p>
        </div>

        {/* Main Content Card */}
        <Card className="retro-card">
          <CardContent className="p-6 space-y-6">
            {/* Story Resolution */}
            <div className="text-center space-y-3">
              <div className="flex justify-center mb-3">
                <Heart className="w-12 h-12 text-pink-500" />
              </div>
              <p className="text-base text-foreground leading-relaxed">
                The princess is safe and the kingdom celebrates your heroic
                deeds!
              </p>
            </div>

            {/* Stats */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  <span className="font-semibold">Total Coins</span>
                </div>
                <span className="text-2xl font-bold text-primary">
                  {totalCoins}
                </span>
              </div>
            </div>

            {/* Achievement Badges */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-card border-2 border-primary rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">🎯</div>
                <div className="text-xs font-semibold">Champion</div>
              </div>
              <div className="bg-card border-2 border-primary rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">⚔️</div>
                <div className="text-xs font-semibold">Dragon Slayer</div>
              </div>
              <div className="bg-card border-2 border-primary rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">👑</div>
                <div className="text-xs font-semibold">Hero</div>
              </div>
            </div>

            {/* Final Message */}
            <div className="text-center space-y-2 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground italic">
                "Your bravery will be remembered throughout the kingdom!"
              </p>
              <p className="text-sm text-muted-foreground">- The Princess</p>
            </div>

            {/* Action Button */}
            <div className="flex justify-center pt-2">
              <Button
                onClick={handlePlayAgain}
                className="retro-button"
                size="lg"
              >
                Play Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
