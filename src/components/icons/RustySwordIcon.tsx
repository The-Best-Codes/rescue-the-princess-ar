export function RustySwordIcon({
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
        d="M 47 18 L 53 18 L 55 65 L 45 65 Z"
        fill="url(#rustyGradient)"
        stroke="#6D4C41"
        strokeWidth="1.5"
        opacity="0.9"
      />

      {/* Rust spots and damage */}
      <circle cx="48" cy="28" r="1.5" fill="#8D6E63" opacity="0.7" />
      <circle cx="52" cy="35" r="1" fill="#A1887F" opacity="0.6" />
      <circle cx="49" cy="42" r="1.5" fill="#8D6E63" opacity="0.8" />
      <circle cx="51" cy="50" r="1" fill="#6D4C41" opacity="0.7" />
      <circle cx="48" cy="58" r="1.2" fill="#A1887F" opacity="0.6" />

      {/* Notches and chips */}
      <path
        d="M 47 32 L 46 33 L 47 34"
        stroke="#5D4037"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M 53 45 L 54 46 L 53 47"
        stroke="#5D4037"
        strokeWidth="1"
        fill="none"
      />

      {/* Guard/Crossguard (damaged) */}
      <path
        d="M 36 64 L 38 63 L 62 63 L 64 64 L 63 69 L 37 69 Z"
        fill="url(#rustyGuardGradient)"
        stroke="#5D4037"
        strokeWidth="1.5"
      />
      <circle cx="40" cy="66" r="1" fill="#8D6E63" opacity="0.6" />
      <circle cx="60" cy="66" r="1" fill="#8D6E63" opacity="0.6" />

      {/* Handle (worn wood) */}
      <rect
        x="46"
        y="69"
        width="8"
        height="16"
        rx="1"
        fill="#5D4037"
        stroke="#4E342E"
        strokeWidth="1"
      />

      {/* Worn wrapping */}
      <line
        x1="46"
        y1="72"
        x2="54"
        y2="72"
        stroke="#6D4C41"
        strokeWidth="1"
        opacity="0.5"
      />
      <line
        x1="47"
        y1="76"
        x2="54"
        y2="76"
        stroke="#6D4C41"
        strokeWidth="1"
        opacity="0.5"
      />
      <line
        x1="46"
        y1="80"
        x2="53"
        y2="80"
        stroke="#6D4C41"
        strokeWidth="1"
        opacity="0.5"
      />

      {/* Damaged pommel */}
      <ellipse
        cx="50"
        cy="87"
        rx="4.5"
        ry="3.5"
        fill="#795548"
        stroke="#5D4037"
        strokeWidth="1.5"
      />
      <path d="M 48 87 L 52 87" stroke="#4E342E" strokeWidth="1" />

      {/* Gradient definitions */}
      <defs>
        <linearGradient id="rustyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#BCAAA4" />
          <stop offset="40%" stopColor="#A1887F" />
          <stop offset="70%" stopColor="#8D6E63" />
          <stop offset="100%" stopColor="#795548" />
        </linearGradient>
        <linearGradient
          id="rustyGuardGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor="#8D6E63" />
          <stop offset="50%" stopColor="#795548" />
          <stop offset="100%" stopColor="#6D4C41" />
        </linearGradient>
      </defs>
    </svg>
  );
}
