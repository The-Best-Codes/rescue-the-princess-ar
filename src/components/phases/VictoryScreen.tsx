import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";

interface VictoryScreenProps {
  totalCoins: number;
}

// Retro pixel-art style princess SVG
function PrincessIcon() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      {/* Crown */}
      <rect x="8" y="4" width="2" height="2" fill="#FFD700" />
      <rect x="11" y="3" width="2" height="2" fill="#FFD700" />
      <rect x="14" y="4" width="2" height="2" fill="#FFD700" />
      <rect x="7" y="6" width="10" height="2" fill="#FFD700" />

      {/* Face */}
      <rect x="9" y="8" width="6" height="6" fill="#FFE4C4" />

      {/* Hair */}
      <rect x="8" y="8" width="1" height="6" fill="#DEB887" />
      <rect x="15" y="8" width="1" height="6" fill="#DEB887" />
      <rect x="9" y="7" width="6" height="1" fill="#DEB887" />

      {/* Eyes */}
      <rect x="10" y="10" width="1" height="1" fill="#000000" />
      <rect x="13" y="10" width="1" height="1" fill="#000000" />

      {/* Smile */}
      <rect x="11" y="12" width="2" height="1" fill="#FF69B4" />

      {/* Dress */}
      <rect x="9" y="14" width="6" height="2" fill="#FF69B4" />
      <rect x="8" y="16" width="8" height="4" fill="#FF69B4" />

      {/* Dress details */}
      <rect x="10" y="17" width="1" height="1" fill="#FFB6C1" />
      <rect x="13" y="17" width="1" height="1" fill="#FFB6C1" />
      <rect x="11" y="19" width="2" height="1" fill="#FFB6C1" />
    </svg>
  );
}

export function VictoryScreen({ totalCoins }: VictoryScreenProps) {
  const handlePlayAgain = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-[100svh] bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        <h1 className="retro-title text-center">VICTORY!</h1>

        <Card className="retro-card">
          <CardContent className="p-6 space-y-6">
            {/* Princess Icon */}
            <div className="flex justify-center">
              <PrincessIcon />
            </div>

            {/* Message */}
            <div className="text-center space-y-3">
              <p className="text-lg font-semibold text-foreground">
                The Princess Has Been Rescued!
              </p>
              <p className="text-sm text-muted-foreground">
                You collected {totalCoins} coins and defeated the dragon!
              </p>
            </div>

            {/* Quote */}
            <div className="text-center pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground italic">
                "Thank you, brave hero!"
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                - The Princess
              </p>
            </div>

            {/* Action Button */}
            <div className="flex justify-center pt-2">
              <Button onClick={handlePlayAgain} className="retro-button">
                Play Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
