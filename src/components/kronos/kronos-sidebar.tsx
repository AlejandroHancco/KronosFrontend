import { useState } from "react"
import { Link } from "react-router-dom"
import { useLocation } from "react-router-dom"
import { useGetCurrentTeam } from "../../hooks/useTeams"
import { useAuth } from "../../hooks/useAuth"
import { useNotifications } from "../../hooks/useNotifications"
import { cn } from "../../lib/utils"
import {
  LayoutDashboard,
  Activity,
  Calendar,
  Box,
  Settings,
  Users,
  FileText,
  Bell,
  History,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip.tsx"
import { Avatar, AvatarFallback } from "../ui/avatar.tsx"

interface NavItem {
  title: string
  href: string | null
  icon: LucideIcon
  badge?: string
  disabled?: boolean
}

interface NavGroup {
  title?: string
  items: NavItem[]
}

interface KronosSidebarProps {
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

export function KronosSidebar({ collapsed = false, onCollapsedChange }: KronosSidebarProps) {
  const { pathname } = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(collapsed)
  const { data: currentTeam } = useGetCurrentTeam()
  const { user } = useAuth()
  const { unreadCount } = useNotifications()

  const handleToggle = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    onCollapsedChange?.(newState)
  }

  const initials = user
    ? `${user.name?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "U"

  // Build navigation groups with dynamic team href
  const systemItems: NavItem[] = [
    { title: "Settings", href: "/settings", icon: Settings },
    { title: "Help", href: "/help", icon: HelpCircle },
  ]

  const navigationGroups: NavGroup[] = [
    {
      items: [
        { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { title: "Devices", href: "/sensors", icon: Activity },
        { title: "Calendar", href: "/calendar", icon: Calendar },
        { title: "Projects", href: "/projects", icon: Box },
        { title: "Reports", href: "/reports", icon: FileText },
      ],
    },
    {
      title: "MANAGEMENT",
      items: [
        {
          title: "Team",
          href: currentTeam?.id ? `/team/${currentTeam.id}` : null,
          icon: Users,
          disabled: !currentTeam?.id,
        },
        {
          title: "Notifications",
          href: "/notifications",
          icon: Bell,
          badge: unreadCount > 0 ? String(unreadCount > 9 ? '9+' : unreadCount) : undefined,
        },
        {
          title: "Activity",
          href: "/activity",
          icon: History,
        },
      ],
    },
    {
      title: "SYSTEM",
      items: systemItems,
    },
  ]


  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-200",
          isCollapsed ? "w-16" : "w-56"
        )}
      >
        {/* Toggle flotante sobre el borde derecho — posición fija, no pertenece a
            ninguna sección del sidebar (patrón VSCode/Notion/Linear) */}
        <button
          type="button"
          onClick={handleToggle}
          title={isCollapsed ? "Expandir" : "Colapsar"}
          className="absolute -right-3 top-1/2 z-50 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:border-primary hover:text-foreground"
        >
          {isCollapsed ? (
            <ChevronRight className="size-3.5" />
          ) : (
            <ChevronLeft className="size-3.5" />
          )}
        </button>

        {/* Logo */}
        <div className={cn(
          "flex h-14 items-center border-b border-border px-4",
          isCollapsed ? "justify-center" : "gap-3"
        )}>
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary">
            <span className="text-sm font-bold text-primary-foreground">K</span>
          </div>
          {!isCollapsed && (
            <span className="text-sm font-semibold tracking-tight text-foreground">KRONOS</span>
          )}
        </div>

         {/* Navigation */}
         <nav className="flex-1 space-y-6 overflow-y-auto p-3">
           {navigationGroups.map((group, groupIndex) => (
             <div key={groupIndex} className="space-y-1">
               {group.title && !isCollapsed && (
                 <h4 className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                   {group.title}
                 </h4>
               )}
               {group.items.map((item) => {
                 const isActive = item.href && (pathname === item.href || pathname?.startsWith(item.href + "/"))
                 const Icon = item.icon
                 const isDisabled = item.disabled || !item.href

                 if (isDisabled) {
                   return (
                     <div
                       key={item.title}
                       className={cn(
                         "group relative flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                         "text-muted-foreground/50 cursor-not-allowed opacity-50",
                         isCollapsed && "justify-center px-2"
                       )}
                       title={`${item.title} is not available`}
                     >
                       <Icon className={cn(
                         "size-4 shrink-0",
                         "text-muted-foreground/50"
                       )} />
                       {!isCollapsed && (
                         <>
                           <span className="truncate">{item.title}</span>
                           {item.badge && (
                             <span className="ml-auto flex size-5 items-center justify-center rounded bg-muted text-[10px] font-semibold text-muted-foreground">
                               {item.badge}
                             </span>
                           )}
                         </>
                       )}
                     </div>
                   )
                 }

                 const button = (
                   <Link
                     key={item.href}
                     to={item.href!}
                     className={cn(
                       "group relative flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                       isActive
                         ? "bg-primary/10 text-primary"
                         : "text-muted-foreground hover:bg-muted hover:text-foreground",
                       isCollapsed && "justify-center px-2"
                     )}
                   >
                     {/* Active indicator */}
                     {isActive && (
                       <div className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
                     )}
                     <Icon className={cn(
                       "size-4 shrink-0",
                       isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                     )} />
                     {!isCollapsed && (
                       <>
                         <span className="truncate">{item.title}</span>
                         {item.badge && (
                           <span className="ml-auto flex size-5 items-center justify-center rounded bg-primary text-[10px] font-semibold text-primary-foreground">
                             {item.badge}
                           </span>
                         )}
                       </>
                     )}
                     {isCollapsed && item.badge && (
                       <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground">
                         {item.badge}
                       </span>
                     )}
                   </Link>
                 )

                 if (isCollapsed) {
                   return (
                     <Tooltip key={item.href}>
                       <TooltipTrigger asChild>{button}</TooltipTrigger>
                       <TooltipContent side="right" className="flex items-center gap-2">
                         {item.title}
                         {item.badge && (
                           <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                             {item.badge}
                           </span>
                         )}
                       </TooltipContent>
                     </Tooltip>
                   )
                 }

                 return button
               })}
             </div>
           ))}
         </nav>

        {/* User Info */}
        {user && (
          <div className={cn(
            "border-t border-border px-3 py-2.5",
            isCollapsed ? "flex justify-center" : "flex items-center gap-2.5"
          )}>
            <Avatar className="size-7 shrink-0">
              <AvatarFallback className="bg-primary/20 text-[10px] font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-foreground">
                  {user.name} {user.lastName}
                </p>
                {user.role && (
                  <p className="truncate text-[10px] text-muted-foreground">{user.role}</p>
                )}
              </div>
            )}
          </div>
        )}

      </aside>
    </TooltipProvider>
  )
}
