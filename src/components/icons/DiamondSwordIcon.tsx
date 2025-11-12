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
      fill="currentColor"
    >
      <path
        d="M 50 12 L 46 45 L 42 75 Q 42 82 50 85 Q 58 82 58 75 L 54 45 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
      />
      <rect
        x="44"
        y="76"
        width="12"
        height="6"
        rx="1.5"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M 50 30 L 52 40 L 50 50 L 48 40 Z"
        fill="currentColor"
        opacity="0.8"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}
