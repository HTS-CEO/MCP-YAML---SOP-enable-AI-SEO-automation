import { OpenAI } from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface GeneratedContent {
  title: string
  metaDescription: string
  content: string
  schemaJson: string
  service?: string
  location?: string
  hashtags?: string[]
  gbpSummary?: string
}

export interface ReoptimizationContent {
  title: string
  metaDescription: string
  content: string
  improvements: string[]
  reason: string
}

export async function generateSEOContent(
  uploadType: string,
  description: string,
  service?: string,
  location?: string,
): Promise<GeneratedContent> {
  const prompt = `You are an expert SEO content writer. Generate a high-quality, SEO-optimized blog post based on the following information:

Upload Type: ${uploadType}
Description: ${description}
${service ? `Service: ${service}` : ""}
${location ? `Location: ${location}` : ""}

Please provide the response in the following JSON format:
{
  "title": "SEO-optimized title (60 characters max)",
  "metaDescription": "Meta description (160 characters max)",
  "content": "Full blog post content (at least 800 words, well-structured with headings)",
  "schemaJson": "JSON-LD schema markup for the content",
  "hashtags": ["array", "of", "relevant", "hashtags"],
  "gbpSummary": "Condensed summary for Google Business Profile (1500 characters max)"
}

Make sure the content is:
- Optimized for search engines with proper keyword integration
- Well-structured with proper headings (H1, H2, H3)
- Includes relevant keywords naturally
- Provides value to readers
- Includes a call-to-action
- Contains schema markup for LocalBusiness/Service/Article`

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    })

    const content = response.choices[0].message.content

    if (!content) {
      throw new Error("No content generated")
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      throw new Error("Could not parse generated content")
    }

    const parsed = JSON.parse(jsonMatch[0])

    return {
      title: parsed.title,
      metaDescription: parsed.metaDescription,
      content: parsed.content,
      schemaJson: parsed.schemaJson,
      hashtags: parsed.hashtags || [],
      gbpSummary: parsed.gbpSummary,
      service,
      location,
    }
  } catch (error) {
    console.error("Error generating SEO content:", error)
    throw error
  }
}

export async function generateReoptimizationContent(
  originalContent: GeneratedContent,
  rankingDrop: number,
  keyword: string,
  currentRank: number,
  targetRank: number,
): Promise<ReoptimizationContent> {
  const prompt = `You are an SEO expert. The following content has experienced a ranking drop of ${rankingDrop} positions for the keyword "${keyword}" (currently ranking at position ${currentRank}, target is ${targetRank}).

Original Content:
Title: ${originalContent.title}
Meta Description: ${originalContent.metaDescription}
Content Preview: ${originalContent.content.substring(0, 500)}...

Please re-optimize this content to improve rankings. Provide the response in JSON format:
{
  "title": "Re-optimized title",
  "metaDescription": "Re-optimized meta description",
  "content": "Full re-optimized content with improvements",
  "improvements": ["List of specific SEO improvements made"],
  "reason": "Explanation of why these changes should improve rankings"
}

Focus on:
- Keyword optimization and density
- Content freshness and depth
- Internal linking suggestions
- Schema markup improvements
- User engagement elements`

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.6,
      max_tokens: 2000,
    })

    const content = response.choices[0].message.content

    if (!content) {
      throw new Error("No re-optimization content generated")
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      throw new Error("Could not parse re-optimization content")
    }

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error("Error generating re-optimization content:", error)
    throw error
  }
}

export async function generateSchemaMarkup(content: GeneratedContent, businessInfo?: any): Promise<string> {
  const prompt = `Generate comprehensive JSON-LD schema markup for the following content:

Title: ${content.title}
Content: ${content.content.substring(0, 300)}...
Service: ${content.service || 'N/A'}
Location: ${content.location || 'N/A'}
Business Info: ${businessInfo ? JSON.stringify(businessInfo) : 'N/A'}

Generate schema markup including:
- Article
- LocalBusiness (if location/service provided)
- Service
- FAQ (if applicable)
- HowTo (if applicable)

Return only the JSON-LD as a string.`

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    })

    const schemaContent = response.choices[0].message.content

    if (!schemaContent) {
      throw new Error("No schema markup generated")
    }

    return schemaContent
  } catch (error) {
    console.error("Error generating schema markup:", error)
    return content.schemaJson // fallback to original
  }
}
