import { useState } from "react";
import { GamePhase, type Weapon } from "../../types/game";
import { weaponCategories } from "../../data/weapons";
import { WeaponCard } from "../WeaponCard";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Coins } from "lucide-react";
import { cn } from "../../lib/utils";

interface WeaponShopPhaseProps {
  totalCoins: number;
  onPhaseComplete: (nextPhase: GamePhase) => void;
  onWeaponSelect: (
    category: "shield" | "sword" | "helmet",
    weaponId: string,
  ) => void;
  onSpendCoins: (amount: number) => void;
  selectedWeapons: {
    shield: string | null;
    sword: string | null;
    helmet: string | null;
  };
}

export function WeaponShopPhase({
  totalCoins,
  onPhaseComplete,
  onWeaponSelect,
  onSpendCoins,
  selectedWeapons,
}: WeaponShopPhaseProps) {
  const [showInstructions, setShowInstructions] = useState(true);

  // Calculate total cost of selected weapons
  const calculateTotalCost = () => {
    let total = 0;

    weaponCategories.forEach((category) => {
      const categoryKey = category.name
        .toLowerCase()
        .slice(0, -1) as keyof typeof selectedWeapons; // "SHIELDS" -> "shield"
      const selectedWeaponId = selectedWeapons[categoryKey];

      if (selectedWeaponId) {
        const weapon = category.weapons.find((w) => w.id === selectedWeaponId);
        if (weapon) {
          total += weapon.cost;
        }
      }
    });

    return total;
  };

  // Check if player can afford a weapon
  const canAffordWeapon = (weapon: Weapon) => {
    const categoryKey = getCategoryKey(weapon.id);
    const currentWeaponId = selectedWeapons[categoryKey];

    // If this weapon is already selected, they can "afford" it (no additional cost)
    if (currentWeaponId === weapon.id) {
      return true;
    }

    // Calculate the cost if this weapon was selected instead of the current one
    const totalCostWithoutCurrentCategory =
      calculateTotalCost() - calculateSelectedWeaponCost(categoryKey);
    const newTotalCost = totalCostWithoutCurrentCategory + weapon.cost;

    return totalCoins >= newTotalCost;
  };

  // Helper to get category key from weapon id
  const getCategoryKey = (weaponId: string): keyof typeof selectedWeapons => {
    for (const category of weaponCategories) {
      if (category.weapons.some((w) => w.id === weaponId)) {
        return category.name
          .toLowerCase()
          .slice(0, -1) as keyof typeof selectedWeapons;
      }
    }
    return "shield"; // fallback
  };

  // Helper to find weapon by id
  const findWeaponById = (weaponId: string): Weapon | undefined => {
    for (const category of weaponCategories) {
      const weapon = category.weapons.find((w) => w.id === weaponId);
      if (weapon) return weapon;
    }
    return undefined;
  };

  // Helper to calculate cost of selected weapon in a category
  const calculateSelectedWeaponCost = (
    categoryKey: keyof typeof selectedWeapons,
  ): number => {
    const weaponId = selectedWeapons[categoryKey];
    if (!weaponId) return 0;

    const weapon = findWeaponById(weaponId);
    return weapon?.cost || 0;
  };

  // Handle weapon selection
  const handleWeaponSelect = (weapon: Weapon) => {
    if (!canAffordWeapon(weapon)) return;

    const categoryKey = getCategoryKey(weapon.id);
    onWeaponSelect(categoryKey, weapon.id);
  };

  // Check if all weapons are selected
  const allWeaponsSelected =
    selectedWeapons.shield && selectedWeapons.sword && selectedWeapons.helmet;

  // Handle proceeding to battle
  const handleProceedToBattle = () => {
    const totalCost = calculateTotalCost();
    onSpendCoins(totalCost);
    onPhaseComplete(GamePhase.MONSTER_BATTLE);
  };

  if (showInstructions) {
    return (
      <div className="min-h-[100svh] bg-background flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-6">
          <div className="text-center space-y-2">
            <h1 className="retro-title text-4xl">WEAPON SHOP</h1>
            <p className="retro-tagline">Choose wisely, warrior!</p>
          </div>

          <Card className="retro-card">
            <CardContent className="p-6 space-y-4">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-2 text-lg">
                  <Coins className="w-6 h-6 text-primary" />
                  <span className="font-bold">
                    You have collected {totalCoins} coins!
                  </span>
                </div>

                <div className="space-y-2 text-left">
                  <p>
                    • Choose one weapon from each category: Shield, Sword, and
                    Helmet
                  </p>
                  <p>• Each weapon costs different amounts—choose wisely!</p>
                  <p>• More powerful weapons = more damage in battle!</p>
                  <p>• Free options available for each category</p>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  onClick={() => setShowInstructions(false)}
                  className="retro-button"
                >
                  Browse Weapons
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6 pb-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="retro-title text-3xl md:text-4xl">WEAPON SHOP</h1>
          <div className="flex items-center justify-center space-x-2">
            <Coins className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">
              Coins: {totalCoins - calculateTotalCost()} / {totalCoins}
            </span>
          </div>
        </div>

        {/* Weapons Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {weaponCategories.map((category) => {
            const categoryKey = category.name
              .toLowerCase()
              .slice(0, -1) as keyof typeof selectedWeapons;

            return (
              <Card key={category.name} className="retro-card">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {category.weapons.map((weapon) => (
                    <WeaponCard
                      key={weapon.id}
                      weapon={weapon}
                      isSelected={selectedWeapons[categoryKey] === weapon.id}
                      canAfford={canAffordWeapon(weapon)}
                      onClick={() => handleWeaponSelect(weapon)}
                    />
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Action Area */}
        <div className="text-center space-y-4">
          {allWeaponsSelected ? (
            <div className="space-y-4">
              <div className="bg-card p-4 rounded-lg border-2 border-primary">
                <p className="text-lg font-bold text-primary mb-2">
                  🎉 You're ready for battle!
                </p>
                <p className="text-sm text-muted-foreground">
                  Total cost: {calculateTotalCost()} coins
                </p>
              </div>

              <Button
                onClick={handleProceedToBattle}
                className="retro-button text-lg px-8 py-4"
              >
                Proceed to Battle
              </Button>
            </div>
          ) : (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-muted-foreground">
                Select one weapon from each category to continue
              </p>
              <div className="flex justify-center space-x-4 mt-2 text-sm">
                <span
                  className={cn(
                    selectedWeapons.shield
                      ? "text-green-600"
                      : "text-destructive",
                  )}
                >
                  Shield: {selectedWeapons.shield ? "✓" : "✗"}
                </span>
                <span
                  className={cn(
                    selectedWeapons.sword
                      ? "text-green-600"
                      : "text-destructive",
                  )}
                >
                  Sword: {selectedWeapons.sword ? "✓" : "✗"}
                </span>
                <span
                  className={cn(
                    selectedWeapons.helmet
                      ? "text-green-600"
                      : "text-destructive",
                  )}
                >
                  Helmet: {selectedWeapons.helmet ? "✓" : "✗"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
