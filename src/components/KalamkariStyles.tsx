export const KalamkariPattern = () => (
  <svg width="0" height="0" className="absolute">
    <defs>
      <pattern id="kalamkari-floral" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
        <path d="M50 20 C60 0 90 0 100 20 C100 40 70 70 50 100 C30 70 0 40 0 20 C10 0 40 0 50 20" fill="#8B0000" opacity="0.1" />
        <circle cx="50" cy="50" r="5" fill="#DAA520" opacity="0.2" />
        <path d="M10 10 Q 50 0 90 10" stroke="#DAA520" fill="none" strokeWidth="0.5" opacity="0.3" />
      </pattern>
      
      <pattern id="kalamkari-border" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <rect width="40" height="40" fill="none" stroke="#8B0000" strokeWidth="1" opacity="0.4" />
        <path d="M0 20 L20 0 M20 40 L40 20" stroke="#DAA520" strokeWidth="0.5" opacity="0.3" />
      </pattern>
    </defs>
  </svg>
);
