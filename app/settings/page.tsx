"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save } from "lucide-react"

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState({
    openai: "",
    semrush: "",
    ga4: "",
  })

  const handleSave = () => {
    // TODO: Save API keys to database
    console.log("Saving API keys:", apiKeys)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage API keys and system configuration</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>Configure integrations with external services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="openai" className="text-sm font-medium text-foreground">
                OpenAI API Key
              </label>
              <Input
                id="openai"
                type="password"
                placeholder="sk-..."
                value={apiKeys.openai}
                onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Used for AI content generation</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="semrush" className="text-sm font-medium text-foreground">
                SEMrush API Key
              </label>
              <Input
                id="semrush"
                type="password"
                placeholder="Your SEMrush API key"
                value={apiKeys.semrush}
                onChange={(e) => setApiKeys({ ...apiKeys, semrush: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Used for keyword ranking data</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="ga4" className="text-sm font-medium text-foreground">
                GA4 Access Token
              </label>
              <Input
                id="ga4"
                type="password"
                placeholder="Your GA4 access token"
                value={apiKeys.ga4}
                onChange={(e) => setApiKeys({ ...apiKeys, ga4: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Used for traffic and conversion data</p>
            </div>

            <Button onClick={handleSave} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
