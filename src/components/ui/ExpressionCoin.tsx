/**
 * Expression Coin Component
 *
 * Renders a coin with:
 * - Golden coin SVG
 * - Target expression emoji
 * - Expression label
 * - Countdown number
 */

interface ExpressionCoinProps {
  id: string;
  x: number; // Normalized 0-1
  y: number; // Normalized 0-1
  size: number; // in pixels
  emoji: string; // e.g., '😊'
  expressionLabel: string; // e.g., 'HAPPY'
  remainingTime: number; // Time left in seconds (0-3)
  isCollected: boolean; // Whether coin was collected
  isFading: boolean; // Whether to show fade animation
}

export function ExpressionCoin({
  x,
  y,
  size,
  emoji,
  remainingTime,
  isCollected,
  isFading,
}: ExpressionCoinProps) {
  // Convert normalized coordinates (0-1) to screen pixels
  const screenX = x * window.innerWidth;
  const screenY = y * window.innerHeight;

  // Different animations for collected vs timed out
  const isTimedOut = isFading && !isCollected;
  const fadeStyle = isTimedOut ? "0.3s ease-out" : "0.5s ease-out";
  const scaleStyle = isCollected
    ? "scale(1.5)"
    : isTimedOut
      ? "scale(0.5)"
      : "scale(1)";

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${screenX}px`,
        top: `${screenY}px`,
        transform: `translate(-50%, -50%) ${scaleStyle}`,
        opacity: isFading ? 0 : 1,
        transition: `all ${fadeStyle}`,
        willChange: "opacity, transform",
      }}
    >
      {/* Emoji container */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* Emoji */}
        <div
          className="text-center drop-shadow-lg select-none"
          style={{
            fontSize: `${size}px`,
            lineHeight: "1",
            filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
          }}
        >
          {emoji}
        </div>

        {/* Countdown number - centered on top of emoji */}
        <div
          className="absolute"
          style={{
            top: `-${size * 0.25}px`,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <div
            className="bg-red-500 text-white font-bold rounded-full flex items-center justify-center drop-shadow-lg"
            style={{
              width: `${size * 0.6}px`,
              height: `${size * 0.6}px`,
              fontSize: `${size * 0.35}px`,
              textShadow: "0 1px 3px rgba(0, 0, 0, 0.8)",
            }}
          >
            {Math.max(0, Math.ceil(remainingTime))}
          </div>
        </div>
      </div>
    </div>
  );
}
