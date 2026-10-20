import { cn } from "../../lib/utils"

// Curva de barrido de impedancia estilizada: línea base, pico de resonancia de G,
// valle y cola. pathLength=1 permite animar el trazo en unidades relativas.
const TRACE =
  "M0,44 L38,44 C52,44 58,42 64,34 C70,22 75,8 80,8 C85,8 89,24 95,36 C99,44 104,48 110,46 C118,44 124,38 132,40 C140,42 152,44 200,44"

interface KronosLoaderProps {
  size?: "page" | "section"
  label?: string
  className?: string
}

export function KronosLoader({ size = "section", label, className }: KronosLoaderProps) {
  const text = label ?? (size === "page" ? "Midiendo…" : "Cargando…")
  return (
    <div
      role="status"
      aria-label={text}
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        size === "page" ? "h-64" : "py-8",
        className,
      )}
    >
      <svg
        viewBox="0 0 200 56"
        className={size === "page" ? "w-64" : "w-40"}
        aria-hidden="true"
      >
        <defs>
          <pattern id="kronos-grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M10 0H0V10" fill="none" stroke="var(--border)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="200" height="56" fill="url(#kronos-grid)" opacity="0.6" />
        {/* traza completa, tenue */}
        <path d={TRACE} pathLength={1} fill="none" stroke="var(--primary)" strokeOpacity="0.15" strokeWidth="1.5" />
        {/* segmento brillante que recorre la traza */}
        <path
          className="kronos-trace"
          d={TRACE}
          pathLength={1}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle className="kronos-trace-dot" r="2.5" fill="var(--primary)">
          <animateMotion dur="1.6s" repeatCount="indefinite" path={TRACE} />
        </circle>
      </svg>
      <span className="text-xs text-muted-foreground">{text}</span>
    </div>
  )
}
