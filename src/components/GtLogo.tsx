/** Inline recreation of the GT Medical Solutions oval badge (no binary asset required). */
export function GtLogo({ width = 150, className = "" }: { width?: number; className?: string }) {
  const navy = "#16265b";
  const maroon = "#8a1c2b";
  return (
    <svg className={className} width={width} height={width * 0.42} viewBox="0 0 300 126" aria-label="GT Medical Solutions">
      <ellipse cx="150" cy="63" rx="146" ry="58" fill="#ffffff" stroke={navy} strokeWidth="3" />
      <ellipse cx="150" cy="63" rx="138" ry="51" fill="none" stroke={maroon} strokeWidth="1.5" />
      {/* GT monogram */}
      <text x="34" y="92" fontFamily="Georgia, 'Times New Roman', serif" fontSize="74" fontWeight="700">
        <tspan fill={navy}>G</tspan><tspan fill={maroon}>T</tspan>
      </text>
      {/* Stacked wordmark */}
      <text x="150" y="56" fontFamily="Arial, sans-serif" fontSize="26" fontWeight="800" letterSpacing="1.5" fill={maroon}>MEDICAL</text>
      <line x1="150" y1="66" x2="270" y2="66" stroke={navy} strokeWidth="1.5" />
      <text x="150" y="92" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="700" letterSpacing="3.5" fill={navy}>SOLUTIONS</text>
    </svg>
  );
}
