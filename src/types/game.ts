export const GamePhase = {
  SPLASH: "splash",
  HAND_TRACKING: "hand-tracking",
  FACIAL_EXPRESSION: "facial-expression",
  AR_HUNT: "ar-hunt",
  WEAPON_SHOP: "weapon-shop",
  MONSTER_BATTLE: "monster-battle",
  VICTORY: "victory",
} as const;

export type GamePhase = (typeof GamePhase)[keyof typeof GamePhase];

export interface DeviceCapabilities {
  camera: boolean;
  ar: boolean;
  deviceMotion: boolean;
  handTracking: boolean;
  faceDetection: boolean;
}

export interface Weapon {
  id: string;
  name: string;
  cost: number;
  damageBonus: number;
  description: string;
  icon: string;
}

export interface WeaponCategory {
  name: string;
  weapons: Weapon[];
}

export interface GameState {
  phase: GamePhase;
  totalCoins: number;
  coinsPerPhase: {
    handTracking: number;
    facialExpression: number;
    arHunt: number;
  };
  capabilities: DeviceCapabilities;
  weapons: {
    shield: string | null;
    sword: string | null;
    helmet: string | null;
  };
}

export interface PermissionState {
  camera: "granted" | "denied" | "prompt" | "checking";
  deviceMotion: "granted" | "denied" | "prompt" | "checking";
}
