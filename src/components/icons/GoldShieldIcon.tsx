export function GoldShieldIcon({
  className = "w-12 h-12",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
    >
      {/* Shield outline */}
      <path
        d="M 50 15 L 75 25 L 78 50 Q 78 70 50 88 Q 22 70 22 50 L 25 25 Z"
        fill="url(#goldGradient)"
        stroke="#B8860B"
        strokeWidth="2.5"
      />

      {/* Inner border decoration */}
      <path
        d="M 50 20 L 72 28 L 74 50 Q 74 68 50 84 Q 26 68 26 50 L 28 28 Z"
        fill="none"
        stroke="#DAA520"
        strokeWidth="1.5"
      />

      {/* Central emblem - crown */}
      <path
        d="M 40 45 L 43 38 L 46 45 L 50 35 L 54 45 L 57 38 L 60 45 L 58 52 L 42 52 Z"
        fill="#FFD700"
        stroke="#B8860B"
        strokeWidth="1"
      />

      {/* Crown jewels */}
      <circle cx="43" cy="38" r="1.5" fill="#FF6B6B" />
      <circle cx="50" cy="35" r="2" fill="#FF6B6B" />
      <circle cx="57" cy="38" r="1.5" fill="#FF6B6B" />

      {/* Decorative studs */}
      <circle
        cx="35"
        cy="35"
        r="2.5"
        fill="#FFD700"
        stroke="#B8860B"
        strokeWidth="1"
      />
      <circle
        cx="65"
        cy="35"
        r="2.5"
        fill="#FFD700"
        stroke="#B8860B"
        strokeWidth="1"
      />
      <circle
        cx="30"
        cy="50"
        r="2.5"
        fill="#FFD700"
        stroke="#B8860B"
        strokeWidth="1"
      />
      <circle
        cx="70"
        cy="50"
        r="2.5"
        fill="#FFD700"
        stroke="#B8860B"
        strokeWidth="1"
      />
      <circle
        cx="38"
        cy="65"
        r="2.5"
        fill="#FFD700"
        stroke="#B8860B"
        strokeWidth="1"
      />
      <circle
        cx="62"
        cy="65"
        r="2.5"
        fill="#FFD700"
        stroke="#B8860B"
        strokeWidth="1"
      />

      {/* Shine effect */}
      <path
        d="M 45 25 Q 48 28 45 35"
        stroke="white"
        strokeWidth="2"
        opacity="0.6"
        strokeLinecap="round"
      />

      {/* Bottom design */}
      <path
        d="M 42 58 Q 50 62 58 58"
        stroke="#B8860B"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M 40 64 Q 50 68 60 64"
        stroke="#B8860B"
        strokeWidth="1.5"
        fill="none"
      />

      {/* Gradient definitions */}
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="40%" stopColor="#FFC107" />
          <stop offset="70%" stopColor="#DAA520" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
      </defs>
    </svg>
  );
}
