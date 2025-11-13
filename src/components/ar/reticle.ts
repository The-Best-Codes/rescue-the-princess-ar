/* eslint-disable @typescript-eslint/no-explicit-any */
// Helper functions to get DOM elements dynamically
const getReticle = () => document.getElementById("reticle");
const getScene = () => document.querySelector("a-scene");

let reticleTrackingActive = false;
let reticleAnimationHandle: number | null = null;
let reticleShouldBeVisible = false;

function getHitTestMesh() {
  const scene = getScene();
  return (scene as any)?.components?.["ar-hit-test"]?.bboxMesh || null;
}

function updateReticlePoseFromHitTest() {
  const mesh = getHitTestMesh();
  const reticle = getReticle();
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
  const scene = getScene();
  if (!scene || !(scene as any).is("ar-mode")) {
    stopReticleTracking();
    return;
  }
  const hasPose = updateReticlePoseFromHitTest();
  const reticle = getReticle();
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
  const reticle = getReticle();
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
  getReticle,
};

export function setReticleShouldBeVisible(visible: boolean) {
  reticleShouldBeVisible = visible;
}

export function getReticleShouldBeVisible() {
  return reticleShouldBeVisible;
}
