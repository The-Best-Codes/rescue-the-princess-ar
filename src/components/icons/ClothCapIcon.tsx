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
      fill="none"
    >
      {/* Main cap body */}
      <ellipse cx="50" cy="45" rx="28" ry="12" fill="#8B7355" />
      <path
        d="M 22 45 Q 22 58 50 62 Q 78 58 78 45"
        fill="#6B5344"
        stroke="#4A3828"
        strokeWidth="1.5"
      />

      {/* Top of cap */}
      <ellipse cx="50" cy="28" rx="20" ry="18" fill="#A0826D" />
      <path d="M 30 28 Q 30 40 50 45 Q 70 40 70 28" fill="#8B7355" />

      {/* Stitching details */}
      <path
        d="M 35 32 Q 40 38 45 32 M 50 30 Q 55 36 60 30"
        stroke="#6B5344"
        strokeWidth="1"
        opacity="0.6"
        strokeLinecap="round"
      />

      {/* Brim shadow */}
      <ellipse cx="50" cy="45" rx="28" ry="3" fill="#4A3828" opacity="0.3" />

      {/* Fold lines */}
      <path
        d="M 32 48 Q 38 52 44 48 M 56 48 Q 62 52 68 48"
        stroke="#4A3828"
        strokeWidth="1"
        opacity="0.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
