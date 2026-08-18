import { cn } from "@/lib/utils";

/**
 * The Kernel mark: three spectral ribbons crossed over a white sticker outline.
 * Colors are intentionally literal here — this is a fixed brand asset, not themed UI.
 */
export function KernelMark({ className, id = "kernel" }: { className?: string; id?: string }) {
  return (
    <svg
      viewBox="0 0 300 300"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-9 w-9", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={`${id}-theme`}
          gradientUnits="userSpaceOnUse"
          x1="150"
          y1="15"
          x2="150"
          y2="285"
        >
          <stop offset="0%" stopColor="#2F6FED" />
          <stop offset="20%" stopColor="#5B93F0" />
          <stop offset="42%" stopColor="#F2C24C" />
          <stop offset="62%" stopColor="#F2963C" />
          <stop offset="83%" stopColor="#E8593F" />
          <stop offset="100%" stopColor="#E23F72" />
        </linearGradient>
        <radialGradient id={`${id}-bleed`} cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#F2963C" stopOpacity="0.4" />
          <stop offset="55%" stopColor="#E8593F" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#E23F72" stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-blur`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
        <filter id={`${id}-shadow`} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="8" stdDeviation="9" floodColor="#2A2050" floodOpacity="0.25" />
        </filter>
      </defs>

      <circle cx="150" cy="150" r="130" fill={`url(#${id}-bleed)`} filter={`url(#${id}-blur)`} />

      <g filter={`url(#${id}-shadow)`}>
        <g
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="68"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="70" y1="190" x2="270" y2="275" />
          <line x1="140" y1="30" x2="140" y2="270" />
          <line x1="70" y1="110" x2="270" y2="25" />
        </g>

        <line
          x1="70"
          y1="190"
          x2="270"
          y2="275"
          stroke={`url(#${id}-theme)`}
          strokeWidth="46"
          strokeLinecap="round"
        />
        <ellipse cx="140" cy="220" rx="30" ry="20" fill="#1C1730" opacity="0.14" />
        <line
          x1="140"
          y1="30"
          x2="140"
          y2="270"
          stroke={`url(#${id}-theme)`}
          strokeWidth="46"
          strokeLinecap="round"
        />
        <line
          x1="70"
          y1="110"
          x2="270"
          y2="25"
          stroke={`url(#${id}-theme)`}
          strokeWidth="46"
          strokeLinecap="round"
        />
        <ellipse cx="140" cy="80" rx="30" ry="20" fill="#1C1730" opacity="0.12" />
        <line
          x1="80"
          y1="102"
          x2="255"
          y2="30"
          stroke="#FFFFFF"
          strokeOpacity="0.22"
          strokeWidth="10"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

export function KernelWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <KernelMark className="h-7 w-7" />
      <span className="display-title text-[1.45rem] leading-none">Kernel</span>
    </span>
  );
}
