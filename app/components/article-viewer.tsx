"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Download, Loader2, CheckCircle, XCircle, Minimize2, Maximize2 } from "lucide-react"
import { useState } from "react"

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

interface ArticleViewerProps {
  article: Article
  index: number
}

export function ArticleViewer({ article, index }: ArticleViewerProps) {
  const [copied, setCopied] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  const copyToClipboard = async () => {
    if (article.status !== "completed") return
    await navigator.clipboard.writeText(article.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadArticle = () => {
    if (article.status !== "completed") return
    const blob = new Blob([article.content], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${article.topic.id}.mdx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

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

  const getStatusIcon = () => {
    switch (article.status) {
      case "generating":
        return <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-400" />
    }
  }

  const getStatusText = () => {
    switch (article.status) {
      case "generating":
        return "Generating..."
      case "completed":
        return "Completed"
      case "error":
        return "Error"
    }
  }

  return (
    <Card
      className={`transition-all ${isMinimized ? "h-auto" : "h-[400px]"} flex flex-col bg-gray-800/50 backdrop-blur-sm border-gray-700`}
    >
      <CardHeader className="flex-shrink-0 border-b border-gray-700">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-400">#{index}</span>
              <CardTitle className="text-lg truncate text-white">{article.topic.title}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${getCategoryColor(article.topic.category)} border`}>{article.topic.category}</Badge>
              <div className="flex items-center gap-1 text-sm">
                {getStatusIcon()}
                <span
                  className={`font-medium ${
                    article.status === "completed"
                      ? "text-green-400"
                      : article.status === "error"
                        ? "text-red-400"
                        : "text-cyan-400"
                  }`}
                >
                  {getStatusText()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-gray-400 hover:text-white hover:bg-gray-700"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              disabled={article.status !== "completed"}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50 bg-transparent"
            >
              <Copy className="w-4 h-4" />
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadArticle}
              disabled={article.status !== "completed"}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50 bg-transparent"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="flex-1 overflow-hidden p-0">
          <div className="h-full overflow-y-auto p-6">
            {article.status === "generating" && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-2" />
                  <p className="text-gray-300">Generating article with Grok...</p>
                </div>
              </div>
            )}

            {article.status === "error" && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <p className="text-red-400 font-medium">Failed to generate article</p>
                  <p className="text-gray-400 text-sm">Please try again</p>
                </div>
              </div>
            )}

            {article.status === "completed" && (
              <pre className="whitespace-pre-wrap text-sm font-mono bg-gray-900/50 text-gray-300 p-4 rounded-lg border border-gray-700">
                {article.content}
              </pre>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
