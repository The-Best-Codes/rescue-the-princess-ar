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
      fill="currentColor"
    >
      <path
        d="M 30 50 Q 30 32 50 25 Q 70 32 70 50 L 70 60 Q 70 70 50 75 Q 30 70 30 60 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M 50 25 L 55 10 L 60 25"
        fill="currentColor"
        opacity="0.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M 45 50 L 45 65 M 50 48 L 50 68 M 55 50 L 55 65"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.7"
      />
      <circle cx="50" cy="35" r="3" fill="currentColor" opacity="0.6" />
    </svg>
  );
}
