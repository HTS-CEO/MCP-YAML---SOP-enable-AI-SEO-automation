"use client"

import type React from "react"

import { useState } from "react"
import { createClient, updateClient } from "@/app/actions/clients"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ClientFormProps {
  client?: any
  onSuccess?: () => void
}

export function ClientForm({ client, onSuccess }: ClientFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: client?.name || "",
    website: client?.website || "",
    description: client?.description || "",
    wordpressUrl: client?.wordpressUrl || "",
    wordpressApiKey: client?.wordpressApiKey || "",
    gbpBusinessId: client?.gbpBusinessId || "",
    semrushApiKey: client?.semrushApiKey || "",
    ga4PropertyId: client?.ga4PropertyId || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (client?.id) {
        await updateClient(client.id, formData)
      } else {
        await createClient(formData)
      }
      onSuccess?.()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>}

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Client details and website information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Client Name
            </label>
            <Input
              id="name"
              placeholder="Acme Corp"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="website" className="text-sm font-medium">
              Website URL
            </label>
            <Input
              id="website"
              placeholder="https://example.com"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              placeholder="Client description and notes..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>Configure API keys for integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="wordpress" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="wordpress">WordPress</TabsTrigger>
              <TabsTrigger value="gbp">GBP</TabsTrigger>
              <TabsTrigger value="semrush">SEMrush</TabsTrigger>
              <TabsTrigger value="ga4">GA4</TabsTrigger>
            </TabsList>

            <TabsContent value="wordpress" className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="wordpressUrl" className="text-sm font-medium">
                  WordPress URL
                </label>
                <Input
                  id="wordpressUrl"
                  placeholder="https://blog.example.com"
                  value={formData.wordpressUrl}
                  onChange={(e) => setFormData({ ...formData, wordpressUrl: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="wordpressApiKey" className="text-sm font-medium">
                  WordPress API Key
                </label>
                <Input
                  id="wordpressApiKey"
                  type="password"
                  placeholder="Your WordPress API key"
                  value={formData.wordpressApiKey}
                  onChange={(e) => setFormData({ ...formData, wordpressApiKey: e.target.value })}
                />
              </div>
            </TabsContent>

            <TabsContent value="gbp" className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="gbpBusinessId" className="text-sm font-medium">
                  Google Business Profile ID
                </label>
                <Input
                  id="gbpBusinessId"
                  placeholder="Your GBP Business ID"
                  value={formData.gbpBusinessId}
                  onChange={(e) => setFormData({ ...formData, gbpBusinessId: e.target.value })}
                />
              </div>
            </TabsContent>

            <TabsContent value="semrush" className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="semrushApiKey" className="text-sm font-medium">
                  SEMrush API Key
                </label>
                <Input
                  id="semrushApiKey"
                  type="password"
                  placeholder="Your SEMrush API key"
                  value={formData.semrushApiKey}
                  onChange={(e) => setFormData({ ...formData, semrushApiKey: e.target.value })}
                />
              </div>
            </TabsContent>

            <TabsContent value="ga4" className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="ga4PropertyId" className="text-sm font-medium">
                  GA4 Property ID
                </label>
                <Input
                  id="ga4PropertyId"
                  placeholder="Your GA4 Property ID"
                  value={formData.ga4PropertyId}
                  onChange={(e) => setFormData({ ...formData, ga4PropertyId: e.target.value })}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Saving..." : client ? "Update Client" : "Create Client"}
      </Button>
    </form>
  )
}
