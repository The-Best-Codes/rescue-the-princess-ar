import type { Weapon } from "../types/game";
import { Card, CardContent } from "./ui/card";
import { cn } from "../lib/utils";
import { WoodenShieldIcon } from "./icons/WoodenShieldIcon";
import { IronShieldIcon } from "./icons/IronShieldIcon";
import { GoldShieldIcon } from "./icons/GoldShieldIcon";
import { RustySwordIcon } from "./icons/RustySwordIcon";
import { IronSwordIcon } from "./icons/IronSwordIcon";
import { DiamondSwordIcon } from "./icons/DiamondSwordIcon";
import { ClothCapIcon } from "./icons/ClothCapIcon";
import { SteelHelmetIcon } from "./icons/SteelHelmetIcon";
import { CrystalHelmIcon } from "./icons/CrystalHelmIcon";

interface WeaponCardProps {
  weapon: Weapon;
  isSelected: boolean;
  canAfford: boolean;
  onClick: () => void;
}

function getWeaponIcon(iconId: string) {
  switch (iconId) {
    case "wooden-shield":
      return <WoodenShieldIcon className="w-12 h-12" />;
    case "iron-shield":
      return <IronShieldIcon className="w-12 h-12" />;
    case "gold-shield":
      return <GoldShieldIcon className="w-12 h-12" />;
    case "rusty-sword":
      return <RustySwordIcon className="w-12 h-12" />;
    case "iron-sword":
      return <IronSwordIcon className="w-12 h-12" />;
    case "diamond-sword":
      return <DiamondSwordIcon className="w-12 h-12" />;
    case "cloth-cap":
      return <ClothCapIcon className="w-12 h-12" />;
    case "steel-helmet":
      return <SteelHelmetIcon className="w-12 h-12" />;
    case "crystal-helm":
      return <CrystalHelmIcon className="w-12 h-12" />;
    default:
      return null;
  }
}

export function WeaponCard({
  weapon,
  isSelected,
  canAfford,
  onClick,
}: WeaponCardProps) {
  const handleClick = () => {
    if (canAfford) {
      onClick();
    }
  };

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 border-2",
        isSelected ? "border-primary bg-primary/10" : "border-muted",
        !canAfford && "opacity-50 cursor-not-allowed",
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4 text-center space-y-3">
        {/* Icon */}
        <div className="mb-2 flex justify-center">
          {getWeaponIcon(weapon.icon)}
        </div>

        {/* Name */}
        <h3
          className={cn(
            "font-bold text-sm",
            isSelected ? "text-primary" : "text-foreground",
          )}
        >
          {weapon.name}
        </h3>

        {/* Cost */}
        <div
          className={cn(
            "text-lg font-bold",
            weapon.cost === 0
              ? "text-green-600"
              : canAfford
                ? "text-primary"
                : "text-destructive",
          )}
        >
          {weapon.cost === 0 ? "FREE" : `${weapon.cost} coins`}
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground">{weapon.description}</p>

        {/* Damage bonus */}
        {weapon.damageBonus > 0 && (
          <div className="text-xs font-semibold text-accent-foreground bg-accent px-2 py-1 rounded">
            +{weapon.damageBonus}% Damage
          </div>
        )}

        {/* Can't afford indicator */}
        {!canAfford && weapon.cost > 0 && (
          <div className="text-xs font-bold text-destructive uppercase tracking-wider">
            Can't Afford
          </div>
        )}
      </CardContent>
    </Card>
  );
}
