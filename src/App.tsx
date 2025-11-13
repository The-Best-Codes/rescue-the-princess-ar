import { GamePhase } from "./types/game";
import { useGameManager } from "./hooks/useGameManager";
import { SplashScreen } from "./components/phases/SplashScreen";
import { HandTrackingPhase } from "./components/phases/HandTrackingPhase";
import { FacialExpressionPhase } from "./components/phases/FacialExpressionPhase";
import { ARHuntPhase } from "./components/phases/ARHuntPhase";
import { WeaponShopPhase } from "./components/phases/WeaponShopPhase";
import { MonsterBattlePhase } from "./components/phases/MonsterBattlePhase";

function App() {
  const {
    gameState,
    setPhase,
    addCoins,
    updateCapabilities,
    selectWeapon,
    spendCoins,
  } = useGameManager();

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
        return (
          <SplashScreen
            onPhaseComplete={handlePhaseComplete}
            updateCapabilities={updateCapabilities}
          />
        );

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

      case GamePhase.AR_HUNT:
        return (
          <ARHuntPhase
            onPhaseComplete={(nextPhase, coins) =>
              handlePhaseComplete(nextPhase, coins, "arHunt")
            }
            hasARSupport={gameState.capabilities.ar}
          />
        );

      case GamePhase.WEAPON_SHOP:
        return (
          <WeaponShopPhase
            totalCoins={gameState.totalCoins}
            onPhaseComplete={handlePhaseComplete}
            onWeaponSelect={selectWeapon}
            onSpendCoins={spendCoins}
            selectedWeapons={gameState.weapons}
          />
        );

      case GamePhase.MONSTER_BATTLE:
        return (
          <MonsterBattlePhase
            onPhaseComplete={handlePhaseComplete}
            hasARSupport={gameState.capabilities.ar}
            selectedWeapons={gameState.weapons}
          />
        );

      default:
        return (
          <div className="min-h-[100svh] bg-background flex items-center justify-center">
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
