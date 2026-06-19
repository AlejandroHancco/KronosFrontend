import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  Moon,
  HelpCircle,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { KronosInput } from "./kronos-input"

interface KronosTopNavProps {
  title?: string
  subtitle?: string
  className?: string
}

export function KronosTopNav({ title, subtitle, className }: KronosTopNavProps) {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      {/* Left: Title & Breadcrumb */}
      <div className="flex items-center gap-4">
        {title && (
          <div className="flex flex-col">
            <h1 className="text-sm font-semibold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className={cn(
          "hidden items-center transition-all md:flex",
          searchOpen ? "w-64" : "w-48"
        )}>
          <KronosInput
            type="search"
            placeholder="Search..."
            leftIcon={<Search className="size-4" />}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setSearchOpen(false)}
            className="h-8 text-xs"
          />
        </div>

        {/* Mobile Search */}
        <Button variant="ghost" size="icon-sm" className="md:hidden">
          <Search className="size-4" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="relative">
              <Bell className="size-4" />
              <span className="absolute right-1 top-1 size-2 rounded-full bg-primary" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider">Notifications</span>
              <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary hover:text-primary/80">
                Mark all read
              </Button>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-64 overflow-y-auto">
              <NotificationItem
                title="Sensor SN-0042 Alert"
                description="Temperature exceeded threshold"
                time="2 min ago"
                type="warning"
              />
              <NotificationItem
                title="New Report Generated"
                description="Weekly analysis complete"
                time="1 hour ago"
                type="info"
              />
              <NotificationItem
                title="System Update"
                description="v2.4.1 deployed successfully"
                time="3 hours ago"
                type="success"
              />
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-xs text-primary">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Help */}
        <Button variant="ghost" size="icon-sm">
          <HelpCircle className="size-4" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 gap-2 px-2">
              <Avatar className="size-6">
                <AvatarFallback className="bg-primary/20 text-xs font-medium text-primary">
                  JD
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium md:block">John Doe</span>
              <ChevronDown className="size-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-muted-foreground">john@kronos.io</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 size-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 size-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Moon className="mr-2 size-4" />
              Appearance
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

interface NotificationItemProps {
  title: string
  description: string
  time: string
  type: "info" | "warning" | "success" | "error"
}

function NotificationItem({ title, description, time, type }: NotificationItemProps) {
  const typeColors = {
    info: "bg-blue-500",
    warning: "bg-yellow-500",
    success: "bg-green-500",
    error: "bg-red-500",
  }

  return (
    <DropdownMenuItem className="flex cursor-pointer flex-col items-start gap-1 p-3">
      <div className="flex w-full items-start gap-2">
        <div className={cn("mt-1.5 size-2 shrink-0 rounded-full", typeColors[type])} />
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium leading-none">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <span className="ml-4 text-[10px] text-muted-foreground">{time}</span>
    </DropdownMenuItem>
  )
}
