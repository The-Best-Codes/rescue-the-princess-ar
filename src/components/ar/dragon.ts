/* eslint-disable @typescript-eslint/no-explicit-any */
import { appendDebugLine, toPositionObject } from "./debug.js";

const DRAGON_SCALE = 0.003; // Scale up 3x from 0.001
const DRAGON_HEALTH = 100;
const BASE_DAMAGE = 10;

const dragonRoot = document.getElementById("dragon-root");
let dragonEntity: any = null;

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

      // Set up click/tap handler
      this.el.addEventListener("click", (event: any) => {
        if ((this as any).isDead) return;

        const damage = BASE_DAMAGE + (this as any).damageBonus;
        (this as any).health -= damage;

        // Get click position for damage number
        const intersection = event.detail.intersection;
        const clickPosition = { x: 0, y: 0 };

        if (intersection && intersection.point) {
          // Convert 3D position to screen position for damage number
          const camera = document.getElementById("player");
          if (camera) {
            const vector = new (window as any).THREE.Vector3();
            vector.copy(intersection.point);
            vector.project((camera as any).getObject3D("camera"));

            // Convert to screen coordinates
            const halfWidth = window.innerWidth / 2;
            const halfHeight = window.innerHeight / 2;
            clickPosition.x = vector.x * halfWidth + halfWidth;
            clickPosition.y = -(vector.y * halfHeight) + halfHeight;
          }
        }

        // Show damage number
        showDamageNumber(damage, clickPosition);

        // Emit damage event
        document.dispatchEvent(
          new CustomEvent("dragon-damaged", {
            detail: { damage, health: (this as any).health },
          }),
        );

        // Check if dead
        if ((this as any).health <= 0 && !(this as any).isDead) {
          (this as any).isDead = true;
          this.killDragon();
        }

        appendDebugLine("Dragon damaged", {
          damage,
          remaining: (this as any).health,
          position: clickPosition,
        });
      });
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

    // Add a larger invisible collision box for easier tapping
    const clickableArea = document.createElement("a-entity");
    clickableArea.setAttribute(
      "geometry",
      "primitive: box; width: 0.3; height: 0.3; depth: 0.3",
    );
    clickableArea.setAttribute(
      "material",
      "opacity: 0; transparent: true; visible: false",
    );
    clickableArea.setAttribute("position", "0 0.15 0"); // Center it above the dragon

    // Make the clickable area handle the clicks
    clickableArea.setAttribute("raycaster-target", "");
    clickableArea.setAttribute("class", "dragon-clickable");

    // Forward click events from clickable area to dragon
    clickableArea.addEventListener("click", (event: any) => {
      event.stopPropagation(); // Prevent event bubbling
      event.preventDefault(); // Prevent default behavior
      
      // Stop the event from reaching the AR hit test system
      event.stopImmediatePropagation();
      
      // Forward to dragon using A-Frame event system
      dragon.dispatchEvent(new CustomEvent("click", { detail: event.detail }));
      appendDebugLine("Dragon click area tapped", {});
    });

    // Add clickable area as child of dragon
    dragon.appendChild(clickableArea);

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
          appendDebugLine("Removed ar-hit-test from dragon-root after placement", {});
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
    if (dragonEntity && dragonEntity.parentNode) {
      dragonEntity.parentNode.removeChild(dragonEntity);
    }
    dragonEntity = null;
    
    // Restore ar-hit-test attribute for next session
    const dragonRoot = document.getElementById("dragon-root");
    if (dragonRoot && !dragonRoot.hasAttribute("ar-hit-test")) {
      // Only restore if it was removed
      appendDebugLine("Restoring ar-hit-test to dragon-root", {});
    }
    
    appendDebugLine("Dragon cleared", {});
  } catch (error) {
    alert(`Error clearing dragon: ${error}`);
    console.error("Error clearing dragon:", error);
  }
}

function placeDragon(origin: any, damageBonus: number = 0) {
  try {
    clearDragon();

    // Place dragon at the reticle position (floor level)
    const dragonPosition = new (window as any).THREE.Vector3();
    dragonPosition.copy(origin);
    // Keep at floor level - no Y offset
    
    // Positioning looks correct based on debug - removing alert

    createDragon(dragonPosition, damageBonus);

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
};
