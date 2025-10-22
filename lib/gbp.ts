import axios from "axios"

interface GBPPost {
  title: string
  summary: string
  imageUrl?: string
  hashtags?: string[]
  callToAction?: string
}

interface GBPPhoto {
  imageUrl: string
  caption?: string
  category?: string
}

export async function createGBPPost(businessId: string, accessToken: string, post: GBPPost) {
  const client = axios.create({
    baseURL: "https://mybusiness.googleapis.com/v4",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  })

  try {
    const hashtags = post.hashtags ? post.hashtags.map(tag => `#${tag}`).join(' ') : ''
    const summary = `${post.summary} ${hashtags}`.trim()

    const response = await client.post(`/accounts/0/locations/${businessId}/posts`, {
      summary: summary.substring(0, 1500), // GBP summary limit
      topicType: "STANDARD_POST",
      media: post.imageUrl
        ? [
            {
              mediaFormat: "PHOTO",
              sourceUrl: post.imageUrl,
            },
          ]
        : [],
      callToAction: post.callToAction
        ? {
            actionType: "LEARN_MORE",
            url: post.callToAction,
          }
        : undefined,
    })

    return {
      success: true,
      postId: response.data.name,
    }
  } catch (error: any) {
    console.error("Failed to create GBP post:", error)
    return {
      success: false,
      error: error.response?.data?.error?.message || "Failed to create GBP post",
    }
  }
}

export async function uploadGBPPhoto(businessId: string, accessToken: string, photo: GBPPhoto) {
  const client = axios.create({
    baseURL: "https://mybusiness.googleapis.com/v4",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  })

  try {
    const response = await client.post(`/accounts/0/locations/${businessId}/media`, {
      mediaFormat: "PHOTO",
      sourceUrl: photo.imageUrl,
      locationAssociation: {
        category: photo.category || "EXTERIOR",
      },
      description: photo.caption,
    })

    return {
      success: true,
      mediaId: response.data.name,
    }
  } catch (error: any) {
    console.error("Failed to upload GBP photo:", error)
    return {
      success: false,
      error: error.response?.data?.error?.message || "Failed to upload GBP photo",
    }
  }
}

export async function getGBPInsights(businessId: string, accessToken: string) {
  const client = axios.create({
    baseURL: "https://mybusiness.googleapis.com/v4",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  try {
    const response = await client.get(`/accounts/0/locations/${businessId}/insights`)

    return response.data.locationInsights || []
  } catch (error) {
    console.error("Failed to fetch GBP insights:", error)
    return []
  }
}

export async function getGBPReviews(businessId: string, accessToken: string) {
  const client = axios.create({
    baseURL: "https://mybusiness.googleapis.com/v4",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  try {
    const response = await client.get(`/accounts/0/locations/${businessId}/reviews`)

    return response.data.reviews || []
  } catch (error) {
    console.error("Failed to fetch GBP reviews:", error)
    return []
  }
}

export async function replyToGBPReview(businessId: string, accessToken: string, reviewId: string, replyText: string) {
  const client = axios.create({
    baseURL: "https://mybusiness.googleapis.com/v4",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  })

  try {
    await client.put(`/accounts/0/locations/${businessId}/reviews/${reviewId}/reply`, {
      comment: replyText,
    })

    return { success: true }
  } catch (error: any) {
    console.error("Failed to reply to GBP review:", error)
    return {
      success: false,
      error: error.response?.data?.error?.message || "Failed to reply to review",
    }
  }
}
