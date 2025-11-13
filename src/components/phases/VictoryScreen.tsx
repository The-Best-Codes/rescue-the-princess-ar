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
        <div className="text-center space-y-4 animate-in fade-in duration-700">
          <div className="flex justify-center">
            <Trophy className="w-24 h-24 text-yellow-500 animate-bounce" />
          </div>
          <h1 className="retro-title text-5xl">VICTORY!</h1>
          <p className="retro-tagline text-xl">You defeated the dragon!</p>
        </div>

        {/* Main Content Card */}
        <Card className="retro-card animate-in slide-in-from-bottom duration-700">
          <CardContent className="p-8 space-y-6">
            {/* Story Resolution */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Heart className="w-16 h-16 text-pink-500" />
              </div>
              <p className="text-lg text-foreground leading-relaxed">
                The dragon has been vanquished! The princess is safe and the
                kingdom celebrates your heroic deeds!
              </p>
            </div>

            {/* Stats */}
            <div className="space-y-3 bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  <span className="font-semibold">Total Coins Collected</span>
                </div>
                <span className="text-2xl font-bold text-primary">
                  {totalCoins}
                </span>
              </div>
            </div>

            {/* Final Message */}
            <div className="text-center space-y-3 pt-4 border-t border-border">
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
      </div>
    </div>
  );
}
