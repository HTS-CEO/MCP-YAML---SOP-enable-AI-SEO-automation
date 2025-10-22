"use client"

import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ClientForm } from "@/components/client-form"

export default function NewClientPage() {
  const router = useRouter()

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add New Client</h1>
          <p className="text-muted-foreground mt-2">Create a new client and configure integrations</p>
        </div>

        <ClientForm
          onSuccess={() => {
            router.push("/clients")
          }}
        />
      </div>
    </DashboardLayout>
  )
}
