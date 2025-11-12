/* eslint-disable @typescript-eslint/no-explicit-any */
const reticle = document.getElementById("reticle");
const scene = document.querySelector("a-scene");

let reticleTrackingActive = false;
let reticleAnimationHandle: number | null = null;
let reticleShouldBeVisible = false;

function getHitTestMesh() {
  return (scene as any)?.components?.["ar-hit-test"]?.bboxMesh || null;
}

function updateReticlePoseFromHitTest() {
  const mesh = getHitTestMesh();
  if (!mesh || !reticle) return false;
  (reticle as any).object3D.position.copy(mesh.position);
  (reticle as any).object3D.quaternion.copy(mesh.quaternion);
  return true;
}

function reticleAnimationStep() {
  if (!reticleTrackingActive) {
    reticleAnimationHandle = null;
    return;
  }
  if (!scene || !(scene as any).is("ar-mode")) {
    stopReticleTracking();
    return;
  }
  const hasPose = updateReticlePoseFromHitTest();
  if (reticleShouldBeVisible && hasPose) {
    if (reticle && !reticle.getAttribute("visible")) {
      reticle.setAttribute("visible", "true");
    }
  } else if (
    !reticleShouldBeVisible &&
    reticle &&
    reticle.getAttribute("visible")
  ) {
    reticle.setAttribute("visible", "false");
  }
  reticleAnimationHandle = requestAnimationFrame(reticleAnimationStep);
}

function ensureReticleTracking() {
  if (reticleTrackingActive) return;
  reticleTrackingActive = true;
  reticleAnimationHandle = requestAnimationFrame(reticleAnimationStep);
}

function stopReticleTracking() {
  reticleTrackingActive = false;
  if (reticleAnimationHandle !== null) {
    cancelAnimationFrame(reticleAnimationHandle);
    reticleAnimationHandle = null;
  }
  reticleShouldBeVisible = false;
  if (reticle && reticle.getAttribute("visible")) {
    reticle.setAttribute("visible", "false");
  }
  if (reticle) {
    reticle.removeAttribute("animation__pulse");
  }
}

export {
  getHitTestMesh,
  updateReticlePoseFromHitTest,
  ensureReticleTracking,
  stopReticleTracking,
  reticle,
};

export function setReticleShouldBeVisible(visible: boolean) {
  reticleShouldBeVisible = visible;
}

export function getReticleShouldBeVisible() {
  return reticleShouldBeVisible;
}
