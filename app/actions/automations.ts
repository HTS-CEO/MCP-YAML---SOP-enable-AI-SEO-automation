"use server"

import { prisma } from "@/lib/db"
import { getSession } from "@/lib/session"
import { generateSEOContent } from "@/lib/openai"
import { createWordPressPost } from "@/lib/wordpress"

export async function createAutomation(data: {
  clientId: string
  title: string
  description?: string
  uploadType: string
  service?: string
  location?: string
}) {
  const session = await getSession()

  if (!session) {
    throw new Error("Unauthorized")
  }

  // Verify client belongs to user
  const client = await prisma.client.findFirst({
    where: {
      id: data.clientId,
      userId: session.userId,
    },
  })

  if (!client) {
    throw new Error("Client not found")
  }

  // Create automation record
  const automation = await prisma.automation.create({
    data: {
      ...data,
      userId: session.userId,
      status: "processing",
    },
  })

  // Generate content asynchronously
  generateContentAsync(automation.id, data, client)

  return automation
}

async function generateContentAsync(
  automationId: string,
  data: {
    clientId: string
    title: string
    description?: string
    uploadType: string
    service?: string
    location?: string
  },
  client: any,
) {
  try {
    // Generate SEO content
    const generatedContent = await generateSEOContent(
      data.uploadType,
      data.description || data.title,
      data.service,
      data.location,
    )

    // Create blog post record
    const blogPost = await prisma.blogPost.create({
      data: {
        clientId: data.clientId,
        title: generatedContent.title,
        metaDescription: generatedContent.metaDescription,
        content: generatedContent.content,
        schemaJson: generatedContent.schemaJson,
        service: generatedContent.service,
        location: generatedContent.location,
      },
    })

    // Publish to WordPress if configured
    let wordpressPostId: string | undefined
    let wordpressPostUrl: string | undefined

    if (client.wordpressUrl && client.wordpressApiKey) {
      try {
        const wpResult = await createWordPressPost(client.wordpressUrl, client.wordpressApiKey, {
          title: generatedContent.title,
          content: generatedContent.content,
          excerpt: generatedContent.metaDescription,
          meta: {
            description: generatedContent.metaDescription,
            schema: generatedContent.schemaJson,
          },
        })

        if (wpResult.success) {
          wordpressPostId = wpResult.postId
          wordpressPostUrl = wpResult.postUrl

          // Update blog post with WordPress info
          await prisma.blogPost.update({
            where: { id: blogPost.id },
            data: {
              wordpressPostId,
              wordpressUrl: wordpressPostUrl,
              publishedAt: new Date(),
            },
          })
        }
      } catch (error) {
        console.error("Failed to publish to WordPress:", error)
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
      },
    })
  } catch (error) {
    console.error("Error in generateContentAsync:", error)

    // Update automation status to failed
    await prisma.automation.update({
      where: { id: automationId },
      data: {
        status: "failed",
      },
    })
  }
}

export async function getAutomations(clientId?: string) {
  const session = await getSession()

  if (!session) {
    throw new Error("Unauthorized")
  }

  const where: any = { userId: session.userId }

  if (clientId) {
    where.clientId = clientId
  }

  return prisma.automation.findMany({
    where,
    include: {
      client: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getAutomation(id: string) {
  const session = await getSession()

  if (!session) {
    throw new Error("Unauthorized")
  }

  return prisma.automation.findFirst({
    where: {
      id,
      userId: session.userId,
    },
    include: {
      client: true,
    },
  })
}
