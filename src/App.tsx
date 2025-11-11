import { GamePhase } from "./types/game";
import { useGameManager } from "./hooks/useGameManager";
import { SplashScreen } from "./components/phases/SplashScreen";
import { HandTrackingPhase } from "./components/phases/HandTrackingPhase";
import { FacialExpressionPhase } from "./components/phases/FacialExpressionPhase";

function App() {
  const { gameState, setPhase, addCoins } = useGameManager();

  const handlePhaseComplete = (
    nextPhase: GamePhase,
    coinsEarned?: number,
    phaseType?: "handTracking" | "facialExpression" | "arHunt",
  ) => {
    if (coinsEarned && phaseType) {
      addCoins(coinsEarned, phaseType);
    }
    setPhase(nextPhase);
  };

  const renderCurrentPhase = () => {
    switch (gameState.phase) {
      case GamePhase.SPLASH:
        return <SplashScreen onPhaseComplete={handlePhaseComplete} />;

      case GamePhase.HAND_TRACKING:
        return (
          <HandTrackingPhase
            onPhaseComplete={(nextPhase, coins) =>
              handlePhaseComplete(nextPhase, coins, "handTracking")
            }
          />
        );

      case GamePhase.FACIAL_EXPRESSION:
        return (
          <FacialExpressionPhase
            onPhaseComplete={(nextPhase, coins) =>
              handlePhaseComplete(nextPhase, coins, "facialExpression")
            }
          />
        );

      default:
        return (
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
              <h1 className="retro-title text-4xl mb-4">
                Phase Not Implemented
              </h1>
              <p className="text-lg text-muted-foreground">
                This phase is under construction.
              </p>
            </div>
          </div>
        );
    }
  };

  return <div className="app">{renderCurrentPhase()}</div>;
}

export default App;
