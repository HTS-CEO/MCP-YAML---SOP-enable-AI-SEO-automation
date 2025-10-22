"use server"

import { prisma } from "@/lib/db"
import { getSession } from "@/lib/session"
import { createGBPPost } from "@/lib/gbp"
import { createWordPressPost } from "@/lib/wordpress"

export async function publishToGBP(automationId: string) {
  const session = await getSession()

  if (!session) {
    throw new Error("Unauthorized")
  }

  const automation = await prisma.automation.findFirst({
    where: {
      id: automationId,
      userId: session.userId,
    },
    include: {
      client: true,
    },
  })

  if (!automation) {
    throw new Error("Automation not found")
  }

  if (!automation.client.gbpBusinessId || !automation.client.gbpAccessToken) {
    throw new Error("GBP not configured for this client")
  }

  const generatedContent = automation.generatedContent ? JSON.parse(automation.generatedContent) : null

  if (!generatedContent) {
    throw new Error("No generated content found")
  }

  try {
    const result = await createGBPPost(automation.client.gbpBusinessId, automation.client.gbpAccessToken, {
      title: generatedContent.title,
      summary: generatedContent.metaDescription,
      callToAction: automation.client.website,
    })

    if (result.success) {
      await prisma.automation.update({
        where: { id: automationId },
        data: {
          gbpPostId: result.postId,
        },
      })

      return { success: true, postId: result.postId }
    } else {
      throw new Error(result.error)
    }
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export async function publishToWordPress(automationId: string) {
  const session = await getSession()

  if (!session) {
    throw new Error("Unauthorized")
  }

  const automation = await prisma.automation.findFirst({
    where: {
      id: automationId,
      userId: session.userId,
    },
    include: {
      client: true,
    },
  })

  if (!automation) {
    throw new Error("Automation not found")
  }

  if (!automation.client.wordpressUrl || !automation.client.wordpressApiKey) {
    throw new Error("WordPress not configured for this client")
  }

  const generatedContent = automation.generatedContent ? JSON.parse(automation.generatedContent) : null

  if (!generatedContent) {
    throw new Error("No generated content found")
  }

  try {
    const result = await createWordPressPost(automation.client.wordpressUrl, automation.client.wordpressApiKey, {
      title: generatedContent.title,
      content: generatedContent.content,
      excerpt: generatedContent.metaDescription,
      meta: {
        description: generatedContent.metaDescription,
        schema: generatedContent.schemaJson,
      },
    })

    if (result.success) {
      await prisma.automation.update({
        where: { id: automationId },
        data: {
          wordpressPostId: result.postId,
          wordpressPostUrl: result.postUrl,
        },
      })

      return { success: true, postId: result.postId, postUrl: result.postUrl }
    } else {
      throw new Error(result.error)
    }
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export async function getAutomationDetails(automationId: string) {
  const session = await getSession()

  if (!session) {
    throw new Error("Unauthorized")
  }

  return prisma.automation.findFirst({
    where: {
      id: automationId,
      userId: session.userId,
    },
    include: {
      client: true,
    },
  })
}
