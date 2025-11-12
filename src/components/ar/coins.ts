import { appendDebugLine, toPositionObject } from "./debug.js";

const COIN_COUNT = 18;
const COIN_DISTANCE_MIN = 1.0;
const COIN_DISTANCE_MAX = 1.8;
const COIN_FLOAT_MIN = -0.15;
const COIN_FLOAT_MAX = 0.15;
const COIN_RADIUS = 0.05;
const SHAKE_THRESHOLD = 25;
const SHAKE_TIMEOUT = 500;

const coinRoot = document.getElementById("coin-root");
const coinPool: any[] = [];

let shakeDetectionActive = false;
let lastShakeTime = 0;
let nearCoin: any = null;
let coinCollectAudio: any = null;

function createCoinAudio() {
  if (coinCollectAudio) return coinCollectAudio;

  const audio = new Audio("/sounds/coin-collect.mp3");
  audio.preload = "auto";

  const playSound = () => {
    try {
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Fallback to oscillator if audio file fails
        playFallbackSound();
      });
    } catch {
      // Fallback to oscillator if audio file fails
      playFallbackSound();
    }
  };

  const playFallbackSound = () => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const now = audioContext.currentTime;
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.connect(gain);
      gain.connect(audioContext.destination);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch (error) {
      appendDebugLine("Audio playback error", (error as any).message);
    }
  };

  return { play: playSound };
}

function playCollectSound() {
  if (!coinCollectAudio) {
    coinCollectAudio = createCoinAudio();
  }
  coinCollectAudio.play();
}

function startShakeDetection() {
  if (shakeDetectionActive) return;
  shakeDetectionActive = true;
  lastShakeTime = 0;

  const handleDeviceMotion = (event: DeviceMotionEvent) => {
    const acc = event.accelerationIncludingGravity;
    if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

    const magnitude = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);
    const now = Date.now();

    if (magnitude > SHAKE_THRESHOLD && now - lastShakeTime > SHAKE_TIMEOUT) {
      lastShakeTime = now;
      appendDebugLine("Shake detected", { magnitude });
      if (nearCoin && nearCoin.parentNode) {
        collectCoin(nearCoin);
      }
    }
  };

  window.addEventListener("devicemotion", handleDeviceMotion, true);

  (window as any).__stopShakeDetection = () => {
    window.removeEventListener("devicemotion", handleDeviceMotion, true);
    shakeDetectionActive = false;
  };
}

function stopShakeDetection() {
  if ((window as any).__stopShakeDetection) {
    (window as any).__stopShakeDetection();
  }
}

function collectCoin(coinEl: any) {
  if (!coinEl || !coinEl.parentNode) return;

  appendDebugLine("Collecting coin", {});

  coinEl.removeAttribute("animation__spin");

  coinEl.setAttribute(
    "animation__fadeOut",
    "property: material.opacity; to: 0; dur: 300; easing: easeInOutQuad",
  );

  setTimeout(() => {
    showOverlayCoin();
    if (coinEl.parentNode) {
      coinEl.parentNode.removeChild(coinEl);
      const idx = coinPool.indexOf(coinEl);
      if (idx > -1) {
        coinPool.splice(idx, 1);
      }
    }
    // Emit coin collected event for tracking
    document.dispatchEvent(new CustomEvent("coin-collected"));
  }, 300);

  nearCoin = null;
}

function showOverlayCoin() {
  playCollectSound();

  const overlay = document.getElementById("overlay");
  let overlayCoin = document.getElementById("overlay-coin");

  if (!overlayCoin) {
    overlayCoin = document.createElement("div");
    overlayCoin.id = "overlay-coin";
    overlayCoin.className = "overlay__coin";
    if (overlay) {
      overlay.appendChild(overlayCoin);
    }
  }

  if (overlayCoin) {
    overlayCoin.style.opacity = "0";
    overlayCoin.style.transition = "none";
    overlayCoin.classList.remove("overlay__coin--fade-out");

    setTimeout(() => {
      overlayCoin.style.transition =
        "opacity 500ms cubic-bezier(0.34, 1.56, 0.64, 1)";
      overlayCoin.style.opacity = "1";

      setTimeout(() => {
        overlayCoin.style.transition = "opacity 700ms ease-in-out";
        overlayCoin.classList.add("overlay__coin--fade-out");
        overlayCoin.style.opacity = "0";

        setTimeout(() => {
          if (overlayCoin.parentNode) {
            overlayCoin.parentNode.removeChild(overlayCoin);
          }
        }, 700);
      }, 1500);
    }, 50);
  }
}

function registerCoinBehaviorComponent() {
  if (!window.AFRAME) return;

  window.AFRAME.registerComponent("coin-behavior", {
    schema: {
      baseColor: { type: "color", default: "#f5c542" },
      closeEmissive: { type: "color", default: "#f5c542" },
      triggerDistance: { type: "number", default: 0.35 },
    },
    init() {
      (this as any).camera = document.getElementById("player");
      (this as any).state = "idle";
      (this as any).cameraWorldPosition = new (window as any).THREE.Vector3();
      (this as any).coinWorldPosition = new (window as any).THREE.Vector3();
      this.el.setAttribute("material", "transparent", true);
      this.el.setAttribute("material", "opacity", 1);
    },
    tick() {
      const camera = (this as any).camera;
      if (!camera) return;
      (camera as any).object3D.getWorldPosition(
        (this as any).cameraWorldPosition,
      );
      (this.el as any).object3D.getWorldPosition(
        (this as any).coinWorldPosition,
      );

      const distance = ((this as any).cameraWorldPosition as any).distanceTo(
        (this as any).coinWorldPosition,
      );

      if (distance < this.data.triggerDistance) {
        if ((this as any).state !== "close") {
          (this as any).state = "close";
          this.el.setAttribute("material", "emissive", this.data.closeEmissive);
          this.el.setAttribute("material", "emissiveIntensity", 0.8);
          this.el.emit("coin-near");
          nearCoin = this.el;
        }
      } else if ((this as any).state !== "idle") {
        (this as any).state = "idle";
        this.el.setAttribute("material", "emissive", "#000000");
        this.el.setAttribute("material", "emissiveIntensity", 0);
        this.el.emit("coin-far");
        if (nearCoin === this.el) {
          nearCoin = null;
        }
      }
    },
  });
}

function createCoin(position: any) {
  const coin = document.createElement("a-entity");
  coin.setAttribute(
    "geometry",
    `primitive: cylinder; radius: ${COIN_RADIUS}; height: 0.02`,
  );
  coin.setAttribute("rotation", "0 0 90");
  coin.setAttribute(
    "material",
    "color: #f5c542; metalness: 0.8; roughness: 0.2",
  );
  coin.setAttribute(
    "coin-behavior",
    "triggerDistance: 0.35; closeEmissive: #f5c542",
  );
  coin.setAttribute(
    "animation__spin",
    "property: rotation; to: 0 360 90; loop: true; dur: 2000; easing: linear",
  );
  coin.addEventListener("coin-near", () =>
    appendDebugLine(
      "Coin proximity trigger",
      toPositionObject((coin as any).object3D.position),
    ),
  );
  coin.addEventListener("coin-far", () =>
    appendDebugLine(
      "Coin reset color",
      toPositionObject((coin as any).object3D.position),
    ),
  );
  (coin as any).object3D.position.copy(position);
  if (coinRoot) {
    coinRoot.appendChild(coin);
  }
  coinPool.push(coin);
}

function clearCoins() {
  stopShakeDetection();
  nearCoin = null;
  coinPool.forEach((coin) => {
    if (coin.parentNode) {
      coin.parentNode.removeChild(coin);
    }
  });
  coinPool.length = 0;
}

function scatterCoins(origin: any) {
  clearCoins();
  startShakeDetection();

  const camera = document.getElementById("player");
  const cameraPos = new (window as any).THREE.Vector3();
  if (camera) {
    (camera as any).object3D.getWorldPosition(cameraPos);
  } else {
    cameraPos.copy(origin);
  }

  const cameraRig = document.getElementById("cameraRig");
  const cameraQuaternion = new (window as any).THREE.Quaternion();
  if (cameraRig) {
    (cameraRig as any).object3D.getWorldQuaternion(cameraQuaternion);
    appendDebugLine("Camera quaternion", {
      x: cameraQuaternion.x.toFixed(3),
      y: cameraQuaternion.y.toFixed(3),
      z: cameraQuaternion.z.toFixed(3),
      w: cameraQuaternion.w.toFixed(3),
    });
  } else {
    appendDebugLine("cameraRig not found");
  }

  for (let i = 0; i < COIN_COUNT; i += 1) {
    const angle = (Math.PI * 2 * i) / COIN_COUNT;
    const randomAngleVariation = (Math.random() - 0.5) * 0.4;
    const distance = (window as any).THREE.MathUtils.lerp(
      COIN_DISTANCE_MIN,
      COIN_DISTANCE_MAX,
      Math.random(),
    );
    const height = (window as any).THREE.MathUtils.lerp(
      COIN_FLOAT_MIN,
      COIN_FLOAT_MAX,
      Math.random(),
    );

    const localOffset = new (window as any).THREE.Vector3(
      Math.sin(angle + randomAngleVariation) * distance,
      height,
      Math.cos(angle + randomAngleVariation) * distance,
    );

    localOffset.applyQuaternion(cameraQuaternion);

    const coinPosition = new (window as any).THREE.Vector3(
      cameraPos.x + localOffset.x,
      cameraPos.y + localOffset.y,
      cameraPos.z + localOffset.z,
    );

    createCoin(coinPosition);
  }

  appendDebugLine(`Spawned ${COIN_COUNT} coins`, toPositionObject(cameraPos));

  // Debug: log the angles and positions being used
  const debugAngles: number[] = [];
  for (let i = 0; i < COIN_COUNT; i += 1) {
    const angle = (Math.PI * 2 * i) / COIN_COUNT + (Math.random() - 0.5) * 0.4;
    debugAngles.push(angle * (180 / Math.PI));
  }
  appendDebugLine("Coin spawn angles (degrees)", debugAngles.slice(0, 6));
}

export {
  registerCoinBehaviorComponent,
  scatterCoins,
  clearCoins,
  stopShakeDetection,
};
