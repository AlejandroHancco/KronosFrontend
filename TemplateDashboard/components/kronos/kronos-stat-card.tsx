"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react"

type TrendDirection = "up" | "down" | "stable"

interface KronosStatCardProps {
  label: string
  value: string | number
  unit?: string
  trend?: TrendDirection
  trendValue?: string
  trendLabel?: string
  icon?: LucideIcon
  iconColor?: "default" | "primary" | "success" | "warning" | "danger"
  className?: string
  sparklineData?: number[]
}

const iconColors = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-green-500/10 text-green-500",
  warning: "bg-yellow-500/10 text-yellow-500",
  danger: "bg-red-500/10 text-red-500",
}

const trendIcons: Record<TrendDirection, React.ElementType> = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
}

export function KronosStatCard({
  label,
  value,
  unit,
  trend,
  trendValue,
  trendLabel,
  icon: Icon,
  iconColor = "default",
  className,
  sparklineData = [],
}: KronosStatCardProps) {
  const TrendIcon = trend ? trendIcons[trend] : null

  return (
    <div className={cn(
      "group relative overflow-hidden rounded-md border border-border bg-card p-4",
      className
    )}>
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {Icon && (
          <div className={cn("flex size-8 items-center justify-center rounded-md", iconColors[iconColor])}>
            <Icon className="size-4" />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold tracking-tight text-foreground">
          {value}
        </span>
        {unit && (
          <span className="text-sm text-muted-foreground">{unit}</span>
        )}
      </div>

      {/* Trend */}
      {trend && trendValue && (
        <div className="mt-2 flex items-center gap-2">
          {TrendIcon && (
            <TrendIcon
              className={cn(
                "size-3.5",
                trend === "up" && "text-green-500",
                trend === "down" && "text-red-500",
                trend === "stable" && "text-muted-foreground"
              )}
            />
          )}
          <span
            className={cn(
              "text-xs font-medium",
              trend === "up" && "text-green-500",
              trend === "down" && "text-red-500",
              trend === "stable" && "text-muted-foreground"
            )}
          >
            {trendValue}
          </span>
          {trendLabel && (
            <span className="text-xs text-muted-foreground">{trendLabel}</span>
          )}
        </div>
      )}

      {/* Mini Sparkline */}
      {sparklineData.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-8 opacity-30">
          <MiniSparkline data={sparklineData} />
        </div>
      )}
    </div>
  )
}

interface MiniSparklineProps {
  data: number[]
}

function MiniSparkline({ data }: MiniSparklineProps) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const height = 32
  const width = 100

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width
      const y = height - ((value - min) / range) * (height - 4)
      return `${x},${y}`
    })
    .join(" ")

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-full w-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="stat-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0047FF" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0047FF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill="url(#stat-gradient)"
      />
      <polyline
        points={points}
        fill="none"
        stroke="#0047FF"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
