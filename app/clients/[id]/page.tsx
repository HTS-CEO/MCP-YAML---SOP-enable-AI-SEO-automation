"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ClientForm } from "@/components/client-form"
import { getClient } from "@/app/actions/clients"

export default function EditClientPage() {
  const router = useRouter()
  const params = useParams()
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const data = await getClient(params.id as string)
        setClient(data)
      } catch (error) {
        console.error("Failed to fetch client:", error)
        router.push("/clients")
      } finally {
        setLoading(false)
      }
    }

    fetchClient()
  }, [params.id, router])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center">Loading...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Client</h1>
          <p className="text-muted-foreground mt-2">Update client information and integrations</p>
        </div>

        {client && (
          <ClientForm
            client={client}
            onSuccess={() => {
              router.push("/clients")
            }}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
