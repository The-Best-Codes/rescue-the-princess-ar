/**
 * Reusable Coin Audio Utility
 *
 * Provides consistent coin collection sound effects across all minigames
 * with fallback to oscillator-based sound if the audio file fails to load
 */

let coinCollectAudio: { play: () => void } | null = null;

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
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
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
      console.warn("Audio playback error:", error);
    }
  };

  return { play: playSound };
}

/**
 * Play the coin collection sound effect
 * Creates the audio instance on first use for better performance
 */
export function playCoinCollectSound() {
  if (!coinCollectAudio) {
    coinCollectAudio = createCoinAudio();
  }
  coinCollectAudio.play();
}
