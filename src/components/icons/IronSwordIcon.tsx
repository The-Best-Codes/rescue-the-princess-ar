export function IronSwordIcon({
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
        d="M 48 18 L 52 18 L 54 65 L 46 65 Z"
        fill="url(#ironBladeGradient)"
        stroke="#546E7A"
        strokeWidth="1.5"
      />

      {/* Blade edge highlight */}
      <path
        d="M 49 20 L 50.5 20 L 51.5 63 L 49 63 Z"
        fill="white"
        opacity="0.4"
      />

      {/* Fuller (blood groove) */}
      <path
        d="M 50 25 L 50 60"
        stroke="#78909C"
        strokeWidth="1.5"
        opacity="0.6"
      />

      {/* Guard/Crossguard */}
      <rect
        x="36"
        y="63"
        width="28"
        height="6"
        rx="2"
        fill="url(#ironGuardGradient)"
        stroke="#546E7A"
        strokeWidth="1.5"
      />
      <rect
        x="38"
        y="64.5"
        width="24"
        height="3"
        rx="1"
        fill="#90A4AE"
        opacity="0.6"
      />

      {/* Handle */}
      <rect
        x="46"
        y="69"
        width="8"
        height="16"
        rx="1"
        fill="#4E342E"
        stroke="#3E2723"
        strokeWidth="1"
      />

      {/* Leather wrapping */}
      <line
        x1="46"
        y1="72"
        x2="54"
        y2="72"
        stroke="#5D4037"
        strokeWidth="1.5"
      />
      <line
        x1="46"
        y1="75"
        x2="54"
        y2="75"
        stroke="#5D4037"
        strokeWidth="1.5"
      />
      <line
        x1="46"
        y1="78"
        x2="54"
        y2="78"
        stroke="#5D4037"
        strokeWidth="1.5"
      />
      <line
        x1="46"
        y1="81"
        x2="54"
        y2="81"
        stroke="#5D4037"
        strokeWidth="1.5"
      />

      {/* Pommel */}
      <ellipse
        cx="50"
        cy="87"
        rx="5"
        ry="4"
        fill="#607D8B"
        stroke="#546E7A"
        strokeWidth="1.5"
      />
      <ellipse cx="50" cy="87" rx="2.5" ry="2" fill="#78909C" />

      {/* Gradient definitions */}
      <defs>
        <linearGradient
          id="ironBladeGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor="#ECEFF1" />
          <stop offset="50%" stopColor="#B0BEC5" />
          <stop offset="100%" stopColor="#CFD8DC" />
        </linearGradient>
        <linearGradient
          id="ironGuardGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor="#78909C" />
          <stop offset="50%" stopColor="#607D8B" />
          <stop offset="100%" stopColor="#546E7A" />
        </linearGradient>
      </defs>
    </svg>
  );
}
