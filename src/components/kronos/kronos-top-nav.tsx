import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { cn } from "../../lib/utils"
import {
  Search,
  Settings,
  User,
  LogOut,
  Moon,
  HelpCircle,
  ChevronDown,
} from "lucide-react"
import NotificationPanel from "../notifications/NotificationPanel"
import { Button } from "../ui/button.tsx"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu.tsx"
import { Avatar, AvatarFallback } from "../ui/avatar.tsx"
import { KronosInput } from "./kronos-input"
import { useAuth } from "../../hooks/useAuth"

interface KronosTopNavProps {
  title?: string
  subtitle?: string
  className?: string
}

export function KronosTopNav({ title, subtitle, className }: KronosTopNavProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const fullName = user ? `${user.name} ${user.lastName}` : "Usuario"
  const email = user?.email ?? ""
  const initials = user
      ? `${user.name?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
      : "U"

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
          <NotificationPanel />

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
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium md:block">{fullName}</span>
                <ChevronDown className="size-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{fullName}</p>
                  <p className="text-xs text-muted-foreground">{email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/profile")}>
                <User className="mr-2 size-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/settings")}>
                <Settings className="mr-2 size-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Moon className="mr-2 size-4" />
                Appearance
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                  className="text-red-400 focus:text-red-400 cursor-pointer font-semibold"
                  onClick={logout}
              >
                <LogOut className="mr-2 size-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
  )
}
