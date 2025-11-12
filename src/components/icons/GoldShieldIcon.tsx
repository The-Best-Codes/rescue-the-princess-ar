export function GoldShieldIcon({
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
      <circle
        cx="50"
        cy="48"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.8"
      />
      <circle cx="50" cy="48" r="5" fill="currentColor" opacity="0.6" />
      <path
        d="M 45 48 L 50 45 L 55 48 L 50 51 Z"
        fill="currentColor"
        opacity="0.8"
      />
    </svg>
  );
}
