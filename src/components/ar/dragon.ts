/* eslint-disable @typescript-eslint/no-explicit-any */
import { appendDebugLine, toPositionObject } from "./debug.js";
import {
  startShakeDetection,
  stopShakeDetection,
} from "../../lib/shakeDetection.js";

const DRAGON_SCALE = 0.003; // Scale up 3x from 0.001
const DRAGON_HEALTH = 100;
const BASE_DAMAGE = 10;

const dragonRoot = document.getElementById("dragon-root");
let dragonEntity: any = null;

// Dragon damage and shake detection

function registerDragonBehaviorComponent() {
  if (!window.AFRAME) return;

  window.AFRAME.registerComponent("dragon-behavior", {
    schema: {
      health: { type: "number", default: DRAGON_HEALTH },
      damageBonus: { type: "number", default: 0 },
    },
    init() {
      (this as any).health = this.data.health;
      (this as any).damageBonus = this.data.damageBonus;
      (this as any).isDead = false;

      // Store reference for shake detection
      (this as any).damageElement = this.el;
    },

    killDragon() {
      if ((this as any).isDead) {
        // Add death animation
        this.el.setAttribute(
          "animation__death",
          "property: rotation; to: 0 0 90; dur: 1000; easing: easeInOutQuad",
        );
        this.el.setAttribute(
          "animation__fadeOut",
          "property: material.opacity; to: 0; dur: 1500; easing: easeInOutQuad",
        );

        setTimeout(() => {
          if (this.el.parentNode) {
            this.el.parentNode.removeChild(this.el);
          }
          dragonEntity = null;
          document.dispatchEvent(new CustomEvent("dragon-defeated"));
        }, 1500);

        appendDebugLine("Dragon defeated!", {});
      }
    },
  });
}

function damageDragon() {
  if (!dragonEntity) return;

  const dragonComponent = dragonEntity.components["dragon-behavior"];
  if (!dragonComponent || dragonComponent.isDead) return;

  const damage = BASE_DAMAGE + dragonComponent.damageBonus;
  dragonComponent.health -= damage;

  // Show damage number in center of screen since we can't get exact position from shake
  showDamageNumber(damage, {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  // Emit damage event
  document.dispatchEvent(
    new CustomEvent("dragon-damaged", {
      detail: { damage, health: dragonComponent.health },
    }),
  );

  // Check if dead
  if (dragonComponent.health <= 0 && !dragonComponent.isDead) {
    dragonComponent.isDead = true;
    dragonComponent.killDragon();
  }

  appendDebugLine("Dragon damaged by shake", {
    damage,
    remaining: dragonComponent.health,
  });
}

function showDamageNumber(damage: number, position: { x: number; y: number }) {
  try {
    const damageEl = document.createElement("div");
    damageEl.className = "damage-number damage-number--fade";
    damageEl.textContent = `-${damage}hp`;
    damageEl.style.left = `${Math.max(20, Math.min(window.innerWidth - 100, position.x))}px`;
    damageEl.style.top = `${Math.max(20, Math.min(window.innerHeight - 50, position.y))}px`;

    document.body.appendChild(damageEl);

    // Remove after animation
    setTimeout(() => {
      if (damageEl.parentNode) {
        damageEl.parentNode.removeChild(damageEl);
      }
    }, 1500);
  } catch (error) {
    alert(`Error showing damage number: ${error}`);
    console.error("Error showing damage number:", error);
  }
}

function createDragon(position: any, damageBonus: number = 0) {
  try {
    appendDebugLine("Creating dragon at position", toPositionObject(position));

    const dragon = document.createElement("a-entity");

    // Load the dragon model
    dragon.setAttribute("gltf-model", "/models/3d/dragon.glb");
    dragon.setAttribute(
      "scale",
      `${DRAGON_SCALE} ${DRAGON_SCALE} ${DRAGON_SCALE}`,
    );
    dragon.setAttribute("rotation", "0 0 0");
    dragon.setAttribute(
      "dragon-behavior",
      `health: ${DRAGON_HEALTH}; damageBonus: ${damageBonus}`,
    );

    // No need for clickable area since we're using shake detection

    // Add a subtle animation to the dragon model itself
    dragon.setAttribute(
      "animation__idle",
      "property: rotation; to: 0 5 0; dir: alternate; dur: 3000; easing: easeInOutSine; loop: true",
    );

    // Position the dragon
    (dragon as any).object3D.position.copy(position);

    // Add to scene
    if (dragonRoot) {
      dragonRoot.appendChild(dragon);
      dragonEntity = dragon;

      // Emit placement event
      document.dispatchEvent(new CustomEvent("dragon-placed"));

      // After placing dragon, modify the dragon-root to prevent further AR hit testing
      // This should prevent subsequent taps from triggering placement
      setTimeout(() => {
        if (dragonRoot) {
          dragonRoot.removeAttribute("ar-hit-test");
          appendDebugLine(
            "Removed ar-hit-test from dragon-root after placement",
            {},
          );
        }
      }, 100);

      appendDebugLine("Dragon created and placed", {
        health: DRAGON_HEALTH,
        damageBonus,
        scale: DRAGON_SCALE,
      });
    } else {
      alert("Dragon root not found!");
    }
  } catch (error) {
    alert(`Error creating dragon: ${error}`);
    console.error("Error creating dragon:", error);
  }
}

function clearDragon() {
  try {
    stopDragonShakeDetection();

    if (dragonEntity && dragonEntity.parentNode) {
      dragonEntity.parentNode.removeChild(dragonEntity);
    }
    dragonEntity = null;

    appendDebugLine("Dragon cleared", {});
  } catch (error) {
    alert(`Error clearing dragon: ${error}`);
    console.error("Error clearing dragon:", error);
  }
}

function startDragonShakeDetection() {
  startShakeDetection({
    onShake: damageDragon,
  });
  appendDebugLine("Dragon shake detection started", {});
}

function stopDragonShakeDetection() {
  stopShakeDetection();
  appendDebugLine("Dragon shake detection stopped", {});
}

function placeDragon(origin: any, damageBonus: number = 0) {
  try {
    clearDragon();

    // Place dragon at the reticle position (floor level)
    const dragonPosition = new (window as any).THREE.Vector3();
    dragonPosition.copy(origin);
    // Adjust position slightly to the left to fix offset issue
    dragonPosition.x -= 0.1;
    // Keep at floor level - no Y offset

    createDragon(dragonPosition, damageBonus);

    // Start shake detection after dragon is placed
    startDragonShakeDetection();

    appendDebugLine("Dragon placed", toPositionObject(dragonPosition));
  } catch (error) {
    alert(`Error placing dragon: ${error}`);
    console.error("Error placing dragon:", error);
  }
}

function calculateDamageBonus(selectedWeapons: {
  shield: string | null;
  sword: string | null;
  helmet: string | null;
}): number {
  // Simple damage calculation - you can make this more sophisticated
  let bonus = 0;

  // Basic weapons provide some bonus
  if (selectedWeapons.sword && selectedWeapons.sword !== "wooden-sword")
    bonus += 5;
  if (selectedWeapons.helmet && selectedWeapons.helmet !== "leather-cap")
    bonus += 2;
  if (selectedWeapons.shield && selectedWeapons.shield !== "wooden-shield")
    bonus += 2;

  // Premium weapons provide more bonus
  if (selectedWeapons.sword === "excalibur") bonus += 15;
  if (selectedWeapons.helmet === "dragon-helm") bonus += 8;
  if (selectedWeapons.shield === "aegis-shield") bonus += 8;

  return bonus;
}

export {
  registerDragonBehaviorComponent,
  placeDragon,
  clearDragon,
  calculateDamageBonus,
  stopDragonShakeDetection,
};
