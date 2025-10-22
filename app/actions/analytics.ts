"use server"

import { prisma } from "@/lib/db"
import { getSession } from "@/lib/session"
import { fetchGA4Data } from "@/lib/ga4"
import { fetchSEMrushKeywords } from "@/lib/semrush"

export async function syncAnalytics(clientId: string) {
  const session = await getSession()

  if (!session) {
    throw new Error("Unauthorized")
  }

  const client = await prisma.client.findFirst({
    where: {
      id: clientId,
      userId: session.userId,
    },
  })

  if (!client) {
    throw new Error("Client not found")
  }

  // Fetch GA4 data
  if (client.ga4PropertyId && client.ga4AccessToken) {
    try {
      const ga4Data = await fetchGA4Data(client.ga4PropertyId, client.ga4AccessToken)

      // Store analytics data
      for (const data of ga4Data) {
        const date = new Date(data.date.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"))

        await prisma.analytics.upsert({
          where: {
            clientId_date: {
              clientId,
              date,
            },
          },
          update: {
            sessions: data.sessions,
            users: data.users,
            pageViews: data.pageViews,
            bounceRate: data.bounceRate,
            avgSessionDuration: data.avgSessionDuration,
            conversions: data.conversions,
          },
          create: {
            clientId,
            date,
            sessions: data.sessions,
            users: data.users,
            pageViews: data.pageViews,
            bounceRate: data.bounceRate,
            avgSessionDuration: data.avgSessionDuration,
            conversions: data.conversions,
          },
        })
      }
    } catch (error) {
      console.error("Failed to sync GA4 data:", error)
    }
  }

  // Fetch SEMrush data
  if (client.semrushApiKey) {
    try {
      const keywords = await fetchSEMrushKeywords(client.semrushApiKey, client.website)

      // Store keyword data
      for (const kw of keywords) {
        await prisma.keyword.upsert({
          where: {
            clientId_keyword: {
              clientId,
              keyword: kw.keyword,
            },
          },
          update: {
            currentRank: kw.position,
            searchVolume: kw.searchVolume,
            difficulty: kw.difficulty,
            lastCheckedAt: new Date(),
          },
          create: {
            clientId,
            keyword: kw.keyword,
            currentRank: kw.position,
            searchVolume: kw.searchVolume,
            difficulty: kw.difficulty,
            lastCheckedAt: new Date(),
          },
        })
      }
    } catch (error) {
      console.error("Failed to sync SEMrush data:", error)
    }
  }
}

export async function getClientAnalytics(clientId: string, days = 30) {
  const session = await getSession()

  if (!session) {
    throw new Error("Unauthorized")
  }

  const client = await prisma.client.findFirst({
    where: {
      id: clientId,
      userId: session.userId,
    },
  })

  if (!client) {
    throw new Error("Client not found")
  }

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  return prisma.analytics.findMany({
    where: {
      clientId,
      date: {
        gte: startDate,
      },
    },
    orderBy: { date: "asc" },
  })
}

export async function getClientKeywords(clientId: string) {
  const session = await getSession()

  if (!session) {
    throw new Error("Unauthorized")
  }

  const client = await prisma.client.findFirst({
    where: {
      id: clientId,
      userId: session.userId,
    },
  })

  if (!client) {
    throw new Error("Client not found")
  }

  return prisma.keyword.findMany({
    where: { clientId },
    orderBy: { currentRank: "asc" },
  })
}

export async function getClientBlogPosts(clientId: string) {
  const session = await getSession()

  if (!session) {
    throw new Error("Unauthorized")
  }

  const client = await prisma.client.findFirst({
    where: {
      id: clientId,
      userId: session.userId,
    },
  })

  if (!client) {
    throw new Error("Client not found")
  }

  return prisma.blogPost.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
  })
}
