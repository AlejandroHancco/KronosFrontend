import { useEffect, useRef, useState } from "react"
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
  Box,
  Cpu,
  Users,
  ListChecks,
  Loader2,
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
import { useGlobalSearch } from "../../hooks/useGlobalSearch"
import type { SearchResult, SearchResultType } from "../../types/search.types"

const RESULT_TYPE_META: Record<SearchResultType, { label: string; icon: typeof Box }> = {
  project: { label: "Proyectos", icon: Box },
  device: { label: "Dispositivos", icon: Cpu },
  member: { label: "Miembros", icon: Users },
  task: { label: "Tareas", icon: ListChecks },
}

interface KronosTopNavProps {
  title?: string
  subtitle?: string
  className?: string
}

export function KronosTopNav({ title, subtitle, className }: KronosTopNavProps) {
  const [query, setQuery] = useState("")
  const [showResults, setShowResults] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const { data: results = [], isFetching: isSearching } = useGlobalSearch(query)
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!searchContainerRef.current?.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const groupedResults = results.reduce<Record<SearchResultType, SearchResult[]>>(
    (acc, r) => {
      acc[r.type] = acc[r.type] ? [...acc[r.type], r] : [r]
      return acc
    },
    {} as Record<SearchResultType, SearchResult[]>
  )

  const handleSelectResult = (result: SearchResult) => {
    navigate(result.href)
    setQuery("")
    setShowResults(false)
  }

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
          <div ref={searchContainerRef} className="relative hidden w-80 md:block">
            <KronosInput
                type="search"
                placeholder="Search"
                leftIcon={isSearching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setShowResults(true)
                }}
                onFocus={() => setShowResults(true)}
                className="h-8 text-xs"
            />

            {showResults && query.trim().length > 1 && (
                <div className="absolute left-0 top-full z-50 mt-1 max-h-96 w-full overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-lg">
                  {isSearching && results.length === 0 && (
                      <p className="px-3 py-4 text-center text-xs text-muted-foreground">Buscando...</p>
                  )}
                  {!isSearching && results.length === 0 && (
                      <p className="px-3 py-4 text-center text-xs text-muted-foreground">Sin resultados para "{query}"</p>
                  )}
                  {(Object.keys(groupedResults) as SearchResultType[]).map((type) => {
                    const meta = RESULT_TYPE_META[type]
                    const Icon = meta.icon
                    return (
                        <div key={type} className="mb-1">
                          <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {meta.label}
                          </p>
                          {groupedResults[type].map((result) => (
                              <button
                                  key={`${result.type}-${result.id}`}
                                  type="button"
                                  onClick={() => handleSelectResult(result)}
                                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                              >
                                <Icon className="size-3.5 shrink-0 text-muted-foreground" />
                                <span className="min-w-0 flex-1 truncate text-foreground">{result.label}</span>
                                {result.subtitle && (
                                    <span className="shrink-0 truncate text-[10px] text-muted-foreground">{result.subtitle}</span>
                                )}
                              </button>
                          ))}
                        </div>
                    )
                  })}
                </div>
            )}
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
