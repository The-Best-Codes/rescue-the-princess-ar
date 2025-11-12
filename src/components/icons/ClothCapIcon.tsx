export function ClothCapIcon({
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
        d="M 35 50 Q 35 35 50 30 Q 65 35 65 50 L 65 55 Q 65 62 50 65 Q 35 62 35 55 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.8"
      />
      <path
        d="M 50 30 L 55 20 L 60 30 Q 60 25 55 22 Q 50 20 50 30"
        fill="currentColor"
        opacity="0.7"
      />
      <line
        x1="40"
        y1="48"
        x2="60"
        y2="48"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.5"
      />
    </svg>
  );
}
