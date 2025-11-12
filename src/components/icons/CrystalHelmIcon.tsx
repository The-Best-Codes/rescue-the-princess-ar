export function CrystalHelmIcon({
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
        d="M 50 20 L 70 35 L 72 55 L 50 65 L 28 55 L 30 35 Z"
        fill="url(#crystalGradient)"
        stroke="#4DD0E1"
        strokeWidth="2"
      />

      {/* Crystal facets */}
      <path d="M 50 20 L 60 32 L 50 40 Z" fill="#B2EBF2" opacity="0.6" />
      <path d="M 50 20 L 40 32 L 50 40 Z" fill="#80DEEA" opacity="0.5" />
      <path
        d="M 50 40 L 60 32 L 65 45 L 50 50 Z"
        fill="#4DD0E1"
        opacity="0.7"
      />
      <path
        d="M 50 40 L 40 32 L 35 45 L 50 50 Z"
        fill="#26C6DA"
        opacity="0.6"
      />

      {/* Bottom guard */}
      <path
        d="M 28 55 Q 28 62 35 65 L 35 70 Q 35 72 37 72 L 45 72 Q 45 75 50 75 Q 55 75 55 72 L 63 72 Q 65 72 65 70 L 65 65 Q 72 62 72 55"
        fill="url(#crystalGradient2)"
        stroke="#4DD0E1"
        strokeWidth="1.5"
      />

      {/* Face opening */}
      <ellipse cx="50" cy="52" rx="8" ry="6" fill="#1A1A2E" opacity="0.8" />

      {/* Highlight shine */}
      <path d="M 45 25 L 48 28 L 45 35 L 42 30 Z" fill="white" opacity="0.8" />
      <circle cx="58" cy="38" r="3" fill="white" opacity="0.6" />

      {/* Gradient definitions */}
      <defs>
        <linearGradient
          id="crystalGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#E0F7FA" />
          <stop offset="50%" stopColor="#80DEEA" />
          <stop offset="100%" stopColor="#26C6DA" />
        </linearGradient>
        <linearGradient id="crystalGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#80DEEA" />
          <stop offset="100%" stopColor="#00ACC1" />
        </linearGradient>
      </defs>
    </svg>
  );
}
