import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";

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
      <div className="max-w-2xl w-full">
        <Card className="retro-card">
          <CardHeader>
            <h1 className="retro-title text-center">{title}</h1>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Instructions List */}
            <div className="space-y-4">
              {instructions.map((instruction, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <p className="text-lg text-foreground leading-relaxed">
                    {instruction}
                  </p>
                </div>
              ))}
            </div>

            {/* Start Button */}
            <div className="flex justify-center">
              <Button
                onClick={onStart}
                className="retro-button"
                disabled={isLoading}
                size="lg"
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
