import type { Weapon } from "../types/game";
import { Card, CardContent } from "./ui/card";
import { cn } from "../lib/utils";

interface WeaponCardProps {
  weapon: Weapon;
  isSelected: boolean;
  canAfford: boolean;
  onClick: () => void;
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
        isSelected
          ? "border-primary bg-primary/10 scale-105"
          : "border-muted hover:border-primary/50",
        !canAfford && "opacity-50 cursor-not-allowed",
        canAfford && !isSelected && "hover:scale-102 hover:shadow-lg",
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4 text-center space-y-3">
        {/* Icon */}
        <div className="text-4xl mb-2">{weapon.icon}</div>

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

        {/* Selection indicator */}
        {isSelected && (
          <div className="text-xs font-bold text-primary uppercase tracking-wider">
            ✓ Selected
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
