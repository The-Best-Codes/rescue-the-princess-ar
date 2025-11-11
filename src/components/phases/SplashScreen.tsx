import { useEffect } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
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
      <div className="max-w-4xl w-full space-y-8">
        {/* Title */}
        <div className="text-center space-y-4">
          <h1 className="retro-title">RESCUE THE PRINCESS</h1>
          <p className="retro-tagline">
            The classic game plot with an AR twist
          </p>
        </div>

        {/* Main Content Card */}
        <Card className="retro-card">
          <CardHeader>
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-primary">The Story</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                A monster has kidnapped the princess and hidden her away! You
                must collect coins through hand tracking, facial expressions,
                and AR exploration, then buy powerful weapons to defeat the
                monster and save her.
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {!hasChecked ? (
              /* Loading skeleton */
              <div className="space-y-6">
                <div className="text-center">
                  <Skeleton className="h-8 w-48 mx-auto mb-4" />
                  <Skeleton className="h-4 w-96 mx-auto" />
                </div>

                {/* Skeleton Permission Status */}
                <div className="grid gap-4 md:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-3 p-4 rounded-lg bg-muted/50"
                    >
                      <Skeleton className="w-6 h-6 rounded" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <Skeleton className="w-5 h-5 rounded-full" />
                    </div>
                  ))}
                </div>

                <Skeleton className="h-10 w-32 mx-auto" />
              </div>
            ) : (
              /* Real content */
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-primary mb-4">
                    Game Requirements
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    This game requires camera access for hand tracking and
                    facial expression detection.
                  </p>
                </div>

                {/* Permission Status */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center space-x-3 p-4 rounded-lg bg-muted/50">
                    <Camera className="w-6 h-6" />
                    <div>
                      <p className="font-semibold">Camera Access</p>
                      <p className="text-sm text-muted-foreground">
                        {permissions.camera === "granted"
                          ? "Granted"
                          : "Required"}
                      </p>
                    </div>
                    {permissions.camera === "granted" ? (
                      <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-yellow-600 ml-auto" />
                    )}
                  </div>

                  <div className="flex items-center space-x-3 p-4 rounded-lg bg-muted/50">
                    <Smartphone className="w-6 h-6" />
                    <div>
                      <p className="font-semibold">AR Support</p>
                      <p className="text-sm text-muted-foreground">
                        {capabilities.ar ? "Supported" : "Fallback Mode"}
                      </p>
                    </div>
                    {capabilities.ar ? (
                      <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-yellow-600 ml-auto" />
                    )}
                  </div>

                  <div className="flex items-center space-x-3 p-4 rounded-lg bg-muted/50">
                    <Gamepad2 className="w-6 h-6" />
                    <div>
                      <p className="font-semibold">Device Motion</p>
                      <p className="text-sm text-muted-foreground">
                        {capabilities.deviceMotion
                          ? "Supported"
                          : "Alternative Input"}
                      </p>
                    </div>
                    {capabilities.deviceMotion ? (
                      <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-yellow-600 ml-auto" />
                    )}
                  </div>
                </div>

                {/* Warnings */}
                {getCapabilityWarnings().map((warning, index) => (
                  <Alert
                    key={index}
                    className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-900/20"
                  >
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                      {warning}
                    </AlertDescription>
                  </Alert>
                ))}

                {/* Action Buttons */}
                <div className="flex justify-center">
                  {permissions.camera === "granted" ? (
                    <Button onClick={handleStartGame} className="retro-button">
                      Start Adventure!
                    </Button>
                  ) : permissions.camera === "denied" ? (
                    <div className="text-center space-y-4">
                      <Alert className="border-red-500/50 bg-red-50 dark:bg-red-900/20">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800 dark:text-red-200">
                          Camera access is required to play this game. Please
                          refresh and grant camera permissions.
                        </AlertDescription>
                      </Alert>
                      <Button
                        onClick={() => window.location.reload()}
                        variant="outline"
                        className="retro-button"
                      >
                        Refresh Page
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={handleRequestPermissions}
                      className="retro-button"
                      disabled={permissions.camera === "checking"}
                    >
                      {permissions.camera === "checking"
                        ? "Requesting Access..."
                        : "Grant Camera Access"}
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
