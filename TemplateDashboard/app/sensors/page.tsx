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
  KronosBadge,
  KronosTable,
  type KronosColumn,
} from "@/components/kronos"
import {
  Download,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Grid3X3,
  List,
} from "lucide-react"

// Sensor data
const sensors = [
  {
    id: "SN-0042",
    name: "Foundation Sensor A1",
    type: "temperature" as const,
    status: "online" as const,
    location: "Tower A - Foundation",
    reading: { value: 24.5, unit: "°C", timestamp: "2 min ago" },
    trend: "up" as const,
    trendValue: "+0.3°C",
    sparklineData: [22, 23, 22.5, 23.5, 24, 24.5, 24, 24.2, 24.5],
    project: "Riverfront Tower",
    lastCalibration: "2024-01-15",
  },
  {
    id: "SN-0087",
    name: "Column Sensor B3",
    type: "humidity" as const,
    status: "warning" as const,
    location: "Tower B - Level 3",
    reading: { value: 78, unit: "%", timestamp: "5 min ago" },
    trend: "up" as const,
    trendValue: "+5%",
    sparklineData: [65, 68, 72, 75, 73, 76, 78],
    project: "Riverfront Tower",
    lastCalibration: "2024-01-10",
  },
  {
    id: "SN-0123",
    name: "Slab Sensor C5",
    type: "pressure" as const,
    status: "online" as const,
    location: "Tower A - Level 5",
    reading: { value: 1.02, unit: "MPa", timestamp: "1 min ago" },
    trend: "stable" as const,
    trendValue: "Stable",
    sparklineData: [1.01, 1.02, 1.01, 1.02, 1.02, 1.02, 1.02],
    project: "Downtown Plaza",
    lastCalibration: "2024-01-20",
  },
  {
    id: "SN-0156",
    name: "Beam Sensor D2",
    type: "strain" as const,
    status: "offline" as const,
    location: "Tower C - Level 2",
    reading: { value: 0, unit: "με", timestamp: "Offline" },
    trend: "down" as const,
    trendValue: "No data",
    sparklineData: [],
    project: "Riverside Complex",
    lastCalibration: "2024-01-05",
  },
  {
    id: "SN-0189",
    name: "Foundation Sensor A2",
    type: "temperature" as const,
    status: "online" as const,
    location: "Tower A - Foundation",
    reading: { value: 23.8, unit: "°C", timestamp: "1 min ago" },
    trend: "stable" as const,
    trendValue: "+0.1°C",
    sparklineData: [23.5, 23.6, 23.7, 23.6, 23.8, 23.7, 23.8],
    project: "Riverfront Tower",
    lastCalibration: "2024-01-18",
  },
  {
    id: "SN-0201",
    name: "Column Sensor B5",
    type: "strain" as const,
    status: "online" as const,
    location: "Tower B - Level 5",
    reading: { value: 245, unit: "με", timestamp: "3 min ago" },
    trend: "up" as const,
    trendValue: "+12με",
    sparklineData: [220, 225, 230, 235, 240, 242, 245],
    project: "Riverfront Tower",
    lastCalibration: "2024-01-12",
  },
  {
    id: "SN-0234",
    name: "Pile Sensor P1",
    type: "pressure" as const,
    status: "online" as const,
    location: "Foundation - Pile 1",
    reading: { value: 2.45, unit: "MPa", timestamp: "2 min ago" },
    trend: "stable" as const,
    trendValue: "Stable",
    sparklineData: [2.44, 2.45, 2.44, 2.45, 2.45, 2.45, 2.45],
    project: "Downtown Plaza",
    lastCalibration: "2024-01-22",
  },
  {
    id: "SN-0267",
    name: "Wall Sensor W3",
    type: "humidity" as const,
    status: "online" as const,
    location: "Tower A - Level 8",
    reading: { value: 62, unit: "%", timestamp: "4 min ago" },
    trend: "down" as const,
    trendValue: "-2%",
    sparklineData: [68, 67, 65, 64, 63, 62, 62],
    project: "Riverfront Tower",
    lastCalibration: "2024-01-08",
  },
]

type SensorData = typeof sensors[number]

const tableColumns: KronosColumn<SensorData>[] = [
  { key: "id", header: "Sensor ID", sortable: true },
  { key: "name", header: "Name", sortable: true },
  {
    key: "type",
    header: "Type",
    render: (value) => (
      <span className="capitalize">{String(value)}</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (value) => {
      const status = value as SensorData["status"]
      return (
        <KronosBadge
          variant={
            status === "online" ? "success" : status === "warning" ? "warning" : "danger"
          }
          size="sm"
          dot
          dotPulse={status === "warning"}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </KronosBadge>
      )
    },
  },
  { key: "location", header: "Location" },
  {
    key: "reading",
    header: "Current Reading",
    render: (value) => {
      const reading = value as SensorData["reading"]
      return (
        <span className="font-mono">
          {reading.value} {reading.unit}
        </span>
      )
    },
  },
  { key: "project", header: "Project", sortable: true },
]

export default function SensorsPage() {
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all-status")
  const [typeFilter, setTypeFilter] = React.useState("all-types")
  const [selectedRows, setSelectedRows] = React.useState<Set<number>>(new Set())

  const filteredSensors = sensors.filter((sensor) => {
    const matchesSearch =
      searchQuery === "" ||
      sensor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sensor.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all-status" || sensor.status === statusFilter
    const matchesType = typeFilter === "all-types" || sensor.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <KronosLayout title="Sensors" subtitle="Sensor Management">
      {/* Page Header */}
      <KronosPageHeader
        title="Sensor Management"
        description={`${filteredSensors.length} sensors across ${new Set(sensors.map(s => s.project)).size} projects`}
        actions={
          <>
            <KronosButton variant="outline" size="sm" leftIcon={<RefreshCw className="size-4" />}>
              Sync All
            </KronosButton>
            <KronosButton variant="outline" size="sm" leftIcon={<Download className="size-4" />}>
              Export
            </KronosButton>
            <KronosButton size="sm" leftIcon={<Plus className="size-4" />}>
              Add Sensor
            </KronosButton>
          </>
        }
      />

      {/* Filters */}
      <KronosCard padding="default" className="mb-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap items-end gap-4">
            <KronosInput
              placeholder="Search sensors..."
              leftIcon={<Search className="size-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
            <KronosSelect
              placeholder="All Status"
              value={statusFilter}
              onValueChange={setStatusFilter}
              options={[
                { value: "all-status", label: "All Status" },
                { value: "online", label: "Online" },
                { value: "warning", label: "Warning" },
                { value: "offline", label: "Offline" },
              ]}
              className="w-36"
            />
            <KronosSelect
              placeholder="All Types"
              value={typeFilter}
              onValueChange={setTypeFilter}
              options={[
                { value: "all-types", label: "All Types" },
                { value: "temperature", label: "Temperature" },
                { value: "humidity", label: "Humidity" },
                { value: "pressure", label: "Pressure" },
                { value: "strain", label: "Strain" },
              ]}
              className="w-40"
            />
            <KronosButton variant="outline" leftIcon={<Filter className="size-4" />}>
              More Filters
            </KronosButton>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 rounded-md border border-border p-1">
            <KronosButton
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="size-4" />
            </KronosButton>
            <KronosButton
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={() => setViewMode("list")}
            >
              <List className="size-4" />
            </KronosButton>
          </div>
        </div>
      </KronosCard>

      {/* Sensor Display */}
      {viewMode === "grid" ? (
        <KronosSection>
          <KronosGrid columns={4}>
            {filteredSensors.map((sensor) => (
              <KronosSensorCard key={sensor.id} {...sensor} />
            ))}
          </KronosGrid>
        </KronosSection>
      ) : (
        <KronosSection>
          <KronosTable
            columns={tableColumns}
            data={filteredSensors}
            selectable
            selectedRows={selectedRows}
            onSelectionChange={setSelectedRows}
            stickyHeader
          />
        </KronosSection>
      )}

      {/* Empty State */}
      {filteredSensors.length === 0 && (
        <KronosCard className="flex h-64 items-center justify-center">
          <div className="text-center">
            <Search className="mx-auto mb-4 size-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No sensors found matching your filters</p>
            <KronosButton variant="outline" className="mt-4" onClick={() => {
              setSearchQuery("")
              setStatusFilter("all-status")
              setTypeFilter("all-types")
            }}>
              Clear Filters
            </KronosButton>
          </div>
        </KronosCard>
      )}
    </KronosLayout>
  )
}
