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
      fill="currentColor"
    >
      <path
        d="M 50 12 L 46 45 L 42 75 Q 42 82 50 85 Q 58 82 58 75 L 54 45 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.7"
      />
      <rect
        x="44"
        y="76"
        width="12"
        height="6"
        rx="1"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1"
      />
      <circle cx="48" cy="50" r="1.5" fill="currentColor" opacity="0.5" />
      <circle cx="52" cy="55" r="1" fill="currentColor" opacity="0.5" />
      <circle cx="49" cy="65" r="1.5" fill="currentColor" opacity="0.5" />
    </svg>
  );
}
