"use client"

import * as React from "react"
import {
  KronosLayout,
  KronosPageHeader,
  KronosGrid,
  KronosCard,
  KronosButton,
  KronosBadge,
} from "@/components/kronos"
import {
  Box,
  Plus,
  MoreHorizontal,
  Activity,
  MapPin,
  Users,
  Calendar,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"

const projects = [
  {
    id: "PRJ-001",
    name: "Riverfront Tower Complex",
    location: "Downtown District",
    status: "active",
    progress: 68,
    sensors: 48,
    team: 12,
    startDate: "2023-06-15",
    alerts: 2,
  },
  {
    id: "PRJ-002",
    name: "Downtown Plaza",
    location: "Central Business District",
    status: "active",
    progress: 42,
    sensors: 36,
    team: 8,
    startDate: "2023-09-01",
    alerts: 0,
  },
  {
    id: "PRJ-003",
    name: "Riverside Complex",
    location: "Riverside Area",
    status: "warning",
    progress: 85,
    sensors: 24,
    team: 6,
    startDate: "2023-03-20",
    alerts: 3,
  },
  {
    id: "PRJ-004",
    name: "Metro Station Extension",
    location: "North Transit Hub",
    status: "active",
    progress: 15,
    sensors: 18,
    team: 10,
    startDate: "2024-01-10",
    alerts: 0,
  },
  {
    id: "PRJ-005",
    name: "Harbor Bridge Renovation",
    location: "Harbor District",
    status: "completed",
    progress: 100,
    sensors: 42,
    team: 4,
    startDate: "2022-08-01",
    alerts: 0,
  },
  {
    id: "PRJ-006",
    name: "University Research Center",
    location: "Academic Quarter",
    status: "planning",
    progress: 0,
    sensors: 0,
    team: 3,
    startDate: "2024-03-01",
    alerts: 0,
  },
]

type ProjectStatus = "active" | "warning" | "completed" | "planning"

const statusConfig: Record<ProjectStatus, { variant: "success" | "warning" | "info" | "default"; label: string }> = {
  active: { variant: "success", label: "Active" },
  warning: { variant: "warning", label: "Needs Attention" },
  completed: { variant: "info", label: "Completed" },
  planning: { variant: "default", label: "Planning" },
}

export default function ProjectsPage() {
  return (
    <KronosLayout title="Projects" subtitle="Project Management">
      <KronosPageHeader
        title="Projects"
        description={`${projects.length} projects under management`}
        actions={
          <KronosButton leftIcon={<Plus className="size-4" />}>
            New Project
          </KronosButton>
        }
      />

      <KronosGrid columns={3}>
        {projects.map((project) => {
          const statusInfo = statusConfig[project.status as ProjectStatus]
          return (
            <KronosCard key={project.id} className="group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-md bg-primary/10">
                    <Box className="size-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{project.name}</h3>
                    <p className="text-xs text-muted-foreground">{project.id}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <KronosButton
                      variant="ghost"
                      size="icon-sm"
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <MoreHorizontal className="size-4" />
                    </KronosButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Edit Project</DropdownMenuItem>
                    <DropdownMenuItem>View Sensors</DropdownMenuItem>
                    <DropdownMenuItem>Generate Report</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="size-3.5" />
                  {project.location}
                </div>

                <div className="flex items-center justify-between">
                  <KronosBadge variant={statusInfo.variant} size="sm" dot>
                    {statusInfo.label}
                  </KronosBadge>
                  {project.alerts > 0 && (
                    <KronosBadge variant="danger" size="sm">
                      {project.alerts} Alerts
                    </KronosBadge>
                  )}
                </div>

                {project.status !== "planning" && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-foreground">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-1.5" />
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Activity className="size-3.5" />
                    {project.sensors} sensors
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="size-3.5" />
                    {project.team} members
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="size-3.5" />
                    {new Date(project.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </div>
                </div>
              </div>
            </KronosCard>
          )
        })}
      </KronosGrid>
    </KronosLayout>
  )
}
