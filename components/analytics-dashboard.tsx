"use client"

import { useEffect, useState } from "react"
import { getClientAnalytics, getClientKeywords, getClientBlogPosts, syncAnalytics } from "@/app/actions/analytics"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { RefreshCw, TrendingUp, Users, FileText } from "lucide-react"

interface AnalyticsDashboardProps {
  clientId: string
}

export function AnalyticsDashboard({ clientId }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<any[]>([])
  const [keywords, setKeywords] = useState<any[]>([])
  const [blogPosts, setBlogPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsData, keywordsData, postsData] = await Promise.all([
          getClientAnalytics(clientId),
          getClientKeywords(clientId),
          getClientBlogPosts(clientId),
        ])

        setAnalytics(analyticsData)
        setKeywords(keywordsData)
        setBlogPosts(postsData)
      } catch (error) {
        console.error("Failed to fetch analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [clientId])

  const handleSync = async () => {
    setSyncing(true)
    try {
      await syncAnalytics(clientId)
      // Refresh data
      const [analyticsData, keywordsData] = await Promise.all([
        getClientAnalytics(clientId),
        getClientKeywords(clientId),
      ])
      setAnalytics(analyticsData)
      setKeywords(keywordsData)
    } catch (error) {
      console.error("Failed to sync analytics:", error)
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>
  }

  const totalSessions = analytics.reduce((sum, a) => sum + (a.sessions || 0), 0)
  const totalConversions = analytics.reduce((sum, a) => sum + (a.conversions || 0), 0)
  const avgBounceRate =
    analytics.length > 0 ? analytics.reduce((sum, a) => sum + (a.bounceRate || 0), 0) / analytics.length : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Analytics</h2>
        <Button onClick={handleSync} disabled={syncing} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing..." : "Sync Data"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversions}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Bounce Rate</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgBounceRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Chart */}
      {analytics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Traffic Trends</CardTitle>
            <CardDescription>Sessions and page views over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sessions" stroke="#3b82f6" />
                <Line type="monotone" dataKey="pageViews" stroke="#10b981" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Keywords */}
      <Card>
        <CardHeader>
          <CardTitle>Top Keywords</CardTitle>
          <CardDescription>Tracked keywords and their rankings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 font-medium">Keyword</th>
                  <th className="text-left py-2 px-2 font-medium">Rank</th>
                  <th className="text-left py-2 px-2 font-medium">Volume</th>
                  <th className="text-left py-2 px-2 font-medium">Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {keywords.slice(0, 10).map((kw) => (
                  <tr key={kw.id} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2">{kw.keyword}</td>
                    <td className="py-2 px-2">
                      <span className="font-bold text-primary">#{kw.currentRank}</span>
                    </td>
                    <td className="py-2 px-2">{kw.searchVolume?.toLocaleString() || "-"}</td>
                    <td className="py-2 px-2">{kw.difficulty || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Blog Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Published Posts</CardTitle>
          <CardDescription>Generated and published blog posts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {blogPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No posts published yet</p>
            ) : (
              blogPosts.slice(0, 5).map((post) => (
                <div key={post.id} className="flex items-start justify-between p-3 border border-border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{post.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {post.wordpressUrl && (
                    <a
                      href={post.wordpressUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      View
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
