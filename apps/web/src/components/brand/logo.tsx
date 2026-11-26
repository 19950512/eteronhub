interface LogoMarkProps {
  size?: number;
  className?: string;
}

// invariant: mesmo desenho de src/app/icon.svg (favicon) — se mudar um, mude o outro
// e regere os PNGs de public/icons (ver docs/07-design-system.md).
export function LogoMark({ size = 32, className }: LogoMarkProps): JSX.Element {
  return (
    <svg
      className={["logo-mark", className].filter(Boolean).join(" ")}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M32 5.5 55 18.75v26.5L32 58.5 9 45.25v-26.5Z"
        fill="var(--spark-600)"
        stroke="var(--spark-600)"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path d="M22 19h21v6H28v4h12v6H28v4h15v6H22Z" fill="#fff" />
      <circle cx="45.5" cy="32" r="2.75" fill="#fff" />
    </svg>
  );
}

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 32, className }: LogoProps): JSX.Element {
  return (
    <span className={["logo", className].filter(Boolean).join(" ")}>
      <LogoMark size={size} />
      <span>
        Eteron <span className="logo-accent">Hub</span>
      </span>
    </span>
  );
}
