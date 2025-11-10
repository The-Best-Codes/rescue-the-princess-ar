import { useState } from "react";
import { GamePhase, type GameState } from "../types/game";

export function useGameManager() {
  const [gameState, setGameState] = useState<GameState>({
    phase: GamePhase.SPLASH,
    totalCoins: 0,
    coinsPerPhase: {
      handTracking: 0,
      facialExpression: 0,
      arHunt: 0,
    },
    capabilities: {
      camera: false,
      ar: false,
      deviceMotion: false,
      handTracking: false,
      faceDetection: false,
    },
    weapons: {
      shield: null,
      sword: null,
      helmet: null,
    },
  });

  const setPhase = (phase: GamePhase) => {
    setGameState((prev) => ({ ...prev, phase }));
  };

  const addCoins = (
    amount: number,
    phase?: "handTracking" | "facialExpression" | "arHunt",
  ) => {
    setGameState((prev) => {
      const newState = { ...prev };
      newState.totalCoins += amount;

      if (phase) {
        newState.coinsPerPhase[phase] += amount;
      }

      return newState;
    });
  };

  const updateCapabilities = (
    capabilities: Partial<GameState["capabilities"]>,
  ) => {
    setGameState((prev) => ({
      ...prev,
      capabilities: { ...prev.capabilities, ...capabilities },
    }));
  };

  const selectWeapon = (
    category: "shield" | "sword" | "helmet",
    weapon: string,
  ) => {
    setGameState((prev) => ({
      ...prev,
      weapons: { ...prev.weapons, [category]: weapon },
    }));
  };

  const spendCoins = (amount: number) => {
    setGameState((prev) => ({
      ...prev,
      totalCoins: Math.max(0, prev.totalCoins - amount),
    }));
  };

  const resetGame = () => {
    setGameState({
      phase: GamePhase.SPLASH,
      totalCoins: 0,
      coinsPerPhase: {
        handTracking: 0,
        facialExpression: 0,
        arHunt: 0,
      },
      capabilities: {
        camera: false,
        ar: false,
        deviceMotion: false,
        handTracking: false,
        faceDetection: false,
      },
      weapons: {
        shield: null,
        sword: null,
        helmet: null,
      },
    });
  };

  return {
    gameState,
    setPhase,
    addCoins,
    updateCapabilities,
    selectWeapon,
    spendCoins,
    resetGame,
  };
}
