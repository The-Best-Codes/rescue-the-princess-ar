export function SteelHelmetIcon({
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
      {/* Main helmet dome */}
      <path
        d="M 50 22 Q 65 25 72 38 L 74 55 Q 74 62 68 66 L 68 70 Q 68 72 66 72 L 34 72 Q 32 72 32 70 L 32 66 Q 26 62 26 55 L 28 38 Q 35 25 50 22 Z"
        fill="url(#steelGradient)"
        stroke="#546E7A"
        strokeWidth="2"
      />

      {/* Top ridge/crest */}
      <path
        d="M 48 22 L 48 15 L 52 15 L 52 22"
        fill="#607D8B"
        stroke="#546E7A"
        strokeWidth="1.5"
      />
      <circle
        cx="50"
        cy="15"
        r="2"
        fill="#78909C"
        stroke="#546E7A"
        strokeWidth="1"
      />

      {/* Face visor bars */}
      <rect
        x="32"
        y="48"
        width="36"
        height="3"
        rx="1"
        fill="#37474F"
        opacity="0.8"
      />
      <rect
        x="32"
        y="54"
        width="36"
        height="3"
        rx="1"
        fill="#37474F"
        opacity="0.8"
      />
      <rect
        x="32"
        y="60"
        width="36"
        height="3"
        rx="1"
        fill="#37474F"
        opacity="0.8"
      />

      {/* Side reinforcements */}
      <path
        d="M 30 40 Q 28 42 28 45 L 28 55"
        stroke="#78909C"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M 70 40 Q 72 42 72 45 L 72 55"
        stroke="#78909C"
        strokeWidth="2"
        fill="none"
      />

      {/* Rivets */}
      <circle
        cx="35"
        cy="38"
        r="1.5"
        fill="#37474F"
        stroke="#546E7A"
        strokeWidth="0.5"
      />
      <circle
        cx="65"
        cy="38"
        r="1.5"
        fill="#37474F"
        stroke="#546E7A"
        strokeWidth="0.5"
      />
      <circle
        cx="32"
        cy="50"
        r="1.5"
        fill="#37474F"
        stroke="#546E7A"
        strokeWidth="0.5"
      />
      <circle
        cx="68"
        cy="50"
        r="1.5"
        fill="#37474F"
        stroke="#546E7A"
        strokeWidth="0.5"
      />

      {/* Cheek guards */}
      <path
        d="M 32 66 L 28 68 L 28 72 L 32 72"
        fill="#90A4AE"
        stroke="#546E7A"
        strokeWidth="1"
      />
      <path
        d="M 68 66 L 72 68 L 72 72 L 68 72"
        fill="#90A4AE"
        stroke="#546E7A"
        strokeWidth="1"
      />

      {/* Highlight */}
      <path
        d="M 42 28 L 44 32"
        stroke="white"
        strokeWidth="2.5"
        opacity="0.6"
        strokeLinecap="round"
      />

      {/* Gradient definitions */}
      <defs>
        <linearGradient id="steelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ECEFF1" />
          <stop offset="30%" stopColor="#CFD8DC" />
          <stop offset="60%" stopColor="#B0BEC5" />
          <stop offset="100%" stopColor="#90A4AE" />
        </linearGradient>
      </defs>
    </svg>
  );
}
