/**
 * Reusable Coin Audio Utility
 *
 * Provides consistent coin collection sound effects across all minigames
 */

let coinCollectAudio: HTMLAudioElement | null = null;

function createCoinAudio() {
  if (coinCollectAudio) return coinCollectAudio;

  const audio = new Audio("/sounds/coin-collect.mp3");
  audio.preload = "auto";

  return audio;
}

/**
 * Play the coin collection sound effect
 * Creates the audio instance on first use for better performance
 */
export function playCoinCollectSound() {
  try {
    if (!coinCollectAudio) {
      coinCollectAudio = createCoinAudio();
    }

    coinCollectAudio.currentTime = 0;
    coinCollectAudio.play().catch((error: unknown) => {
      console.warn("Failed to play coin collect sound:", error);
    });
  } catch (error: unknown) {
    console.warn("Failed to initialize coin collect sound:", error);
  }
}
