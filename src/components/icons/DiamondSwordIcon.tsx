export function DiamondSwordIcon({
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
      {/* Blade */}
      <path
        d="M 48 20 L 52 20 L 54 65 L 46 65 Z"
        fill="url(#diamondGradient)"
        stroke="#4FC3F7"
        strokeWidth="1.5"
      />

      {/* Blade edge highlight */}
      <path d="M 49 22 L 50 22 L 51 63 L 49 63 Z" fill="white" opacity="0.7" />

      {/* Diamond crystals on blade */}
      <path
        d="M 50 30 L 48 32 L 50 34 L 52 32 Z"
        fill="#B3E5FC"
        opacity="0.8"
      />
      <path
        d="M 50 40 L 48 42 L 50 44 L 52 42 Z"
        fill="#81D4FA"
        opacity="0.8"
      />
      <path
        d="M 50 50 L 48 52 L 50 54 L 52 52 Z"
        fill="#4FC3F7"
        opacity="0.8"
      />

      {/* Guard/Crossguard */}
      <rect
        x="38"
        y="63"
        width="24"
        height="6"
        rx="2"
        fill="url(#guardGradient)"
        stroke="#0277BD"
        strokeWidth="1.5"
      />
      <ellipse cx="38" cy="66" rx="2" ry="3" fill="#01579B" />
      <ellipse cx="62" cy="66" rx="2" ry="3" fill="#01579B" />

      {/* Handle */}
      <rect
        x="46"
        y="69"
        width="8"
        height="16"
        rx="1.5"
        fill="#4A148C"
        stroke="#6A1B9A"
        strokeWidth="1"
      />

      {/* Handle wrapping */}
      <line x1="46" y1="72" x2="54" y2="72" stroke="#7B1FA2" strokeWidth="1" />
      <line x1="46" y1="76" x2="54" y2="76" stroke="#7B1FA2" strokeWidth="1" />
      <line x1="46" y1="80" x2="54" y2="80" stroke="#7B1FA2" strokeWidth="1" />

      {/* Pommel */}
      <circle
        cx="50"
        cy="88"
        r="4"
        fill="#0277BD"
        stroke="#01579B"
        strokeWidth="1.5"
      />
      <circle cx="50" cy="88" r="2" fill="#4FC3F7" opacity="0.8" />

      {/* Gradient definitions */}
      <defs>
        <linearGradient id="diamondGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E1F5FE" />
          <stop offset="50%" stopColor="#81D4FA" />
          <stop offset="100%" stopColor="#B3E5FC" />
        </linearGradient>
        <linearGradient id="guardGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0288D1" />
          <stop offset="50%" stopColor="#0277BD" />
          <stop offset="100%" stopColor="#01579B" />
        </linearGradient>
      </defs>
    </svg>
  );
}
