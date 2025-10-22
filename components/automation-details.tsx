"use client"

import { useEffect, useState } from "react"
import { getAutomationDetails, publishToGBP, publishToWordPress } from "@/app/actions/integrations"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, Loader, ExternalLink } from "lucide-react"

interface AutomationDetailsProps {
  automationId: string
}

export function AutomationDetails({ automationId }: AutomationDetailsProps) {
  const [automation, setAutomation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState<string | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await getAutomationDetails(automationId)
        setAutomation(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [automationId])

  const handlePublishGBP = async () => {
    setPublishing("gbp")
    try {
      await publishToGBP(automationId)
      // Refresh automation details
      const data = await getAutomationDetails(automationId)
      setAutomation(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setPublishing(null)
    }
  }

  const handlePublishWordPress = async () => {
    setPublishing("wordpress")
    try {
      await publishToWordPress(automationId)
      // Refresh automation details
      const data = await getAutomationDetails(automationId)
      setAutomation(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setPublishing(null)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!automation) {
    return <div className="text-center py-8 text-destructive">Automation not found</div>
  }

  const generatedContent = automation.generatedContent ? JSON.parse(automation.generatedContent) : null

  return (
    <div className="space-y-6">
      {error && <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>}

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          {automation.status === "completed" && <CheckCircle className="w-5 h-5 text-green-600" />}
          {automation.status === "processing" && <Loader className="w-5 h-5 text-blue-600 animate-spin" />}
          {automation.status === "failed" && <AlertCircle className="w-5 h-5 text-red-600" />}
          <span className="font-medium capitalize">{automation.status}</span>
        </CardContent>
      </Card>

      {/* Generated Content */}
      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Content</CardTitle>
            <CardDescription>SEO-optimized blog post</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-foreground mb-2">Title</h3>
              <p className="text-sm text-muted-foreground">{generatedContent.title}</p>
            </div>

            <div>
              <h3 className="font-medium text-foreground mb-2">Meta Description</h3>
              <p className="text-sm text-muted-foreground">{generatedContent.metaDescription}</p>
            </div>

            <div>
              <h3 className="font-medium text-foreground mb-2">Content Preview</h3>
              <div className="p-3 bg-muted rounded-lg max-h-48 overflow-y-auto">
                <p className="text-sm text-muted-foreground line-clamp-6">{generatedContent.content}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Publishing Options */}
      <Card>
        <CardHeader>
          <CardTitle>Publish Content</CardTitle>
          <CardDescription>Publish to your integrations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* WordPress */}
          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
            <div>
              <p className="font-medium text-foreground">WordPress</p>
              <p className="text-sm text-muted-foreground">
                {automation.wordpressPostUrl ? "Published" : "Not published"}
              </p>
            </div>
            {automation.wordpressPostUrl ? (
              <a
                href={automation.wordpressPostUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                View <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <Button
                onClick={handlePublishWordPress}
                disabled={publishing === "wordpress" || !automation.client.wordpressUrl}
                size="sm"
              >
                {publishing === "wordpress" ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  "Publish"
                )}
              </Button>
            )}
          </div>

          {/* Google Business Profile */}
          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
            <div>
              <p className="font-medium text-foreground">Google Business Profile</p>
              <p className="text-sm text-muted-foreground">{automation.gbpPostId ? "Published" : "Not published"}</p>
            </div>
            {automation.gbpPostId ? (
              <span className="text-sm text-green-600 font-medium">Published</span>
            ) : (
              <Button
                onClick={handlePublishGBP}
                disabled={publishing === "gbp" || !automation.client.gbpBusinessId}
                size="sm"
              >
                {publishing === "gbp" ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  "Publish"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
