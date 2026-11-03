export function Logo({ dark = false, size = 30 }: { dark?: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <clipPath id={`tile-${dark ? "d" : "l"}`}>
          <rect width="64" height="64" rx="15" />
        </clipPath>
      </defs>
      <g clipPath={`url(#tile-${dark ? "d" : "l"})`}>
        <rect width="64" height="64" fill={dark ? "#15222D" : "#F6F8F9"} />
        <circle cx="16" cy="16" r="32" fill={dark ? "#FFFFFF" : "#0E4A57"} />
        <circle cx="48" cy="48" r="32" fill="#6FA3AE" fillOpacity="0.92" />
      </g>
    </svg>
  );
}
