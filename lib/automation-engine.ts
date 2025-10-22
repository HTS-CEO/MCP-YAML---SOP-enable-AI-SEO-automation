import { prisma } from "@/lib/db"
import { generateSEOContent, generateReoptimizationContent } from "@/lib/openai"
import { createWordPressPost, createWordPressPortfolio, uploadWordPressMedia } from "@/lib/wordpress"
import { createGBPPost, uploadGBPPhoto } from "@/lib/gbp"
import { fetchSEMrushKeywords, trackKeywordRankings } from "@/lib/semrush"
import { fetchGA4Data } from "@/lib/ga4"
import fs from "fs"
import path from "path"

interface AutomationConfig {
  clientId: string
  wordpressEnabled: boolean
  gbpEnabled: boolean
  semrushEnabled: boolean
  ga4Enabled: boolean
  reoptimizationEnabled: boolean
}

interface ContentUpload {
  type: "photo" | "testimonial" | "project_notes"
  title: string
  description: string
  filePath?: string
  service?: string
  location?: string
}

export class AutomationEngine {
  private config: AutomationConfig

  constructor(config: AutomationConfig) {
    this.config = config
  }

  async processUpload(upload: ContentUpload): Promise<{ success: boolean; automationId?: string; error?: string }> {
    try {
      // Get client data
      const client = await prisma.client.findUnique({
        where: { id: this.config.clientId },
      })

      if (!client) {
        return { success: false, error: "Client not found" }
      }

      // Create automation record
      const automation = await prisma.automation.create({
        data: {
          userId: client.userId,
          clientId: this.config.clientId,
          title: upload.title,
          description: upload.description,
          uploadType: upload.type,
          service: upload.service,
          location: upload.location,
          status: "processing",
        },
      })

      // Process asynchronously
      this.processAutomationAsync(automation.id, upload, client)

      return { success: true, automationId: automation.id }
    } catch (error) {
      console.error("Error processing upload:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  private async processAutomationAsync(automationId: string, upload: ContentUpload, client: any) {
    try {
      // Generate AI content
      const generatedContent = await generateSEOContent(
        upload.type,
        upload.description,
        upload.service,
        upload.location
      )

      // Create blog post record
      const blogPost = await prisma.blogPost.create({
        data: {
          clientId: this.config.clientId,
          title: generatedContent.title,
          metaDescription: generatedContent.metaDescription,
          content: generatedContent.content,
          schemaJson: generatedContent.schemaJson,
          service: generatedContent.service,
          location: generatedContent.location,
        },
      })

      let wordpressPostId: string | undefined
      let wordpressPostUrl: string | undefined
      let gbpPostId: string | undefined

      // Publish to WordPress if enabled
      if (this.config.wordpressEnabled && client.wordpressUrl && client.wordpressApiKey) {
        try {
          let mediaId: number | undefined

          // Upload media if file provided
          if (upload.filePath && fs.existsSync(upload.filePath)) {
            const fileBuffer = fs.readFileSync(upload.filePath)
            const filename = path.basename(upload.filePath)
            const altText = `${upload.title} - ${upload.description}`

            const mediaResult = await uploadWordPressMedia(
              client.wordpressUrl,
              client.wordpressApiKey,
              fileBuffer,
              filename,
              altText
            )

            if (mediaResult.success) {
              mediaId = mediaResult.mediaId
            }
          }

          // Create post or portfolio based on type
          if (upload.type === "project_notes") {
            const result = await createWordPressPortfolio(client.wordpressUrl, client.wordpressApiKey, {
              title: generatedContent.title,
              content: generatedContent.content,
              excerpt: generatedContent.metaDescription,
              meta: {
                description: generatedContent.metaDescription,
                schema: generatedContent.schemaJson,
              },
              featured_media: mediaId,
              acf: {
                service: upload.service,
                location: upload.location,
                project_date: new Date().toISOString(),
              },
            })

            if (result.success) {
              wordpressPostId = result.postId
              wordpressPostUrl = result.postUrl

              await prisma.blogPost.update({
                where: { id: blogPost.id },
                data: {
                  wordpressPostId,
                  wordpressUrl: wordpressPostUrl,
                  publishedAt: new Date(),
                },
              })
            }
          } else {
            const result = await createWordPressPost(client.wordpressUrl, client.wordpressApiKey, {
              title: generatedContent.title,
              content: generatedContent.content,
              excerpt: generatedContent.metaDescription,
              meta: {
                description: generatedContent.metaDescription,
                schema: generatedContent.schemaJson,
              },
              featured_media: mediaId,
            })

            if (result.success) {
              wordpressPostId = result.postId
              wordpressPostUrl = result.postUrl

              await prisma.blogPost.update({
                where: { id: blogPost.id },
                data: {
                  wordpressPostId,
                  wordpressUrl: wordpressPostUrl,
                  publishedAt: new Date(),
                },
              })
            }
          }
        } catch (error) {
          console.error("Failed to publish to WordPress:", error)
        }
      }

      // Publish to GBP if enabled
      if (this.config.gbpEnabled && client.gbpBusinessId && client.gbpAccessToken && generatedContent.gbpSummary) {
        try {
          let imageUrl: string | undefined

          // Upload photo to GBP if file provided
          if (upload.filePath && upload.type === "photo" && fs.existsSync(upload.filePath)) {
            const fileBuffer = fs.readFileSync(upload.filePath)
            const filename = path.basename(upload.filePath)

            // For GBP, we'd need to upload to a public URL first, then use that URL
            // This is a simplified version - in production, upload to cloud storage first
            imageUrl = `https://example.com/uploads/${filename}` // Placeholder
          }

          const result = await createGBPPost(client.gbpBusinessId, client.gbpAccessToken, {
            title: generatedContent.title,
            summary: generatedContent.gbpSummary,
            imageUrl,
            hashtags: generatedContent.hashtags,
            callToAction: wordpressPostUrl || client.website,
          })

          if (result.success) {
            gbpPostId = result.postId
          }
        } catch (error) {
          console.error("Failed to publish to GBP:", error)
        }
      }

      // Update automation status
      await prisma.automation.update({
        where: { id: automationId },
        data: {
          status: "completed",
          generatedContent: JSON.stringify(generatedContent),
          wordpressPostId,
          wordpressPostUrl,
          gbpPostId,
        },
      })

    } catch (error) {
      console.error("Error in processAutomationAsync:", error)

      await prisma.automation.update({
        where: { id: automationId },
        data: {
          status: "failed",
        },
      })
    }
  }

  async checkReoptimizationTriggers(): Promise<void> {
    if (!this.config.reoptimizationEnabled || !this.config.semrushEnabled) {
      return
    }

    try {
      const client = await prisma.client.findUnique({
        where: { id: this.config.clientId },
      })

      if (!client?.semrushApiKey) {
        return
      }

      // Get keywords that need monitoring
      const keywords = await prisma.keyword.findMany({
        where: { clientId: this.config.clientId },
        orderBy: { lastCheckedAt: "desc" },
      })

      if (keywords.length === 0) {
        return
      }

      // Fetch current rankings
      const currentRankings = await trackKeywordRankings(
        client.semrushApiKey,
        client.website,
        keywords.map(k => k.keyword)
      )

      // Check for ranking drops and trigger re-optimization
      for (const ranking of currentRankings) {
        const keyword = keywords.find(k => k.keyword === ranking.keyword)
        if (!keyword) continue

        const rankDrop = (keyword.currentRank || 100) - ranking.currentRank
        const significantDrop = rankDrop >= 5 // Configurable threshold

        if (significantDrop) {
          await this.triggerReoptimization(keyword, ranking, rankDrop)
        }

        // Update keyword ranking
        await prisma.keyword.update({
          where: {
            clientId_keyword: {
              clientId: this.config.clientId,
              keyword: ranking.keyword,
            },
          },
          data: {
            previousRank: keyword.currentRank,
            currentRank: ranking.currentRank,
            lastCheckedAt: new Date(),
          },
        })
      }
    } catch (error) {
      console.error("Error checking re-optimization triggers:", error)
    }
  }

  private async triggerReoptimization(keyword: any, currentRanking: any, rankDrop: number): Promise<void> {
    try {
      // Find recent blog posts related to this keyword
      const relatedPosts = await prisma.blogPost.findMany({
        where: {
          clientId: this.config.clientId,
          OR: [
            { title: { contains: keyword.keyword } },
            { content: { contains: keyword.keyword } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      })

      for (const post of relatedPosts) {
        const originalContent = {
          title: post.title,
          metaDescription: post.metaDescription || "",
          content: post.content,
          schemaJson: post.schemaJson || "",
          service: post.service,
          location: post.location,
        }

        // Generate re-optimized content
        const reoptimizedContent = await generateReoptimizationContent(
          originalContent,
          rankDrop,
          keyword.keyword,
          currentRanking.currentRank,
          keyword.currentRank || 10
        )

        // Update the blog post
        await prisma.blogPost.update({
          where: { id: post.id },
          data: {
            title: reoptimizedContent.title,
            metaDescription: reoptimizedContent.metaDescription,
            content: reoptimizedContent.content,
            schemaJson: post.schemaJson, // Could be updated with new schema
            updatedAt: new Date(),
          },
        })

        // Update WordPress if connected
        const client = await prisma.client.findUnique({
          where: { id: this.config.clientId },
        })

        if (client?.wordpressUrl && client.wordpressApiKey && post.wordpressPostId) {
          try {
            await createWordPressPost(client.wordpressUrl, client.wordpressApiKey, {
              title: reoptimizedContent.title,
              content: reoptimizedContent.content,
              excerpt: reoptimizedContent.metaDescription,
              meta: {
                description: reoptimizedContent.metaDescription,
                schema: post.schemaJson,
                reoptimization_reason: reoptimizedContent.reason,
                reoptimization_improvements: JSON.stringify(reoptimizedContent.improvements),
              },
            })
          } catch (error) {
            console.error("Failed to update WordPress post:", error)
          }
        }
      }
    } catch (error) {
      console.error("Error triggering re-optimization:", error)
    }
  }

  async generateMonthlyReport(): Promise<{ success: boolean; reportData?: any; error?: string }> {
    try {
      const client = await prisma.client.findUnique({
        where: { id: this.config.clientId },
      })

      if (!client) {
        return { success: false, error: "Client not found" }
      }

      const reportData = {
        clientName: client.name,
        website: client.website,
        period: new Date().toISOString().slice(0, 7), // YYYY-MM
        generatedAt: new Date(),
      }

      // GA4 Analytics
      if (this.config.ga4Enabled && client.ga4PropertyId && client.ga4AccessToken) {
        const ga4Data = await fetchGA4Data(client.ga4PropertyId, client.ga4AccessToken, 30)
        reportData.ga4Analytics = {
          totalSessions: ga4Data.reduce((sum, d) => sum + d.sessions, 0),
          totalUsers: ga4Data.reduce((sum, d) => sum + d.users, 0),
          totalPageViews: ga4Data.reduce((sum, d) => sum + d.pageViews, 0),
          avgBounceRate: ga4Data.reduce((sum, d) => sum + d.bounceRate, 0) / ga4Data.length,
          avgSessionDuration: ga4Data.reduce((sum, d) => sum + d.avgSessionDuration, 0) / ga4Data.length,
          totalConversions: ga4Data.reduce((sum, d) => sum + d.conversions, 0),
        }
      }

      // SEMrush Rankings
      if (this.config.semrushEnabled && client.semrushApiKey) {
        const keywords = await prisma.keyword.findMany({
          where: { clientId: this.config.clientId },
        })

        reportData.keywordRankings = keywords.map(k => ({
          keyword: k.keyword,
          currentRank: k.currentRank,
          previousRank: k.previousRank,
          searchVolume: k.searchVolume,
          difficulty: k.difficulty,
        }))
      }

      // Content Performance
      const blogPosts = await prisma.blogPost.findMany({
        where: { clientId: this.config.clientId },
        orderBy: { createdAt: "desc" },
        take: 10,
      })

      reportData.contentPerformance = blogPosts.map(p => ({
        title: p.title,
        publishedAt: p.publishedAt,
        wordpressUrl: p.wordpressUrl,
        service: p.service,
        location: p.location,
      }))

      // Automations Summary
      const automations = await prisma.automation.findMany({
        where: { clientId: this.config.clientId },
        orderBy: { createdAt: "desc" },
      })

      reportData.automationSummary = {
        totalAutomations: automations.length,
        completedAutomations: automations.filter(a => a.status === "completed").length,
        failedAutomations: automations.filter(a => a.status === "failed").length,
        recentUploads: automations.slice(0, 5).map(a => ({
          title: a.title,
          type: a.uploadType,
          status: a.status,
          createdAt: a.createdAt,
        })),
      }

      return { success: true, reportData }
    } catch (error) {
      console.error("Error generating monthly report:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }
}