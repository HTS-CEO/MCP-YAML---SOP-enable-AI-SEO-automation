"use client"

import { useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AutomationDetails } from "@/components/automation-details"

export default function AutomationPage() {
  const params = useParams()

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Automation Details</h1>
          <p className="text-muted-foreground mt-2">View and manage content generation and publishing</p>
        </div>

        <AutomationDetails automationId={params.id as string} />
      </div>
    </DashboardLayout>
  )
}
