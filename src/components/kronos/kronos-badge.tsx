import type { HTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const kronosBadgeVariants = cva(
  "inline-flex items-center gap-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground",
        primary: "bg-primary/10 text-primary",
        success: "bg-green-500/10 text-green-500",
        warning: "bg-yellow-500/10 text-yellow-500",
        danger: "bg-red-500/10 text-red-500",
        info: "bg-blue-500/10 text-blue-500",
        outline: "border border-border text-muted-foreground",
      },
      size: {
        sm: "h-5 rounded px-1.5 text-[10px]",
        default: "h-6 rounded-md px-2",
        lg: "h-7 rounded-md px-2.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface KronosBadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof kronosBadgeVariants> {
  dot?: boolean
  dotPulse?: boolean
}

export function KronosBadge({
  className,
  variant,
  size,
  dot,
  dotPulse,
  children,
  ...props
}: KronosBadgeProps) {
  const dotColors = {
    default: "bg-muted-foreground",
    primary: "bg-primary",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500",
    info: "bg-blue-500",
    outline: "bg-muted-foreground",
  }

  return (
    <span
      className={cn(kronosBadgeVariants({ variant, size, className }))}
      {...props}
    >
      {dot && (
        <span className="relative flex size-2">
          {dotPulse && (
            <span
              className={cn(
                "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                dotColors[variant || "default"]
              )}
            />
          )}
          <span
            className={cn(
              "relative inline-flex size-2 rounded-full",
              dotColors[variant || "default"]
            )}
          />
        </span>
      )}
      {children}
    </span>
  )
}
