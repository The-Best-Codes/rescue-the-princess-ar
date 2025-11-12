export function WoodenShieldIcon({
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
        fill="url(#woodGradient)"
        stroke="#5D4037"
        strokeWidth="2.5"
      />

      {/* Wood planks */}
      <path
        d="M 50 20 L 72 28 L 74 50 Q 74 68 50 84"
        fill="none"
        stroke="#6D4C41"
        strokeWidth="1.5"
        opacity="0.6"
      />
      <path
        d="M 50 20 L 28 28 L 26 50 Q 26 68 50 84"
        fill="none"
        stroke="#6D4C41"
        strokeWidth="1.5"
        opacity="0.6"
      />

      {/* Vertical center plank */}
      <path
        d="M 50 20 L 50 84"
        stroke="#5D4037"
        strokeWidth="2"
        opacity="0.7"
      />

      {/* Horizontal support beams */}
      <path
        d="M 30 35 L 70 35"
        stroke="#5D4037"
        strokeWidth="2"
        opacity="0.7"
      />
      <path
        d="M 28 50 L 72 50"
        stroke="#5D4037"
        strokeWidth="2.5"
        opacity="0.7"
      />
      <path
        d="M 35 65 L 65 65"
        stroke="#5D4037"
        strokeWidth="2"
        opacity="0.7"
      />

      {/* Wood grain details */}
      <path
        d="M 40 30 Q 42 32 40 34"
        stroke="#6D4C41"
        strokeWidth="0.5"
        opacity="0.4"
        fill="none"
      />
      <path
        d="M 60 40 Q 62 42 60 44"
        stroke="#6D4C41"
        strokeWidth="0.5"
        opacity="0.4"
        fill="none"
      />
      <path
        d="M 45 55 Q 47 57 45 59"
        stroke="#6D4C41"
        strokeWidth="0.5"
        opacity="0.4"
        fill="none"
      />

      {/* Metal rivets/nails */}
      <circle
        cx="50"
        cy="35"
        r="2"
        fill="#424242"
        stroke="#212121"
        strokeWidth="0.5"
      />
      <circle
        cx="50"
        cy="50"
        r="2.5"
        fill="#424242"
        stroke="#212121"
        strokeWidth="0.5"
      />
      <circle
        cx="50"
        cy="65"
        r="2"
        fill="#424242"
        stroke="#212121"
        strokeWidth="0.5"
      />
      <circle
        cx="35"
        cy="50"
        r="1.5"
        fill="#424242"
        stroke="#212121"
        strokeWidth="0.5"
      />
      <circle
        cx="65"
        cy="50"
        r="1.5"
        fill="#424242"
        stroke="#212121"
        strokeWidth="0.5"
      />

      {/* Edge reinforcement */}
      <path
        d="M 50 15 L 75 25 L 78 50 Q 78 70 50 88 Q 22 70 22 50 L 25 25 Z"
        fill="none"
        stroke="#4E342E"
        strokeWidth="1"
        opacity="0.5"
      />

      {/* Gradient definitions */}
      <defs>
        <linearGradient id="woodGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A1887F" />
          <stop offset="40%" stopColor="#8D6E63" />
          <stop offset="70%" stopColor="#795548" />
          <stop offset="100%" stopColor="#6D4C41" />
        </linearGradient>
      </defs>
    </svg>
  );
}
