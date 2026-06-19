import type { ReactNode } from "react"
import { cn } from "../../lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs.tsx"

interface TabItem {
  value: string
  label: string
  badge?: string | number
  disabled?: boolean
}

interface KronosTabsProps {
  tabs: TabItem[]
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  children: ReactNode
  className?: string
  variant?: "default" | "underline" | "pills"
}

export function KronosTabs({
  tabs,
  defaultValue,
  value,
  onValueChange,
  children,
  className,
  variant = "default",
}: KronosTabsProps) {
  return (
    <Tabs
      defaultValue={defaultValue || tabs[0]?.value}
      value={value}
      onValueChange={onValueChange}
      className={cn("w-full", className)}
    >
      <TabsList
        className={cn(
          "h-auto w-full justify-start gap-0 bg-transparent p-0",
          variant === "default" && "border-b border-border",
          variant === "underline" && "border-b border-border",
          variant === "pills" && "gap-1 rounded-lg bg-muted p-1"
        )}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            className={cn(
              "relative gap-2 rounded-none font-medium transition-colors data-[disabled]:opacity-50",
              variant === "default" && [
                "h-10 border-b-2 border-transparent px-4 text-sm text-muted-foreground",
                "hover:text-foreground",
                "data-[state=active]:border-primary data-[state=active]:text-foreground",
              ],
              variant === "underline" && [
                "h-9 border-b-2 border-transparent px-3 text-xs uppercase tracking-wider text-muted-foreground",
                "hover:text-foreground",
                "data-[state=active]:border-primary data-[state=active]:text-primary",
              ],
              variant === "pills" && [
                "h-8 rounded-md px-3 text-sm text-muted-foreground",
                "hover:text-foreground",
                "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
              ]
            )}
          >
            {tab.label}
            {tab.badge !== undefined && (
              <span
                className={cn(
                  "ml-1.5 flex min-w-5 items-center justify-center rounded px-1 py-0.5 text-[10px] font-semibold",
                  variant === "pills"
                    ? "bg-muted-foreground/10 text-muted-foreground"
                    : "bg-primary/10 text-primary"
                )}
              >
                {tab.badge}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  )
}

interface KronosTabContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

export function KronosTabContent({ value, children, className }: KronosTabContentProps) {
  return (
    <TabsContent
      value={value}
      className={cn("mt-4 focus-visible:outline-none focus-visible:ring-0", className)}
    >
      {children}
    </TabsContent>
  )
}
