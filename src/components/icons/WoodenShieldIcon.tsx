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
      fill="currentColor"
    >
      <path
        d="M 50 15 L 75 30 L 75 55 Q 75 75 50 82 Q 25 75 25 55 L 25 30 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line
        x1="50"
        y1="30"
        x2="50"
        y2="75"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.6"
      />
      <line
        x1="40"
        y1="40"
        x2="60"
        y2="40"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.5"
      />
      <line
        x1="40"
        y1="55"
        x2="60"
        y2="55"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.5"
      />
    </svg>
  );
}
