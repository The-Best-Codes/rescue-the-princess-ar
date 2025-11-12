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
      fill="currentColor"
    >
      <path
        d="M 30 50 Q 30 32 50 25 Q 70 32 70 50 L 70 60 Q 70 70 50 75 Q 30 70 30 60 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M 50 25 L 50 15 M 45 28 L 42 20 M 55 28 L 58 20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      <line
        x1="35"
        y1="50"
        x2="65"
        y2="50"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.5"
      />
    </svg>
  );
}
