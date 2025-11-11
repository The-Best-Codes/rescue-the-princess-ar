/**
 * Coin Component - Pure Rendering Component
 *
 * This component is now a pure presentation layer. It receives all state from parent
 * and simply renders the coin. All timing logic has been moved to the parent component.
 *
 * Props are calculated by the parent based on current timestamp, so this component
 * never needs internal timers or state management.
 */

interface CoinProps {
  id: string;
  x: number; // Normalized 0-1
  y: number; // Normalized 0-1
  size: number; // in pixels
  remainingTime: number; // Time left in seconds (0-3)
  isCollected: boolean; // Whether coin was collected
  isFading: boolean; // Whether to show fade animation
}

export function Coin({
  id,
  x,
  y,
  size,
  remainingTime,
  isCollected,
  isFading,
}: CoinProps) {
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
      {/* Coin SVG */}
      <div className="relative" style={{ width: size, height: size }}>
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-full bg-yellow-400/30 animate-pulse"
          style={{
            boxShadow: "0 0 20px rgba(250, 204, 21, 0.6)",
          }}
        />

        {/* Coin body */}
        <svg
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-lg"
        >
          {/* Outer gold circle */}
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="#FFD700"
            stroke="#DAA520"
            strokeWidth="2"
          />

          {/* Inner gold gradient circle */}
          <defs>
            <radialGradient id={`coinGradient-${id}`} cx="35%" cy="35%">
              <stop offset="0%" stopColor="#FFED4E" />
              <stop offset="100%" stopColor="#DAA520" />
            </radialGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="45"
            fill={`url(#coinGradient-${id})`}
            opacity="0.8"
          />

          {/* Coin star pattern */}
          <circle
            cx="50"
            cy="50"
            r="35"
            fill="none"
            stroke="#DAA520"
            strokeWidth="1"
            opacity="0.5"
          />
          <circle
            cx="50"
            cy="50"
            r="25"
            fill="none"
            stroke="#DAA520"
            strokeWidth="1"
            opacity="0.3"
          />

          {/* Decorative star */}
          <text
            x="50"
            y="58"
            fontSize="40"
            fontWeight="bold"
            textAnchor="middle"
            fill="#B8860B"
            opacity="0.8"
          >
            ★
          </text>
        </svg>

        {/* Countdown number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-white font-bold drop-shadow-lg"
            style={{
              fontSize: `${size * 0.5}px`,
              textShadow:
                "0 2px 4px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.5)",
            }}
          >
            {Math.max(0, Math.ceil(remainingTime))}
          </span>
        </div>
      </div>
    </div>
  );
}
