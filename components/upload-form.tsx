"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createAutomation, getAutomations } from "@/app/actions/automations"
import { getClients } from "@/app/actions/clients"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UploadIcon, CheckCircle, AlertCircle, Loader } from "lucide-react"

export function UploadForm() {
  const [clients, setClients] = useState<any[]>([])
  const [selectedClient, setSelectedClient] = useState("")
  const [uploadType, setUploadType] = useState("photo")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [service, setService] = useState("")
  const [location, setLocation] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [automations, setAutomations] = useState<any[]>([])

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await getClients()
        setClients(data)
        if (data.length > 0) {
          setSelectedClient(data[0].id)
        }
      } catch (err) {
        console.error("Failed to fetch clients:", err)
      }
    }

    const fetchAutomations = async () => {
      try {
        const data = await getAutomations()
        setAutomations(data)
      } catch (err) {
        console.error("Failed to fetch automations:", err)
      }
    }

    fetchClients()
    fetchAutomations()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setLoading(true)

    try {
      await createAutomation({
        clientId: selectedClient,
        title,
        description,
        uploadType,
        service: service || undefined,
        location: location || undefined,
      })

      setSuccess(true)
      setTitle("")
      setDescription("")
      setService("")
      setLocation("")

      // Refresh automations
      const data = await getAutomations()
      setAutomations(data)

      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>New Upload</CardTitle>
          <CardDescription>Upload content to generate SEO-optimized blog posts</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>}

            {success && (
              <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Content generation started! Check back soon for results.
              </div>
            )}

            <div className="space-y-3">
              <label htmlFor="client" className="text-sm font-medium text-foreground">
                Select Client
              </label>
              <select
                id="client"
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                required
              >
                <option value="">Choose a client...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Content Type</label>
              <div className="grid grid-cols-3 gap-3">
                {["photo", "testimonial", "project_notes"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setUploadType(type)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      uploadType === type ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="font-medium text-foreground capitalize text-sm">{type.replace("_", " ")}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-foreground">
                Title
              </label>
              <Input
                id="title"
                placeholder="Content title or project name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-foreground">
                Description
              </label>
              <textarea
                id="description"
                placeholder="Detailed description of the content..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="service" className="text-sm font-medium text-foreground">
                  Service (Optional)
                </label>
                <Input
                  id="service"
                  placeholder="e.g., Web Design"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium text-foreground">
                  Location (Optional)
                </label>
                <Input
                  id="location"
                  placeholder="e.g., New York"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading || !selectedClient}>
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <UploadIcon className="w-4 h-4 mr-2" />
                  Generate Content
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recent Automations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
          <CardDescription>Latest content generation requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {automations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No uploads yet</p>
            ) : (
              automations.slice(0, 5).map((automation) => (
                <div key={automation.id} className="flex items-start gap-3 p-3 border border-border rounded-lg">
                  <div className="mt-1">
                    {automation.status === "completed" && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {automation.status === "processing" && <Loader className="w-5 h-5 text-blue-600 animate-spin" />}
                    {automation.status === "failed" && <AlertCircle className="w-5 h-5 text-red-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{automation.title}</p>
                    <p className="text-sm text-muted-foreground">{automation.client.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(automation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      automation.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : automation.status === "processing"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {automation.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
