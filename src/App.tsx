import { GamePhase } from "./types/game";
import { useGameManager } from "./hooks/useGameManager";
import { SplashScreen } from "./components/phases/SplashScreen";
import { HandTrackingPhase } from "./components/phases/HandTrackingPhase";

function App() {
  const { gameState, setPhase, addCoins } = useGameManager();

  const handlePhaseComplete = (nextPhase: GamePhase, coinsEarned?: number) => {
    if (coinsEarned) {
      addCoins(coinsEarned, "handTracking");
    }
    setPhase(nextPhase);
  };

  const renderCurrentPhase = () => {
    switch (gameState.phase) {
      case GamePhase.SPLASH:
        return <SplashScreen onPhaseComplete={handlePhaseComplete} />;

      case GamePhase.HAND_TRACKING:
        return <HandTrackingPhase onPhaseComplete={handlePhaseComplete} />;

      // TODO: Implement other phases
      case GamePhase.FACIAL_EXPRESSION:
        return (
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="text-center space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold text-primary font-mono">
                FACIAL EXPRESSION PHASE
              </h1>
              <p className="text-xl text-muted-foreground font-semibold">
                Coming soon...
              </p>
            </div>
          </div>
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
