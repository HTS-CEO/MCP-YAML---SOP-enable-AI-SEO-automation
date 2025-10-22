import { generateSchemaMarkup } from "./openai"

export interface BusinessInfo {
  name: string
  website: string
  address?: {
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
  }
  geo?: {
    latitude: number
    longitude: number
  }
  telephone?: string
  priceRange?: string
  openingHours?: string[]
}

export interface ServiceInfo {
  name: string
  description: string
  provider: BusinessInfo
  areaServed?: string
  serviceType?: string
}

export interface ArticleInfo {
  headline: string
  description: string
  author: string
  publisher: BusinessInfo
  datePublished: string
  dateModified?: string
  mainEntityOfPage: string
}

export interface FAQInfo {
  questions: Array<{
    question: string
    answer: string
  }>
}

export interface LocalBusinessSchema {
  "@context": string
  "@type": string
  name: string
  url: string
  address?: {
    "@type": string
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
  }
  geo?: {
    "@type": string
    latitude: number
    longitude: number
  }
  telephone?: string
  priceRange?: string
  openingHours?: string[]
  sameAs?: string[]
}

export interface ServiceSchema {
  "@context": string
  "@type": string
  name: string
  description: string
  provider: {
    "@type": string
    name: string
    url: string
  }
  areaServed?: {
    "@type": string
    name: string
  }
  serviceType?: string
}

export interface ArticleSchema {
  "@context": string
  "@type": string
  headline: string
  description: string
  author: {
    "@type": string
    name: string
  }
  publisher: {
    "@type": string
    name: string
    logo?: {
      "@type": string
      url: string
    }
  }
  datePublished: string
  dateModified?: string
  mainEntityOfPage: {
    "@type": string
    "@id": string
  }
}

export interface FAQSchema {
  "@context": string
  "@type": string
  mainEntity: Array<{
    "@type": string
    name: string
    acceptedAnswer: {
      "@type": string
      text: string
    }
  }>
}

export class SchemaGenerator {
  static generateLocalBusinessSchema(business: BusinessInfo): LocalBusinessSchema {
    const schema: LocalBusinessSchema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: business.name,
      url: business.website,
    }

    if (business.address) {
      schema.address = {
        "@type": "PostalAddress",
        streetAddress: business.address.streetAddress,
        addressLocality: business.address.addressLocality,
        addressRegion: business.address.addressRegion,
        postalCode: business.address.postalCode,
        addressCountry: business.address.addressCountry,
      }
    }

    if (business.geo) {
      schema.geo = {
        "@type": "GeoCoordinates",
        latitude: business.geo.latitude,
        longitude: business.geo.longitude,
      }
    }

    if (business.telephone) {
      schema.telephone = business.telephone
    }

    if (business.priceRange) {
      schema.priceRange = business.priceRange
    }

    if (business.openingHours) {
      schema.openingHours = business.openingHours
    }

    return schema
  }

  static generateServiceSchema(service: ServiceInfo): ServiceSchema {
    const schema: ServiceSchema = {
      "@context": "https://schema.org",
      "@type": "Service",
      name: service.name,
      description: service.description,
      provider: {
        "@type": "LocalBusiness",
        name: service.provider.name,
        url: service.provider.website,
      },
    }

    if (service.areaServed) {
      schema.areaServed = {
        "@type": "Place",
        name: service.areaServed,
      }
    }

    if (service.serviceType) {
      schema.serviceType = service.serviceType
    }

    return schema
  }

  static generateArticleSchema(article: ArticleInfo): ArticleSchema {
    const schema: ArticleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.headline,
      description: article.description,
      author: {
        "@type": "Person",
        name: article.author,
      },
      publisher: {
        "@type": "Organization",
        name: article.publisher.name,
      },
      datePublished: article.datePublished,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": article.mainEntityOfPage,
      },
    }

    if (article.dateModified) {
      schema.dateModified = article.dateModified
    }

    return schema
  }

  static generateFAQSchema(faq: FAQInfo): FAQSchema {
    const schema: FAQSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.questions.map(q => ({
        "@type": "Question",
        name: q.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: q.answer,
        },
      })),
    }

    return schema
  }

  static generateCompleteSchema(
    business: BusinessInfo,
    article?: ArticleInfo,
    service?: ServiceInfo,
    faq?: FAQInfo
  ): string {
    const schemas = []

    // Always include LocalBusiness schema
    schemas.push(this.generateLocalBusinessSchema(business))

    // Include Article schema if provided
    if (article) {
      schemas.push(this.generateArticleSchema(article))
    }

    // Include Service schema if provided
    if (service) {
      schemas.push(this.generateServiceSchema(service))
    }

    // Include FAQ schema if provided
    if (faq) {
      schemas.push(this.generateFAQSchema(faq))
    }

    // Return as JSON-LD script tag
    return `<script type="application/ld+json">\n${JSON.stringify(schemas, null, 2)}\n</script>`
  }

  static async generateAISchema(content: any, businessInfo?: BusinessInfo): Promise<string> {
    try {
      return await generateSchemaMarkup(content, businessInfo)
    } catch (error) {
      console.error("Error generating AI schema:", error)
      // Fallback to basic schema generation
      if (businessInfo) {
        return this.generateCompleteSchema(businessInfo)
      }
      return ""
    }
  }

  static injectSchemaIntoContent(content: string, schema: string): string {
    // Find the closing </head> tag and inject schema before it
    const headCloseIndex = content.indexOf("</head>")
    if (headCloseIndex !== -1) {
      return content.slice(0, headCloseIndex) + schema + content.slice(headCloseIndex)
    }

    // If no </head> tag, prepend to content
    return schema + content
  }

  static extractSchemaFromContent(content: string): string[] {
    const schemaRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
    const schemas = []
    let match

    while ((match = schemaRegex.exec(content)) !== null) {
      try {
        const schema = JSON.parse(match[1])
        schemas.push(schema)
      } catch (error) {
        console.error("Error parsing schema JSON:", error)
      }
    }

    return schemas
  }

  static validateSchema(schema: any): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Basic validation for required fields
    if (!schema["@context"]) {
      errors.push("Missing @context field")
    }

    if (!schema["@type"]) {
      errors.push("Missing @type field")
    }

    // Type-specific validations
    switch (schema["@type"]) {
      case "LocalBusiness":
        if (!schema.name) errors.push("LocalBusiness missing name")
        if (!schema.url) errors.push("LocalBusiness missing url")
        break

      case "Article":
        if (!schema.headline) errors.push("Article missing headline")
        if (!schema.author) errors.push("Article missing author")
        break

      case "Service":
        if (!schema.name) errors.push("Service missing name")
        if (!schema.provider) errors.push("Service missing provider")
        break
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  static mergeSchemas(existingSchemas: any[], newSchemas: any[]): any[] {
    const merged = [...existingSchemas]

    for (const newSchema of newSchemas) {
      // Check if schema of same type already exists
      const existingIndex = merged.findIndex(s => s["@type"] === newSchema["@type"])

      if (existingIndex !== -1) {
        // Merge/update existing schema
        merged[existingIndex] = { ...merged[existingIndex], ...newSchema }
      } else {
        // Add new schema
        merged.push(newSchema)
      }
    }

    return merged
  }
}