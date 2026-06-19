
import * as React from "react"
import {
  KronosLayout,
  KronosPageHeader,
  KronosGrid,
  KronosSection,
  KronosCard,
  KronosButton,
  KronosSensorCard,
  KronosStatCard,
  KronosTabs,
  KronosTabContent,
  KronosBadge,
} from "@/components/kronos"
import {
  Activity,
  Box,
  Download,
  Plus,
  RefreshCw,
  AlertTriangle,
  Users,
  Layers,
  TrendingUp,
  Clock,
  MapPin,
} from "lucide-react"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"

// Sample chart data
const chartData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  temperature: 20 + Math.random() * 8,
  humidity: 50 + Math.random() * 30,
  pressure: 1.0 + Math.random() * 0.05,
}))

// Sample sensor data
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
  },
]

// Activity data
const recentActivity = [
  { id: 1, type: "alert", message: "Humidity threshold exceeded on SN-0087", time: "5 min ago", severity: "warning" },
  { id: 2, type: "offline", message: "Sensor SN-0156 went offline", time: "12 min ago", severity: "error" },
  { id: 3, type: "update", message: "System firmware updated to v2.4.1", time: "1 hour ago", severity: "info" },
  { id: 4, type: "calibration", message: "Auto-calibration completed for 12 sensors", time: "2 hours ago", severity: "success" },
  { id: 5, type: "report", message: "Weekly analysis report generated", time: "3 hours ago", severity: "info" },
]

export default function DashboardPage() {
  return (
    <KronosLayout title="Dashboard" subtitle="Real-time Monitoring">
      {/* Page Header */}
      <KronosPageHeader
        title="Concrete Monitoring Dashboard"
        description="Project: Riverfront Tower Complex"
        actions={
          <>
            <KronosButton variant="outline" size="sm" leftIcon={<RefreshCw className="size-4" />}>
              Refresh
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

      {/* Stats Overview */}
      <KronosSection className="mb-6">
        <KronosGrid columns={4}>
          <KronosStatCard
            label="Total Sensors"
            value={156}
            trend="up"
            trendValue="+8"
            trendLabel="this month"
            icon={Activity}
            iconColor="primary"
            sparklineData={[140, 142, 145, 148, 150, 153, 156]}
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
            label="Active Alerts"
            value={7}
            trend="down"
            trendValue="-3"
            trendLabel="vs yesterday"
            icon={AlertTriangle}
            iconColor="warning"
          />
          <KronosStatCard
            label="Online Rate"
            value="98.2"
            unit="%"
            trend="up"
            trendValue="+0.5%"
            icon={TrendingUp}
            iconColor="success"
          />
        </KronosGrid>
      </KronosSection>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - 2/3 width */}
        <div className="space-y-6 lg:col-span-2">
          {/* Chart Section */}
          <KronosCard>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Sensor Readings</h3>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </div>
              <KronosTabs
                tabs={[
                  { value: "temp", label: "Temp" },
                  { value: "humidity", label: "Humidity" },
                  { value: "pressure", label: "Pressure" },
                ]}
                variant="pills"
                className="w-auto"
              >
                <KronosTabContent value="temp">
                  <></>
                </KronosTabContent>
                <KronosTabContent value="humidity">
                  <></>
                </KronosTabContent>
                <KronosTabContent value="pressure">
                  <></>
                </KronosTabContent>
              </KronosTabs>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0047FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0047FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="hour"
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}°`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                    labelStyle={{ color: "#94a3b8" }}
                    itemStyle={{ color: "#f1f5f9" }}
                  />
                  <Area
                    type="linear"
                    dataKey="temperature"
                    stroke="#0047FF"
                    strokeWidth={2}
                    fill="url(#colorTemp)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </KronosCard>

          {/* Sensors Grid */}
          <KronosSection title="Critical Sensors" description="Sensors requiring attention">
            <KronosGrid columns={3}>
              {sensors.slice(0, 6).map((sensor) => (
                <KronosSensorCard key={sensor.id} {...sensor} />
              ))}
            </KronosGrid>
          </KronosSection>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <KronosCard>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="size-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Structures</span>
                </div>
                <span className="text-sm font-semibold text-foreground">3 Towers</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Coverage</span>
                </div>
                <span className="text-sm font-semibold text-foreground">42 Zones</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Uptime</span>
                </div>
                <span className="text-sm font-semibold text-green-500">99.9%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Team</span>
                </div>
                <span className="text-sm font-semibold text-foreground">8 Active</span>
              </div>
            </div>
          </KronosCard>

          {/* Recent Activity */}
          <KronosCard>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
              <KronosButton variant="ghost" size="sm" className="text-xs text-primary">
                View All
              </KronosButton>
            </div>
            <div className="space-y-3">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div
                    className={`mt-1 size-2 shrink-0 rounded-full ${
                      item.severity === "error"
                        ? "bg-red-500"
                        : item.severity === "warning"
                          ? "bg-yellow-500"
                          : item.severity === "success"
                            ? "bg-green-500"
                            : "bg-blue-500"
                    }`}
                  />
                  <div className="flex-1 space-y-0.5">
                    <p className="text-xs text-foreground">{item.message}</p>
                    <p className="text-[10px] text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </KronosCard>

          {/* Sensor Health */}
          <KronosCard>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Sensor Health</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KronosBadge variant="success" dot size="sm">Online</KronosBadge>
                </div>
                <span className="text-sm font-semibold text-foreground">148</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KronosBadge variant="warning" dot size="sm">Warning</KronosBadge>
                </div>
                <span className="text-sm font-semibold text-foreground">5</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KronosBadge variant="danger" dot size="sm">Offline</KronosBadge>
                </div>
                <span className="text-sm font-semibold text-foreground">3</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KronosBadge variant="info" dot size="sm">Maintenance</KronosBadge>
                </div>
                <span className="text-sm font-semibold text-foreground">0</span>
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
              <div className="flex h-full">
                <div className="bg-green-500" style={{ width: "94.8%" }} />
                <div className="bg-yellow-500" style={{ width: "3.2%" }} />
                <div className="bg-red-500" style={{ width: "2%" }} />
              </div>
            </div>
          </KronosCard>
        </div>
      </div>
    </KronosLayout>
  )
}
