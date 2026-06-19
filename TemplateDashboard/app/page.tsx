"use client"

import * as React from "react"
import {
  KronosLayout,
  KronosPageHeader,
  KronosGrid,
  KronosSection,
  KronosCard,
  KronosButton,
  KronosInput,
  KronosSelect,
  KronosSensorCard,
  KronosStatCard,
  KronosBadge,
  KronosTabs,
  KronosTabContent,
  KronosTable,
  type KronosColumn,
} from "@/components/kronos"
import {
  Activity,
  Box,
  Download,
  Filter,
  Plus,
  RefreshCw,
  Thermometer,
  Droplets,
  Zap,
  Users,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"

// Sample sensor data
const sensorData = [
  {
    id: "SN-0042",
    name: "Sensor Alpha",
    type: "temperature" as const,
    status: "online" as const,
    location: "Block A - Level 3",
    reading: { value: 24.5, unit: "°C", timestamp: "2 min ago" },
    trend: "up" as const,
    trendValue: "+0.3°C",
    sparklineData: [22, 23, 22.5, 23.5, 24, 24.5, 24, 24.2, 24.5],
  },
  {
    id: "SN-0087",
    name: "Sensor Beta",
    type: "humidity" as const,
    status: "warning" as const,
    location: "Block B - Level 1",
    reading: { value: 78, unit: "%", timestamp: "5 min ago" },
    trend: "up" as const,
    trendValue: "+5%",
    sparklineData: [65, 68, 72, 75, 73, 76, 78],
  },
  {
    id: "SN-0123",
    name: "Sensor Gamma",
    type: "pressure" as const,
    status: "online" as const,
    location: "Block A - Level 5",
    reading: { value: 1.02, unit: "MPa", timestamp: "1 min ago" },
    trend: "stable" as const,
    trendValue: "Stable",
    sparklineData: [1.01, 1.02, 1.01, 1.02, 1.02, 1.02, 1.02],
  },
  {
    id: "SN-0156",
    name: "Sensor Delta",
    type: "strain" as const,
    status: "offline" as const,
    location: "Block C - Level 2",
    reading: { value: 0, unit: "με", timestamp: "Offline" },
    trend: "down" as const,
    trendValue: "No data",
    sparklineData: [],
  },
]

// Table data
interface EventData {
  id: string
  sensor: string
  type: string
  message: string
  timestamp: string
  severity: "info" | "warning" | "error"
}

const eventData: EventData[] = [
  { id: "EVT-001", sensor: "SN-0087", type: "Threshold", message: "Humidity exceeded 75%", timestamp: "5 min ago", severity: "warning" },
  { id: "EVT-002", sensor: "SN-0156", type: "Connection", message: "Sensor went offline", timestamp: "12 min ago", severity: "error" },
  { id: "EVT-003", sensor: "SN-0042", type: "Reading", message: "Temperature updated", timestamp: "2 min ago", severity: "info" },
  { id: "EVT-004", sensor: "SN-0123", type: "Calibration", message: "Auto-calibration complete", timestamp: "1 hour ago", severity: "info" },
]

const eventColumns: KronosColumn<EventData>[] = [
  { key: "id", header: "Event ID", width: "100px" },
  { key: "sensor", header: "Sensor", sortable: true },
  { key: "type", header: "Type" },
  { key: "message", header: "Message" },
  {
    key: "severity",
    header: "Severity",
    render: (value) => {
      const severity = value as EventData["severity"]
      return (
        <KronosBadge
          variant={severity === "error" ? "danger" : severity === "warning" ? "warning" : "info"}
          size="sm"
          dot
        >
          {severity.charAt(0).toUpperCase() + severity.slice(1)}
        </KronosBadge>
      )
    },
  },
  { key: "timestamp", header: "Time", align: "right" },
]

export default function DashboardPage() {
  const [projectFilter, setProjectFilter] = React.useState("all")
  const [selectedRows, setSelectedRows] = React.useState<Set<number>>(new Set())

  return (
    <KronosLayout title="Dashboard" subtitle="Concrete Monitoring System">
      {/* Page Header */}
      <KronosPageHeader
        title="System Overview"
        description="Real-time sensor monitoring and analytics"
        actions={
          <>
            <KronosButton variant="outline" leftIcon={<RefreshCw className="size-4" />}>
              Refresh
            </KronosButton>
            <KronosButton variant="outline" leftIcon={<Download className="size-4" />}>
              Export
            </KronosButton>
            <KronosButton leftIcon={<Plus className="size-4" />}>
              Add Sensor
            </KronosButton>
          </>
        }
      />

      {/* Stats Overview */}
      <KronosSection className="mb-8">
        <KronosGrid columns={4}>
          <KronosStatCard
            label="Total Sensors"
            value={48}
            trend="up"
            trendValue="+3"
            trendLabel="this week"
            icon={Activity}
            iconColor="primary"
            sparklineData={[42, 43, 44, 45, 44, 46, 48]}
          />
          <KronosStatCard
            label="Active Projects"
            value={12}
            trend="stable"
            trendValue="0"
            trendLabel="change"
            icon={Box}
            iconColor="success"
          />
          <KronosStatCard
            label="Alerts"
            value={5}
            trend="down"
            trendValue="-2"
            trendLabel="vs yesterday"
            icon={AlertTriangle}
            iconColor="warning"
          />
          <KronosStatCard
            label="Team Members"
            value={24}
            icon={Users}
            iconColor="default"
          />
        </KronosGrid>
      </KronosSection>

      {/* Tabs */}
      <KronosTabs
        tabs={[
          { value: "sensors", label: "Sensors", badge: 48 },
          { value: "events", label: "Events", badge: 5 },
          { value: "analytics", label: "Analytics" },
          { value: "settings", label: "Settings" },
        ]}
        variant="default"
      >
        <KronosTabContent value="sensors">
          {/* Filters */}
          <KronosCard padding="default" className="mb-6">
            <div className="flex flex-wrap items-end gap-4">
              <KronosInput
                label="Search"
                placeholder="Search sensors..."
                className="w-64"
              />
              <KronosSelect
                label="Project"
                placeholder="All Projects"
                value={projectFilter}
                onValueChange={setProjectFilter}
                options={[
                  { value: "all", label: "All Projects" },
                  { value: "project-a", label: "Project Alpha" },
                  { value: "project-b", label: "Project Beta" },
                  { value: "project-c", label: "Project Gamma" },
                ]}
                className="w-48"
              />
              <KronosSelect
                label="Status"
                placeholder="All Status"
                options={[
                  { value: "all-status", label: "All Status" },
                  { value: "online", label: "Online" },
                  { value: "warning", label: "Warning" },
                  { value: "offline", label: "Offline" },
                ]}
                className="w-40"
              />
              <KronosButton variant="outline" leftIcon={<Filter className="size-4" />}>
                More Filters
              </KronosButton>
            </div>
          </KronosCard>

          {/* Sensor Grid */}
          <KronosSection title="Active Sensors" description="Real-time monitoring data">
            <KronosGrid columns={4}>
              {sensorData.map((sensor) => (
                <KronosSensorCard
                  key={sensor.id}
                  {...sensor}
                  onView={() => console.log("[v0] View sensor:", sensor.id)}
                  onConfigure={() => console.log("[v0] Configure sensor:", sensor.id)}
                />
              ))}
            </KronosGrid>
          </KronosSection>
        </KronosTabContent>

        <KronosTabContent value="events">
          <KronosSection title="Recent Events" description="System alerts and notifications">
            <KronosTable
              columns={eventColumns}
              data={eventData}
              selectable
              selectedRows={selectedRows}
              onSelectionChange={setSelectedRows}
              compact
            />
          </KronosSection>
        </KronosTabContent>

        <KronosTabContent value="analytics">
          <KronosCard className="flex h-64 items-center justify-center">
            <div className="text-center">
              <Activity className="mx-auto mb-4 size-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Analytics dashboard coming soon</p>
            </div>
          </KronosCard>
        </KronosTabContent>

        <KronosTabContent value="settings">
          <KronosCard className="flex h-64 items-center justify-center">
            <div className="text-center">
              <CheckCircle className="mx-auto mb-4 size-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Settings panel coming soon</p>
            </div>
          </KronosCard>
        </KronosTabContent>
      </KronosTabs>

      {/* Design System Showcase */}
      <div className="mt-12 border-t border-border pt-8">
        <KronosSection title="Design System" description="Component library showcase">
          <KronosGrid columns={2}>
            {/* Buttons */}
            <KronosCard>
              <h3 className="mb-4 text-sm font-semibold text-foreground">Buttons</h3>
              <div className="flex flex-wrap items-center gap-3">
                <KronosButton variant="primary">Primary</KronosButton>
                <KronosButton variant="secondary">Secondary</KronosButton>
                <KronosButton variant="outline">Outline</KronosButton>
                <KronosButton variant="ghost">Ghost</KronosButton>
                <KronosButton variant="danger">Danger</KronosButton>
                <KronosButton variant="primary" loading>Loading</KronosButton>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <KronosButton size="sm">Small</KronosButton>
                <KronosButton size="default">Default</KronosButton>
                <KronosButton size="lg">Large</KronosButton>
              </div>
            </KronosCard>

            {/* Badges */}
            <KronosCard>
              <h3 className="mb-4 text-sm font-semibold text-foreground">Badges</h3>
              <div className="flex flex-wrap items-center gap-3">
                <KronosBadge variant="default">Default</KronosBadge>
                <KronosBadge variant="primary">Primary</KronosBadge>
                <KronosBadge variant="success">Success</KronosBadge>
                <KronosBadge variant="warning">Warning</KronosBadge>
                <KronosBadge variant="danger">Danger</KronosBadge>
                <KronosBadge variant="info">Info</KronosBadge>
                <KronosBadge variant="outline">Outline</KronosBadge>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <KronosBadge variant="success" dot>With Dot</KronosBadge>
                <KronosBadge variant="warning" dot dotPulse>Pulsing</KronosBadge>
                <KronosBadge variant="primary" size="sm">Small</KronosBadge>
                <KronosBadge variant="primary" size="lg">Large</KronosBadge>
              </div>
            </KronosCard>

            {/* Form Elements */}
            <KronosCard className="col-span-2">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Form Elements</h3>
              <div className="grid grid-cols-3 gap-4">
                <KronosInput
                  label="Text Input"
                  placeholder="Enter value..."
                  hint="Helper text goes here"
                />
                <KronosInput
                  label="With Icon"
                  placeholder="Search..."
                  leftIcon={<Thermometer className="size-4" />}
                />
                <KronosInput
                  label="Error State"
                  placeholder="Invalid input"
                  error="This field is required"
                />
                <KronosSelect
                  label="Select"
                  placeholder="Choose option"
                  options={[
                    { value: "opt1", label: "Option 1" },
                    { value: "opt2", label: "Option 2" },
                    { value: "opt3", label: "Option 3" },
                  ]}
                />
                <KronosSelect
                  label="Grouped Select"
                  placeholder="Choose sensor type"
                  groups={[
                    {
                      label: "Environmental",
                      options: [
                        { value: "temp", label: "Temperature" },
                        { value: "humidity", label: "Humidity" },
                      ],
                    },
                    {
                      label: "Structural",
                      options: [
                        { value: "strain", label: "Strain" },
                        { value: "pressure", label: "Pressure" },
                      ],
                    },
                  ]}
                />
              </div>
            </KronosCard>
          </KronosGrid>
        </KronosSection>
      </div>
    </KronosLayout>
  )
}
