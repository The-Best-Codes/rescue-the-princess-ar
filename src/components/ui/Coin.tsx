import { useEffect, useState, useRef } from "react";

interface CoinProps {
  id: string;
  x: number; // Normalized 0-1
  y: number; // Normalized 0-1
  size: number; // in pixels
  countdown: number; // Countdown starting value (3, 2, 1)
  onExpire: (id: string) => void;
  collected?: boolean; // Whether coin was collected (triggers fade)
}

export function Coin({
  id,
  x,
  y,
  size,
  countdown,
  onExpire,
  collected = false,
}: CoinProps) {
  const [currentCountdown, setCurrentCountdown] = useState(countdown);
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const createdAtRef = useRef(Date.now());
  const hasExpiredRef = useRef(false);

  // Get display dimensions from window (full screen)
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // Convert normalized coordinates (0-1) to screen pixels
  const screenX = x * screenWidth;
  const screenY = y * screenHeight;

  // Countdown timer - decrement each second
  useEffect(() => {
    if (collected) return; // Don't count down if collected

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - createdAtRef.current) / 1000);
      const remaining = Math.max(0, countdown - elapsed);

      setCurrentCountdown(remaining);

      if (remaining === 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        setIsFading(true);
        setTimeout(() => {
          setIsVisible(false);
          onExpire(id);
        }, 500); // Wait for fade animation
      }
    }, 100); // Update more frequently for smooth display

    return () => clearInterval(timer);
  }, [id, onExpire, collected, countdown]);

  // Handle collected state - trigger fade out
  useEffect(() => {
    if (collected && !hasExpiredRef.current) {
      hasExpiredRef.current = true;
      setIsFading(true);
      setTimeout(() => {
        setIsVisible(false);
        onExpire(id);
      }, 500); // Wait for fade animation
    }
  }, [collected, id, onExpire]);

  if (!isVisible) return null;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${screenX}px`,
        top: `${screenY}px`,
        transform: "translate(-50%, -50%)",
        animation: isFading ? "fadeOut 0.5s ease-out forwards" : "none",
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
            {currentCountdown}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
