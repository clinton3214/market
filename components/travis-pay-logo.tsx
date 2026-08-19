export const TravisPayLogo = ({ className = "h-8" }: { className?: string }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g transform="translate(2, 4)" fill="currentColor">
      {/* T and P base structure */}
      <path d="M 0 0 H 32 V 6 H 19 V 38 H 11 V 6 H 0 Z" />
      {/* P bowl */}
      <path d="M 19 12 H 32 C 37.5 12 41 15.5 41 21 C 41 26.5 37.5 30 32 30 H 19 V 24 H 31.5 C 33 24 34 23 34 21 C 34 19 33 18 31.5 18 H 19 Z" />
      {/* Dot */}
      <circle cx="37" cy="3" r="4.5" />
    </g>
  </svg>
);
