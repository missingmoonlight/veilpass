import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export function BrandLogo({ className, size = 36, showText = true }: BrandLogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      {/* Handcrafted Vector Geometric Shield Logo */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-105"
      >
        <defs>
          <linearGradient id="vp-logo-primary" x1="64" y1="64" x2="448" y2="448" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <linearGradient id="vp-logo-dark" x1="128" y1="128" x2="384" y2="384" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
        </defs>

        {/* Shield Outer */}
        <path
          d="M256 64L416 140V256C416 352 348 432 256 456C164 432 96 352 96 256V140L256 64Z"
          stroke="url(#vp-logo-primary)"
          strokeWidth="18"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="url(#vp-logo-dark)"
        />

        {/* Inner Circuit Hexagon */}
        <path
          d="M256 128L360 184V296L256 352L152 296V184L256 128Z"
          stroke="url(#vp-logo-primary)"
          strokeWidth="6"
          strokeDasharray="10 8"
          opacity="0.65"
          fill="none"
        />

        {/* Zero-Knowledge Keyhole / Aperture */}
        <circle cx="256" cy="224" r="44" stroke="url(#vp-logo-primary)" strokeWidth="12" fill="none" />
        <circle cx="256" cy="224" r="18" fill="url(#vp-logo-primary)" />
        <path
          d="M236 248L220 316H292L276 248"
          fill="url(#vp-logo-primary)"
          stroke="url(#vp-logo-primary)"
          strokeWidth="8"
          strokeLinejoin="round"
        />

        {/* Nodes */}
        <circle cx="256" cy="128" r="9" fill="#34D399" />
        <circle cx="360" cy="184" r="9" fill="#34D399" />
        <circle cx="360" cy="296" r="9" fill="#06B6D4" />
        <circle cx="256" cy="352" r="9" fill="#06B6D4" />
        <circle cx="152" cy="296" r="9" fill="#06B6D4" />
        <circle cx="152" cy="184" r="9" fill="#34D399" />
      </svg>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 font-bold tracking-tight text-foreground text-lg leading-tight">
            <span>VeilPass</span>
            <span className="inline-block size-1.5 rounded-full bg-primary animate-pulse" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground leading-none">
            ZK AGE GATE
          </span>
        </div>
      )}
    </div>
  );
}
