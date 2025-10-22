import axios from "axios"

interface KeywordData {
  keyword: string
  position: number
  searchVolume: number
  difficulty: number
  cpc: number
  previousPosition?: number
}

interface SEMrushRankingData {
  keyword: string
  currentRank: number
  previousRank?: number
  searchVolume: number
  difficulty: number
  trend: 'up' | 'down' | 'stable'
}

export async function fetchSEMrushKeywords(apiKey: string, domain: string): Promise<SEMrushRankingData[]> {
  const client = axios.create({
    baseURL: "https://api.semrush.com",
  })

  try {
    const response = await client.get("/", {
      params: {
        type: "domain_organic",
        key: apiKey,
        domain,
        db: "us",
        export_columns: "Ph,Po,Nq,Kd,Cp",
      },
    })

    // Parse CSV response
    const lines = response.data.split("\n").filter((line: string) => line.trim())

    return lines.slice(1).map((line: string) => {
      const [keyword, position, searchVolume, difficulty, cpc] = line.split("|")
      return {
        keyword,
        currentRank: Number.parseInt(position) || 0,
        searchVolume: Number.parseInt(searchVolume) || 0,
        difficulty: Number.parseInt(difficulty) || 0,
        trend: 'stable' as const, // Will be calculated based on previous data
      }
    })
  } catch (error) {
    console.error("Failed to fetch SEMrush data:", error)
    return []
  }
}

export async function trackKeywordRankings(apiKey: string, domain: string, keywords: string[]): Promise<SEMrushRankingData[]> {
  const client = axios.create({
    baseURL: "https://api.semrush.com",
  })

  try {
    const keywordString = keywords.join(",")
    const response = await client.get("/", {
      params: {
        type: "phrase_this",
        key: apiKey,
        phrase: keywordString,
        db: "us",
        export_columns: "Ph,Po,Nq,Kd,Cp",
      },
    })

    // Parse CSV response
    const lines = response.data.split("\n").filter((line: string) => line.trim())

    return lines.slice(1).map((line: string) => {
      const [keyword, position, searchVolume, difficulty, cpc] = line.split("|")
      return {
        keyword,
        currentRank: Number.parseInt(position) || 0,
        searchVolume: Number.parseInt(searchVolume) || 0,
        difficulty: Number.parseInt(difficulty) || 0,
        trend: 'stable' as const,
      }
    })
  } catch (error) {
    console.error("Failed to track keyword rankings:", error)
    return []
  }
}

export async function getDomainOverview(apiKey: string, domain: string) {
  const client = axios.create({
    baseURL: "https://api.semrush.com",
  })

  try {
    const response = await client.get("/", {
      params: {
        type: "domain_ranks",
        key: apiKey,
        domain,
        db: "us",
        export_columns: "Dn,Rk,Or,Ot,Oc,Ad,At,Ac",
      },
    })

    // Parse domain overview data
    const lines = response.data.split("\n").filter((line: string) => line.trim())
    if (lines.length < 2) return null

    const [domainName, rank, organicKeywords, organicTraffic, organicCost, adwordsKeywords, adwordsTraffic, adwordsCost] = lines[1].split("|")

    return {
      domain: domainName,
      rank: Number.parseInt(rank) || 0,
      organicKeywords: Number.parseInt(organicKeywords) || 0,
      organicTraffic: Number.parseInt(organicTraffic) || 0,
      organicCost: Number.parseFloat(organicCost) || 0,
      adwordsKeywords: Number.parseInt(adwordsKeywords) || 0,
      adwordsTraffic: Number.parseInt(adwordsTraffic) || 0,
      adwordsCost: Number.parseFloat(adwordsCost) || 0,
    }
  } catch (error) {
    console.error("Failed to fetch domain overview:", error)
    return null
  }
}
