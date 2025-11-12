import type { WeaponCategory } from "../types/game";

export const weaponCategories: WeaponCategory[] = [
  {
    name: "SHIELDS",
    weapons: [
      {
        id: "wooden-shield",
        name: "Wooden Shield",
        cost: 0,
        damageBonus: 0,
        description: "Basic protection for beginners",
        icon: "🛡️",
      },
      {
        id: "iron-shield",
        name: "Iron Shield",
        cost: 15,
        damageBonus: 5,
        description: "Sturdy metal protection",
        icon: "⚔️",
      },
      {
        id: "gold-shield",
        name: "Gold Shield",
        cost: 25,
        damageBonus: 10,
        description: "Gleaming golden defense",
        icon: "🏆",
      },
    ],
  },
  {
    name: "SWORDS",
    weapons: [
      {
        id: "rusty-sword",
        name: "Rusty Sword",
        cost: 0,
        damageBonus: 0,
        description: "A dull blade, but free!",
        icon: "🗡️",
      },
      {
        id: "iron-sword",
        name: "Iron Sword",
        cost: 20,
        damageBonus: 5,
        description: "Sharp and reliable steel",
        icon: "⚔️",
      },
      {
        id: "diamond-sword",
        name: "Diamond Sword",
        cost: 35,
        damageBonus: 10,
        description: "Razor-sharp crystal blade",
        icon: "💎",
      },
    ],
  },
  {
    name: "HELMETS",
    weapons: [
      {
        id: "cloth-cap",
        name: "Cloth Cap",
        cost: 0,
        damageBonus: 0,
        description: "Better than nothing...",
        icon: "🎩",
      },
      {
        id: "steel-helmet",
        name: "Steel Helmet",
        cost: 18,
        damageBonus: 5,
        description: "Solid metal protection",
        icon: "⛑️",
      },
      {
        id: "crystal-helm",
        name: "Crystal Helm",
        cost: 30,
        damageBonus: 10,
        description: "Magical crystal headgear",
        icon: "👑",
      },
    ],
  },
];
