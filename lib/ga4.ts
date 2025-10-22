import axios from "axios"

interface GA4Metrics {
  date: string
  sessions: number
  users: number
  pageViews: number
  bounceRate: number
  avgSessionDuration: number
  conversions: number
  organicTraffic?: number
  backlinks?: number
}

interface GA4RealtimeData {
  activeUsers: number
  screenPageViews: number
  conversions: number
}

export async function fetchGA4Data(propertyId: string, accessToken: string, days = 30): Promise<GA4Metrics[]> {
  const client = axios.create({
    baseURL: "https://analyticsdata.googleapis.com/v1beta",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  })

  const endDate = new Date()
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)

  try {
    const response = await client.post(`/properties/${propertyId}:runReport`, {
      dateRanges: [
        {
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        },
      ],
      dimensions: [
        { name: "date" },
      ],
      metrics: [
        { name: "sessions" },
        { name: "totalUsers" },
        { name: "screenPageViews" },
        { name: "bounceRate" },
        { name: "averageSessionDuration" },
        { name: "conversions" },
        { name: "organicGoogleSearchClicks" },
      ],
    })

    const rows = response.data.rows || []

    return rows.map((row: any) => ({
      date: row.dimensionValues[0].value,
      sessions: Number.parseInt(row.metricValues[0].value) || 0,
      users: Number.parseInt(row.metricValues[1].value) || 0,
      pageViews: Number.parseInt(row.metricValues[2].value) || 0,
      bounceRate: Number.parseFloat(row.metricValues[3].value) || 0,
      avgSessionDuration: Number.parseFloat(row.metricValues[4].value) || 0,
      conversions: Number.parseInt(row.metricValues[5].value) || 0,
      organicTraffic: Number.parseInt(row.metricValues[6].value) || 0,
    }))
  } catch (error) {
    console.error("Failed to fetch GA4 data:", error)
    return []
  }
}

export async function fetchGA4RealtimeData(propertyId: string, accessToken: string): Promise<GA4RealtimeData> {
  const client = axios.create({
    baseURL: "https://analyticsdata.googleapis.com/v1beta",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  })

  try {
    const response = await client.post(`/properties/${propertyId}:runRealtimeReport`, {
      dimensions: [
        { name: "unifiedScreenName" },
      ],
      metrics: [
        { name: "activeUsers" },
        { name: "screenPageViews" },
        { name: "conversions" },
      ],
      limit: 10,
    })

    const rows = response.data.rows || []
    const totals = response.data.totals || []

    return {
      activeUsers: Number.parseInt(totals[0]?.metricValues[0]?.value) || 0,
      screenPageViews: rows.reduce((sum: number, row: any) => sum + Number.parseInt(row.metricValues[1].value), 0),
      conversions: Number.parseInt(totals[0]?.metricValues[2]?.value) || 0,
    }
  } catch (error) {
    console.error("Failed to fetch GA4 realtime data:", error)
    return {
      activeUsers: 0,
      screenPageViews: 0,
      conversions: 0,
    }
  }
}

export async function getGA4PagePerformance(propertyId: string, accessToken: string, days = 30) {
  const client = axios.create({
    baseURL: "https://analyticsdata.googleapis.com/v1beta",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  })

  const endDate = new Date()
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)

  try {
    const response = await client.post(`/properties/${propertyId}:runReport`, {
      dateRanges: [
        {
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        },
      ],
      dimensions: [
        { name: "pagePath" },
        { name: "pageTitle" },
      ],
      metrics: [
        { name: "screenPageViews" },
        { name: "totalUsers" },
        { name: "bounceRate" },
        { name: "averageSessionDuration" },
      ],
      orderBys: [
        {
          metric: { metricName: "screenPageViews" },
          desc: true,
        },
      ],
      limit: 50,
    })

    const rows = response.data.rows || []

    return rows.map((row: any) => ({
      pagePath: row.dimensionValues[0].value,
      pageTitle: row.dimensionValues[1].value,
      pageViews: Number.parseInt(row.metricValues[0].value) || 0,
      users: Number.parseInt(row.metricValues[1].value) || 0,
      bounceRate: Number.parseFloat(row.metricValues[2].value) || 0,
      avgSessionDuration: Number.parseFloat(row.metricValues[3].value) || 0,
    }))
  } catch (error) {
    console.error("Failed to fetch GA4 page performance:", error)
    return []
  }
}
