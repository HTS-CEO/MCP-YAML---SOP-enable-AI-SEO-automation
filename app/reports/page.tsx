"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { getClients } from "@/app/actions/clients"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, ExternalLink } from "lucide-react"

export default function ReportsPage() {
  const searchParams = useSearchParams()
  const [clients, setClients] = useState<any[]>([])
  const [selectedClientId, setSelectedClientId] = useState("")

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await getClients()
        setClients(data)
        if (data.length > 0) {
          setSelectedClientId(data[0].id)
        }
      } catch (error) {
        console.error("Failed to fetch clients:", error)
      }
    }

    fetchClients()
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-2">View analytics and performance reports</p>
        </div>

        {/* Client Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select Client</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="">Choose a client...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {/* Analytics Dashboard */}
        {selectedClientId && <AnalyticsDashboard clientId={selectedClientId} />}

        {/* Looker Studio & Export */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Looker Studio</CardTitle>
              <CardDescription>View detailed dashboards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Access your Looker Studio dashboards for in-depth analytics and custom reports.
              </p>
              <Button variant="outline" className="w-full bg-transparent">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Looker Studio
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export Reports</CardTitle>
              <CardDescription>Download performance reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                Download Monthly Report
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                Download Keyword Rankings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
