"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Activity,
  Thermometer,
  Droplets,
  Zap,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type SensorStatus = "online" | "warning" | "offline" | "maintenance"
type SensorType = "temperature" | "humidity" | "pressure" | "strain"
type TrendDirection = "up" | "down" | "stable"

interface SensorReading {
  value: number
  unit: string
  timestamp: string
}

interface KronosSensorCardProps {
  id: string
  name: string
  type: SensorType
  status: SensorStatus
  location: string
  reading: SensorReading
  trend: TrendDirection
  trendValue: string
  sparklineData?: number[]
  className?: string
  onView?: () => void
  onConfigure?: () => void
}

const sensorIcons: Record<SensorType, React.ElementType> = {
  temperature: Thermometer,
  humidity: Droplets,
  pressure: Zap,
  strain: Activity,
}

const statusConfig: Record<SensorStatus, { color: string; icon: React.ElementType; label: string }> = {
  online: { color: "bg-green-500", icon: CheckCircle, label: "Online" },
  warning: { color: "bg-yellow-500", icon: AlertTriangle, label: "Warning" },
  offline: { color: "bg-red-500", icon: XCircle, label: "Offline" },
  maintenance: { color: "bg-blue-500", icon: Activity, label: "Maintenance" },
}

const trendIcons: Record<TrendDirection, React.ElementType> = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
}

export function KronosSensorCard({
  id,
  name,
  type,
  status,
  location,
  reading,
  trend,
  trendValue,
  sparklineData = [],
  className,
  onView,
  onConfigure,
}: KronosSensorCardProps) {
  const SensorIcon = sensorIcons[type]
  const statusInfo = statusConfig[status]
  const TrendIcon = trendIcons[trend]

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-md border border-border bg-card p-4 transition-all hover:border-primary/30",
        status === "warning" && "border-yellow-500/30",
        status === "offline" && "border-red-500/30 opacity-75",
        className
      )}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex size-9 items-center justify-center rounded-md",
            status === "online" && "bg-primary/10 text-primary",
            status === "warning" && "bg-yellow-500/10 text-yellow-500",
            status === "offline" && "bg-red-500/10 text-red-500",
            status === "maintenance" && "bg-blue-500/10 text-blue-500"
          )}>
            <SensorIcon className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{name}</h3>
            <p className="text-xs text-muted-foreground">{id}</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="opacity-0 transition-opacity group-hover:opacity-100"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onView}>View Details</DropdownMenuItem>
            <DropdownMenuItem onClick={onConfigure}>Configure</DropdownMenuItem>
            <DropdownMenuItem>View History</DropdownMenuItem>
            <DropdownMenuItem>Export Data</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Reading */}
      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold tracking-tight text-foreground">
            {reading.value}
          </span>
          <span className="text-sm text-muted-foreground">{reading.unit}</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <TrendIcon
            className={cn(
              "size-3.5",
              trend === "up" && "text-green-500",
              trend === "down" && "text-red-500",
              trend === "stable" && "text-muted-foreground"
            )}
          />
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
        </div>
      </div>

      {/* Sparkline */}
      {sparklineData.length > 0 && (
        <div className="mb-4 h-10">
          <Sparkline data={sparklineData} status={status} />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-1.5">
          <div className={cn("size-2 rounded-full", statusInfo.color)} />
          <span className="text-xs text-muted-foreground">{statusInfo.label}</span>
        </div>
        <span className="text-[10px] text-muted-foreground">{location}</span>
      </div>

      {/* Last Updated */}
      <div className="mt-2 text-right">
        <span className="text-[10px] text-muted-foreground/60">
          Updated {reading.timestamp}
        </span>
      </div>
    </div>
  )
}

interface SparklineProps {
  data: number[]
  status: SensorStatus
}

function Sparkline({ data, status }: SparklineProps) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const height = 40
  const width = 100

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width
      const y = height - ((value - min) / range) * height
      return `${x},${y}`
    })
    .join(" ")

  const strokeColor = {
    online: "#0047FF",
    warning: "#f59e0b",
    offline: "#ef4444",
    maintenance: "#0ea5e9",
  }[status]

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-full w-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`gradient-${status}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#gradient-${status})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
