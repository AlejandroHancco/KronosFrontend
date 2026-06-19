"use client"

import * as React from "react"
import {
  KronosLayout,
  KronosPageHeader,
  KronosCard,
  KronosButton,
  KronosInput,
  KronosSelect,
  KronosTabs,
  KronosTabContent,
  KronosBadge,
} from "@/components/kronos"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Save, Bell, Shield, Database, Palette, Globe, Mail } from "lucide-react"

export default function SettingsPage() {
  return (
    <KronosLayout title="Settings" subtitle="System Configuration">
      <KronosPageHeader
        title="Settings"
        description="Configure your KRONOS platform settings"
      />

      <KronosTabs
        tabs={[
          { value: "general", label: "General" },
          { value: "notifications", label: "Notifications" },
          { value: "security", label: "Security" },
          { value: "integrations", label: "Integrations" },
        ]}
        variant="underline"
      >
        {/* General Settings */}
        <KronosTabContent value="general">
          <div className="grid gap-6 lg:grid-cols-2">
            <KronosCard>
              <div className="mb-4 flex items-center gap-2">
                <Globe className="size-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Platform Settings</h3>
              </div>
              <div className="space-y-4">
                <KronosInput
                  label="Organization Name"
                  defaultValue="KRONOS Engineering"
                />
                <KronosSelect
                  label="Timezone"
                  defaultValue="utc-5"
                  options={[
                    { value: "utc-8", label: "Pacific Time (UTC-8)" },
                    { value: "utc-5", label: "Eastern Time (UTC-5)" },
                    { value: "utc+0", label: "UTC" },
                    { value: "utc+1", label: "Central European (UTC+1)" },
                  ]}
                />
                <KronosSelect
                  label="Date Format"
                  defaultValue="mdy"
                  options={[
                    { value: "mdy", label: "MM/DD/YYYY" },
                    { value: "dmy", label: "DD/MM/YYYY" },
                    { value: "ymd", label: "YYYY-MM-DD" },
                  ]}
                />
                <KronosSelect
                  label="Temperature Unit"
                  defaultValue="celsius"
                  options={[
                    { value: "celsius", label: "Celsius (°C)" },
                    { value: "fahrenheit", label: "Fahrenheit (°F)" },
                  ]}
                />
              </div>
            </KronosCard>

            <KronosCard>
              <div className="mb-4 flex items-center gap-2">
                <Palette className="size-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Appearance</h3>
              </div>
              <div className="space-y-4">
                <KronosSelect
                  label="Theme"
                  defaultValue="dark"
                  options={[
                    { value: "dark", label: "Dark" },
                    { value: "light", label: "Light" },
                    { value: "system", label: "System" },
                  ]}
                />
                <KronosSelect
                  label="Density"
                  defaultValue="comfortable"
                  options={[
                    { value: "compact", label: "Compact" },
                    { value: "comfortable", label: "Comfortable" },
                    { value: "spacious", label: "Spacious" },
                  ]}
                />
                <div className="flex items-center justify-between">
                  <Label htmlFor="animations" className="text-sm text-foreground">
                    Enable animations
                  </Label>
                  <Switch id="animations" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="tooltips" className="text-sm text-foreground">
                    Show tooltips
                  </Label>
                  <Switch id="tooltips" defaultChecked />
                </div>
              </div>
            </KronosCard>
          </div>

          <div className="mt-6 flex justify-end">
            <KronosButton leftIcon={<Save className="size-4" />}>
              Save Changes
            </KronosButton>
          </div>
        </KronosTabContent>

        {/* Notifications */}
        <KronosTabContent value="notifications">
          <KronosCard>
            <div className="mb-4 flex items-center gap-2">
              <Bell className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Notification Preferences</h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Alert Channels
                </h4>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-foreground">Email Notifications</Label>
                    <p className="text-xs text-muted-foreground">Receive alerts via email</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-foreground">Push Notifications</Label>
                    <p className="text-xs text-muted-foreground">Browser push notifications</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-foreground">SMS Alerts</Label>
                    <p className="text-xs text-muted-foreground">Critical alerts via SMS</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="space-y-4 border-t border-border pt-6">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Alert Types
                </h4>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-foreground">Threshold Exceeded</Label>
                    <p className="text-xs text-muted-foreground">When sensor readings exceed limits</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-foreground">Sensor Offline</Label>
                    <p className="text-xs text-muted-foreground">When sensors go offline</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-foreground">Daily Digest</Label>
                    <p className="text-xs text-muted-foreground">Daily summary of all activity</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </KronosCard>

          <div className="mt-6 flex justify-end">
            <KronosButton leftIcon={<Save className="size-4" />}>
              Save Changes
            </KronosButton>
          </div>
        </KronosTabContent>

        {/* Security */}
        <KronosTabContent value="security">
          <div className="grid gap-6 lg:grid-cols-2">
            <KronosCard>
              <div className="mb-4 flex items-center gap-2">
                <Shield className="size-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Security Settings</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-foreground">Two-Factor Authentication</Label>
                    <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <KronosBadge variant="success" size="sm">Enabled</KronosBadge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-foreground">Session Timeout</Label>
                    <p className="text-xs text-muted-foreground">Auto-logout after inactivity</p>
                  </div>
                  <KronosSelect
                    defaultValue="30"
                    options={[
                      { value: "15", label: "15 minutes" },
                      { value: "30", label: "30 minutes" },
                      { value: "60", label: "1 hour" },
                      { value: "never", label: "Never" },
                    ]}
                    className="w-32"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-foreground">IP Allowlist</Label>
                    <p className="text-xs text-muted-foreground">Restrict access by IP</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </KronosCard>

            <KronosCard>
              <div className="mb-4 flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">API Access</h3>
              </div>
              <div className="space-y-4">
                <KronosInput
                  label="API Key"
                  defaultValue="kr_live_xxxxxxxxxxxx"
                  type="password"
                />
                <KronosButton variant="outline" className="w-full">
                  Regenerate API Key
                </KronosButton>
                <p className="text-xs text-muted-foreground">
                  Your API key provides full access to KRONOS data. Keep it secure.
                </p>
              </div>
            </KronosCard>
          </div>
        </KronosTabContent>

        {/* Integrations */}
        <KronosTabContent value="integrations">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Slack", description: "Send alerts to Slack channels", connected: true },
              { name: "Microsoft Teams", description: "Teams integration for alerts", connected: false },
              { name: "Jira", description: "Create tickets automatically", connected: true },
              { name: "Webhooks", description: "Custom webhook endpoints", connected: true },
              { name: "AWS S3", description: "Data backup storage", connected: false },
              { name: "Grafana", description: "Visualization dashboards", connected: false },
            ].map((integration) => (
              <KronosCard key={integration.name}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-md bg-muted">
                      <Database className="size-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{integration.name}</h4>
                      <p className="text-xs text-muted-foreground">{integration.description}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <KronosBadge
                    variant={integration.connected ? "success" : "default"}
                    size="sm"
                    dot
                  >
                    {integration.connected ? "Connected" : "Not Connected"}
                  </KronosBadge>
                  <KronosButton variant="outline" size="sm">
                    {integration.connected ? "Configure" : "Connect"}
                  </KronosButton>
                </div>
              </KronosCard>
            ))}
          </div>
        </KronosTabContent>
      </KronosTabs>
    </KronosLayout>
  )
}
