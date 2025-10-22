import axios from "axios"

interface WordPressPost {
  title: string
  content: string
  excerpt?: string
  categories?: number[]
  meta?: Record<string, any>
  featured_media?: number
  slug?: string
}

interface WordPressPortfolio {
  title: string
  content: string
  excerpt?: string
  meta?: Record<string, any>
  featured_media?: number
  acf?: Record<string, any> // Advanced Custom Fields for Elementor
}

export async function createWordPressPost(wordpressUrl: string, apiKey: string, post: WordPressPost) {
  const client = axios.create({
    baseURL: `${wordpressUrl}/wp-json/wp/v2`,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  })

  try {
    const response = await client.post("/posts", {
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      categories: post.categories || [],
      status: "draft",
      meta: post.meta || {},
      featured_media: post.featured_media,
      slug: post.slug,
    })

    return {
      success: true,
      postId: response.data.id,
      postUrl: response.data.link,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to create WordPress post",
    }
  }
}

export async function createWordPressPortfolio(wordpressUrl: string, apiKey: string, portfolio: WordPressPortfolio) {
  const client = axios.create({
    baseURL: `${wordpressUrl}/wp-json/wp/v2`,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  })

  try {
    // Assuming portfolio custom post type is 'portfolio'
    const response = await client.post("/portfolio", {
      title: portfolio.title,
      content: portfolio.content,
      excerpt: portfolio.excerpt,
      status: "publish",
      meta: portfolio.meta || {},
      featured_media: portfolio.featured_media,
      acf: portfolio.acf || {},
    })

    return {
      success: true,
      postId: response.data.id,
      postUrl: response.data.link,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to create WordPress portfolio entry",
    }
  }
}

export async function uploadWordPressMedia(wordpressUrl: string, apiKey: string, file: Buffer, filename: string, altText?: string) {
  const client = axios.create({
    baseURL: `${wordpressUrl}/wp-json/wp/v2`,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "multipart/form-data",
    },
  })

  try {
    const formData = new FormData()
    formData.append('file', new Blob([file]), filename)
    if (altText) {
      formData.append('alt_text', altText)
    }

    const response = await client.post("/media", formData)

    return {
      success: true,
      mediaId: response.data.id,
      mediaUrl: response.data.source_url,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to upload media to WordPress",
    }
  }
}

export async function getWordPressCategories(wordpressUrl: string, apiKey: string) {
  const client = axios.create({
    baseURL: `${wordpressUrl}/wp-json/wp/v2`,
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  })

  try {
    const response = await client.get("/categories")
    return response.data
  } catch (error) {
    console.error("Failed to fetch WordPress categories:", error)
    return []
  }
}

export async function injectElementorContent(wordpressUrl: string, apiKey: string, postId: string, elementorData: any) {
  const client = axios.create({
    baseURL: `${wordpressUrl}/wp-json/wp/v2`,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  })

  try {
    // Update post meta with Elementor data
    await client.post(`/posts/${postId}`, {
      meta: {
        _elementor_data: JSON.stringify(elementorData),
        _elementor_edit_mode: "builder",
        _elementor_template_type: "post",
      },
    })

    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to inject Elementor content",
    }
  }
}
