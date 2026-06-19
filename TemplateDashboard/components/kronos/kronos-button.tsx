"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const kronosButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-muted active:bg-muted/80",
        ghost:
          "text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/80",
        danger:
          "bg-destructive text-white hover:bg-destructive/90 active:bg-destructive/80",
        link:
          "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-7 rounded-md px-3 text-xs",
        default: "h-9 rounded-md px-4 py-2",
        lg: "h-10 rounded-md px-5 text-base",
        icon: "size-9 rounded-md",
        "icon-sm": "size-7 rounded-md",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

interface KronosButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof kronosButtonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const KronosButton = React.forwardRef<HTMLButtonElement, KronosButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        ref={ref}
        className={cn(kronosButtonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="size-4 animate-spin" />}
        {!loading && leftIcon}
        {children}
        {!loading && rightIcon}
      </Comp>
    )
  }
)
KronosButton.displayName = "KronosButton"

export { KronosButton, kronosButtonVariants }
