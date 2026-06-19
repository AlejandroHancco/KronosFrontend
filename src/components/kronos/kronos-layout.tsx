import { useState } from "react"
import type { ReactNode } from "react"
import { cn } from "../../lib/utils"
import { KronosSidebar } from "./kronos-sidebar"
import { KronosTopNav } from "./kronos-top-nav"

interface KronosLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
  className?: string
}

export function KronosLayout({ children, title, subtitle, className }: KronosLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <KronosSidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          "transition-all duration-200",
          sidebarCollapsed ? "ml-16" : "ml-56"
        )}
      >
        {/* Top Navigation */}
        <KronosTopNav title={title} subtitle={subtitle} />

        {/* Page Content */}
        <main className={cn("p-6", className)}>
          {children}
        </main>
      </div>
    </div>
  )
}

/* Sub-components for layout structure */

interface KronosPageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

export function KronosPageHeader({ title, description, actions, className }: KronosPageHeaderProps) {
  return (
    <div className={cn("mb-6 flex items-start justify-between", className)}>
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

interface KronosGridProps {
  children: React.ReactNode
  columns?: 1 | 2 | 3 | 4
  className?: string
}

export function KronosGrid({ children, columns = 3, className }: KronosGridProps) {
  const colsClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  }[columns]

  return (
    <div className={cn("grid gap-4", colsClass, className)}>
      {children}
    </div>
  )
}

interface KronosSectionProps {
  title?: string
  description?: string
  children: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function KronosSection({ title, description, children, actions, className }: KronosSectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between">
          <div>
            {title && (
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-0.5 text-xs text-muted-foreground/70">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

interface KronosCardProps {
  children: ReactNode
  className?: string
  padding?: "none" | "sm" | "default" | "lg"
}

export function KronosCard({ children, className, padding = "default" }: KronosCardProps) {
  const paddingClass = {
    none: "",
    sm: "p-3",
    default: "p-4",
    lg: "p-6",
  }[padding]

  return (
    <div className={cn(
      "rounded-md border border-border bg-card",
      paddingClass,
      className
    )}>
      {children}
    </div>
  )
}
