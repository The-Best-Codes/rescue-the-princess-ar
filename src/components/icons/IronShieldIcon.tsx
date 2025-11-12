export function IronShieldIcon({
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
        fill="url(#ironGradient)"
        stroke="#546E7A"
        strokeWidth="2.5"
      />

      {/* Inner border */}
      <path
        d="M 50 20 L 72 28 L 74 50 Q 74 68 50 84 Q 26 68 26 50 L 28 28 Z"
        fill="none"
        stroke="#78909C"
        strokeWidth="1.5"
      />

      {/* Central cross emblem */}
      <rect
        x="47"
        y="38"
        width="6"
        height="24"
        rx="1"
        fill="#CFD8DC"
        stroke="#546E7A"
        strokeWidth="1"
      />
      <rect
        x="38"
        y="47"
        width="24"
        height="6"
        rx="1"
        fill="#CFD8DC"
        stroke="#546E7A"
        strokeWidth="1"
      />

      {/* Rivets */}
      <circle
        cx="35"
        cy="35"
        r="2"
        fill="#37474F"
        stroke="#546E7A"
        strokeWidth="0.5"
      />
      <circle
        cx="65"
        cy="35"
        r="2"
        fill="#37474F"
        stroke="#546E7A"
        strokeWidth="0.5"
      />
      <circle
        cx="30"
        cy="50"
        r="2"
        fill="#37474F"
        stroke="#546E7A"
        strokeWidth="0.5"
      />
      <circle
        cx="70"
        cy="50"
        r="2"
        fill="#37474F"
        stroke="#546E7A"
        strokeWidth="0.5"
      />
      <circle
        cx="35"
        cy="65"
        r="2"
        fill="#37474F"
        stroke="#546E7A"
        strokeWidth="0.5"
      />
      <circle
        cx="65"
        cy="65"
        r="2"
        fill="#37474F"
        stroke="#546E7A"
        strokeWidth="0.5"
      />

      {/* Metal plates */}
      <path
        d="M 35 40 L 40 38 L 45 40"
        stroke="#90A4AE"
        strokeWidth="1"
        fill="none"
        opacity="0.7"
      />
      <path
        d="M 55 40 L 60 38 L 65 40"
        stroke="#90A4AE"
        strokeWidth="1"
        fill="none"
        opacity="0.7"
      />

      {/* Highlight */}
      <path
        d="M 42 25 L 44 30"
        stroke="white"
        strokeWidth="2"
        opacity="0.5"
        strokeLinecap="round"
      />

      {/* Gradient definitions */}
      <defs>
        <linearGradient id="ironGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ECEFF1" />
          <stop offset="40%" stopColor="#B0BEC5" />
          <stop offset="70%" stopColor="#90A4AE" />
          <stop offset="100%" stopColor="#78909C" />
        </linearGradient>
      </defs>
    </svg>
  );
}
