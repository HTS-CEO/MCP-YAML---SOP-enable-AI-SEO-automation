"use server"

import { prisma } from "@/lib/db"
import { getSession } from "@/lib/session"

export async function createClient(data: {
  name: string
  website: string
  description?: string
  wordpressUrl?: string
  wordpressApiKey?: string
  gbpBusinessId?: string
  semrushApiKey?: string
  ga4PropertyId?: string
}) {
  const session = await getSession()

  if (!session) {
    throw new Error("Unauthorized")
  }

  return prisma.client.create({
    data: {
      ...data,
      userId: session.userId,
    },
  })
}

export async function getClients() {
  const session = await getSession()

  if (!session) {
    throw new Error("Unauthorized")
  }

  return prisma.client.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  })
}

export async function getClient(id: string) {
  const session = await getSession()

  if (!session) {
    throw new Error("Unauthorized")
  }

  return prisma.client.findFirst({
    where: {
      id,
      userId: session.userId,
    },
  })
}

export async function updateClient(id: string, data: Partial<typeof data>) {
  const session = await getSession()

  if (!session) {
    throw new Error("Unauthorized")
  }

  const client = await getClient(id)

  if (!client) {
    throw new Error("Client not found")
  }

  return prisma.client.update({
    where: { id },
    data,
  })
}

export async function deleteClient(id: string) {
  const session = await getSession()

  if (!session) {
    throw new Error("Unauthorized")
  }

  const client = await getClient(id)

  if (!client) {
    throw new Error("Client not found")
  }

  return prisma.client.delete({
    where: { id },
  })
}
