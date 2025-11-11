import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

interface InstructionsScreenProps {
  title: string;
  instructions: string[];
  onStart: () => void;
  isLoading?: boolean;
}

export function InstructionsScreen({
  title,
  instructions,
  onStart,
  isLoading = false,
}: InstructionsScreenProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        <h1 className="retro-title text-center">{title}</h1>

        <Card className="retro-card p-0">
          <CardContent className="p-6 space-y-6">
            {/* Instructions List */}
            <div className="space-y-3">
              {instructions.map((instruction, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {instruction}
                  </p>
                </div>
              ))}
            </div>

            {/* Start Button */}
            <div className="flex justify-center pt-2">
              <Button
                onClick={onStart}
                className="retro-button"
                disabled={isLoading}
              >
                {isLoading ? "Preparing..." : "Let's Go!"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
