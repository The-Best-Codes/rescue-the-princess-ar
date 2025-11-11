import { useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import { Skeleton } from "../ui/skeleton";
import { usePermissions } from "../../hooks/usePermissions";
import { GamePhase } from "../../types/game";
import {
  AlertTriangle,
  CheckCircle,
  Camera,
  Smartphone,
  Gamepad2,
} from "lucide-react";

interface SplashScreenProps {
  onPhaseComplete: (nextPhase: GamePhase, coinsEarned?: number) => void;
}

export function SplashScreen({ onPhaseComplete }: SplashScreenProps) {
  const {
    permissions,
    capabilities,
    hasChecked,
    requestCameraPermission,
    checkAllPermissions,
  } = usePermissions();

  useEffect(() => {
    // Check permissions immediately on mount
    checkAllPermissions();
  }, [checkAllPermissions]);

  const handleRequestPermissions = async () => {
    await requestCameraPermission();
  };

  const handleStartGame = () => {
    onPhaseComplete(GamePhase.HAND_TRACKING);
  };

  const getCapabilityWarnings = () => {
    const warnings = [];

    if (!capabilities.ar) {
      warnings.push(
        "Your device doesn't support AR. The game will still function, but it won't be as cool!",
      );
    }

    if (!capabilities.deviceMotion) {
      warnings.push(
        "Your device doesn't support device motion. Shake detection will use alternative input.",
      );
    }

    return warnings;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="retro-title">RESCUE</h1>
          <h1 className="retro-title">THE PRINCESS</h1>
          <p className="retro-tagline">Collect coins. Save the day.</p>
        </div>

        {/* Main Content Card */}
        <Card className="retro-card">
          <CardContent className="p-6 space-y-6">
            {/* Story */}
            <div className="text-center space-y-2">
              <p className="text-base text-foreground leading-relaxed">
                A monster has kidnapped the princess! Collect coins by playing 3
                mini-games. Buy weapons to defeat the monster and save the
                princess.
              </p>
            </div>

            {!hasChecked ? (
              /* Loading skeleton */
              <div className="space-y-4">
                <div className="text-center">
                  <Skeleton className="h-8 w-48 mx-auto mb-4" />
                  <Skeleton className="h-4 w-96 mx-auto" />
                </div>

                {/* Skeleton Permission Status */}
                <div className="grid gap-3 grid-cols-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50"
                    >
                      <Skeleton className="w-5 h-5 rounded" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <Skeleton className="w-4 h-4 rounded-full" />
                    </div>
                  ))}
                </div>

                <Skeleton className="h-10 w-32 mx-auto" />
              </div>
            ) : (
              /* Real content */
              <div className="space-y-4">
                {/* Permission Status - Simplified */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center space-x-2">
                      <Camera className="w-5 h-5 text-primary" />
                      <span className="font-semibold text-sm">Camera</span>
                    </div>
                    {permissions.camera === "granted" ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="w-5 h-5 text-primary" />
                      <span className="font-semibold text-sm">AR Support</span>
                    </div>
                    {capabilities.ar ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center space-x-2">
                      <Gamepad2 className="w-5 h-5 text-primary" />
                      <span className="font-semibold text-sm">Motion</span>
                    </div>
                    {capabilities.deviceMotion ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                </div>

                {/* Warnings - Condensed */}
                {getCapabilityWarnings().map((warning, index) => (
                  <Alert
                    key={index}
                    className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-900/20"
                  >
                    <AlertTriangle className="h-3 w-3 text-yellow-600 mb-1" />
                    <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                      {warning}
                    </AlertDescription>
                  </Alert>
                ))}

                {/* Action Buttons */}
                <div className="flex justify-center pt-2">
                  {permissions.camera === "granted" ? (
                    <Button onClick={handleStartGame} className="retro-button">
                      Start Adventure
                    </Button>
                  ) : permissions.camera === "denied" ? (
                    <div className="w-full text-center space-y-3">
                      <Alert className="border-red-500/50 bg-red-50 dark:bg-red-900/20">
                        <AlertTriangle className="h-3 w-3 text-red-600 mt-0.5" />
                        <AlertDescription className="text-red-800 dark:text-red-200">
                          Camera access required. Please refresh and grant
                          permission.
                        </AlertDescription>
                      </Alert>
                      <Button
                        onClick={() => window.location.reload()}
                        className="retro-button w-full"
                      >
                        Refresh
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={handleRequestPermissions}
                      className="retro-button"
                      disabled={permissions.camera === "checking"}
                    >
                      {permissions.camera === "checking"
                        ? "Requesting..."
                        : "Grant Access"}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
