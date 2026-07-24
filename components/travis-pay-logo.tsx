export const TravisPayLogo = ({ isDark = true, className = "h-8" }: { isDark?: boolean, className?: string }) => (
  <svg viewBox="0 0 220 50" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="tpReactGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00F2FE" />
        <stop offset="100%" stopColor="#4FACFE" />
      </linearGradient>
    </defs>
    <g transform="translate(5, 5)">
      <path d="M 0 0 H 32 V 6 H 19 V 38 H 11 V 6 H 0 Z" fill="url(#tpReactGrad)" />
      <path d="M 19 12 H 32 C 37.5 12 41 15.5 41 21 C 41 26.5 37.5 30 32 30 H 19 V 24 H 31.5 C 33 24 34 23 34 21 C 34 19 33 18 31.5 18 H 19 Z" fill="url(#tpReactGrad)" opacity={0.85} />
      <rect x="33" y="0" width="6" height="6" fill="#00F2FE" rx="1.5" />
    </g>
    <text x="60" y="30" fill={isDark ? "#FFFFFF" : "#0F172A"} fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="800" fontSize="20" letterSpacing="-0.5">TRAVIS</text>
    <text x="142" y="30" fill="url(#tpReactGrad)" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="400" fontSize="20" letterSpacing="-0.5">PAY</text>
  </svg>
);
