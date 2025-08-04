"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, RefreshCw, FileText, Sparkles, CheckSquare, Square, FolderDown } from "lucide-react"
import { ArticleViewer } from "./components/article-viewer"

interface Topic {
  id: string
  title: string
  description: string
  category: string
}

interface Article {
  content: string
  topic: Topic
  status: "generating" | "completed" | "error"
}

export default function Dashboard() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set())
  const [articles, setArticles] = useState<Article[]>([])
  const [loadingTopics, setLoadingTopics] = useState(false)
  const [generatingArticles, setGeneratingArticles] = useState(false)
  const [savingArticles, setSavingArticles] = useState(false)

  const fetchTopics = async () => {
    setLoadingTopics(true)
    try {
      const response = await fetch("/api/topics")
      const data = await response.json()
      setTopics(data.topics || [])
      setSelectedTopics(new Set())
      setArticles([])
    } catch (error) {
      console.error("Error fetching topics:", error)
    } finally {
      setLoadingTopics(false)
    }
  }

  const toggleTopicSelection = (topicId: string) => {
    const newSelected = new Set(selectedTopics)
    if (newSelected.has(topicId)) {
      newSelected.delete(topicId)
    } else {
      newSelected.add(topicId)
    }
    setSelectedTopics(newSelected)
  }

  const selectAllTopics = () => {
    setSelectedTopics(new Set(topics.map((t) => t.id)))
  }

  const deselectAllTopics = () => {
    setSelectedTopics(new Set())
  }

  const generateArticles = async () => {
    if (selectedTopics.size === 0) return

    setGeneratingArticles(true)
    const selectedTopicObjects = topics.filter((t) => selectedTopics.has(t.id))

    // Initialize articles with generating status
    const initialArticles: Article[] = selectedTopicObjects.map((topic) => ({
      content: "",
      topic,
      status: "generating" as const,
    }))
    setArticles(initialArticles)

    // Generate articles concurrently
    const articlePromises = selectedTopicObjects.map(async (topic, index) => {
      try {
        const response = await fetch("/api/article", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic }),
        })
        const data = await response.json()

        // Update the specific article
        setArticles((prev) =>
          prev.map((article, i) =>
            i === index ? { ...article, content: data.content, status: "completed" as const } : article,
          ),
        )
      } catch (error) {
        console.error(`Error generating article for ${topic.title}:`, error)
        setArticles((prev) =>
          prev.map((article, i) => (i === index ? { ...article, status: "error" as const } : article)),
        )
      }
    })

    await Promise.all(articlePromises)
    setGeneratingArticles(false)
  }

  const saveAllArticles = async () => {
    const completedArticles = articles.filter((a) => a.status === "completed")
    if (completedArticles.length === 0) return

    setSavingArticles(true)
    try {
      const response = await fetch("/api/save-articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articles: completedArticles }),
      })
      const data = await response.json()

      if (data.success) {
        alert(`Successfully saved ${data.files.length} articles to generated-articles folder!`)
      } else {
        alert("Failed to save articles")
      }
    } catch (error) {
      console.error("Error saving articles:", error)
      alert("Failed to save articles")
    } finally {
      setSavingArticles(false)
    }
  }

  useEffect(() => {
    fetchTopics()
  }, [])

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      AI: "bg-purple-900/20 text-purple-300 border-purple-800",
      "Web Development": "bg-blue-900/20 text-blue-300 border-blue-800",
      Cybersecurity: "bg-red-900/20 text-red-300 border-red-800",
      Mobile: "bg-green-900/20 text-green-300 border-green-800",
      Blockchain: "bg-yellow-900/20 text-yellow-300 border-yellow-800",
      Cloud: "bg-indigo-900/20 text-indigo-300 border-indigo-800",
      IoT: "bg-pink-900/20 text-pink-300 border-pink-800",
      "Emerging Tech": "bg-orange-900/20 text-orange-300 border-orange-800",
    }
    return colors[category] || "bg-gray-900/20 text-gray-300 border-gray-800"
  }

  const completedArticles = articles.filter((a) => a.status === "completed").length
  const totalArticles = articles.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1924] to-[#1a2332]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-cyan-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Grok Article Generator
            </h1>
          </div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            AI-powered technology article generation using Grok. Select multiple topics and generate comprehensive
            MDX-formatted articles in batch.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Topics Panel */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold flex items-center gap-2 text-white">
                <FileText className="w-6 h-6" />
                Technology Topics ({topics.length})
              </h2>
              <Button
                onClick={fetchTopics}
                disabled={loadingTopics}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent"
              >
                {loadingTopics ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Refresh Topics
              </Button>
            </div>

            {/* Selection Controls */}
            <div className="flex items-center justify-between bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg border border-gray-700">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-300">
                  {selectedTopics.size} of {topics.length} selected
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllTopics}
                    disabled={selectedTopics.size === topics.length}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white bg-transparent"
                  >
                    <CheckSquare className="w-4 h-4 mr-1" />
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={deselectAllTopics}
                    disabled={selectedTopics.size === 0}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white bg-transparent"
                  >
                    <Square className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                </div>
              </div>
              <Button
                onClick={generateArticles}
                disabled={selectedTopics.size === 0 || generatingArticles}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                {generatingArticles ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Generating ({completedArticles}/{totalArticles})
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate {selectedTopics.size} Articles
                  </>
                )}
              </Button>
            </div>

            {loadingTopics ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                <span className="ml-2 text-gray-300">Generating topics with Grok...</span>
              </div>
            ) : (
              <div className="grid gap-3 max-h-[600px] overflow-y-auto pr-2">
                {topics.map((topic) => (
                  <Card
                    key={topic.id}
                    className={`cursor-pointer transition-all hover:shadow-lg bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-gray-600 ${
                      selectedTopics.has(topic.id) ? "ring-2 ring-cyan-500 bg-cyan-900/20" : ""
                    }`}
                    onClick={() => toggleTopicSelection(topic.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedTopics.has(topic.id)}
                          onChange={() => {}} // Handled by card click
                          className="mt-1 border-gray-600 data-[state=checked]:bg-cyan-600 data-[state=checked]:border-cyan-600"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-base leading-tight text-white">{topic.title}</CardTitle>
                            <Badge className={`${getCategoryColor(topic.category)} flex-shrink-0 border`}>
                              {topic.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-sm pl-7 text-gray-400">{topic.description}</CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Articles Panel */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold flex items-center gap-2 text-white">
                <Sparkles className="w-6 h-6" />
                Generated Articles {articles.length > 0 && `(${completedArticles}/${totalArticles})`}
              </h2>
              {completedArticles > 0 && (
                <Button
                  onClick={saveAllArticles}
                  disabled={savingArticles}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {savingArticles ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FolderDown className="w-4 h-4 mr-2" />
                      Save All ({completedArticles})
                    </>
                  )}
                </Button>
              )}
            </div>

            {articles.length === 0 && !generatingArticles && (
              <Card className="h-96 flex items-center justify-center bg-gray-800/50 backdrop-blur-sm border-gray-700">
                <CardContent className="text-center">
                  <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Select topics and click "Generate Articles" to start</p>
                </CardContent>
              </Card>
            )}

            {articles.length > 0 && (
              <div className="space-y-4 max-h-[700px] overflow-y-auto">
                {articles.map((article, index) => (
                  <ArticleViewer key={article.topic.id} article={article} index={index + 1} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
