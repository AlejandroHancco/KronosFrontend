import { forwardRef, useId } from "react"
import type { InputHTMLAttributes, ReactNode } from "react"
import { cn } from "../../lib/utils"

interface KronosInputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  error?: string
  label?: string
  hint?: string
}

const KronosInput = forwardRef<HTMLInputElement, KronosInputProps>(
  ({ className, type, leftIcon, rightIcon, error, label, hint, id, ...props }, ref) => {
      const generatedId = useId()
      const inputId = id || generatedId
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              "flex h-9 w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground transition-all",
              "border-border placeholder:text-muted-foreground",
              "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-destructive focus:border-destructive focus:ring-destructive/20",
              leftIcon && "pl-9",
              rightIcon && "pr-9",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>
        {hint && !error && (
          <p className="text-xs text-muted-foreground">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
      </div>
    )
  }
)
KronosInput.displayName = "KronosInput"

export { KronosInput }
