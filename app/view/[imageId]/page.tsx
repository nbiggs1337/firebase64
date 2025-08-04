"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, ArrowLeft, ImageIcon, AlertCircle } from "lucide-react"
import Link from "next/link"

interface ImageData {
  imageId: string
  fileName: string
  mimeType: string
  base64Data: string
  fileSize: number
  uploadedAt: any
  createdAt: string
}

export default function ViewImagePage({ params }: { params: { imageId: string } }) {
  const [imageData, setImageData] = useState<ImageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await fetch(`/api/get-image/${params.imageId}`)
        const data = await response.json()

        if (data.success) {
          setImageData(data)
        } else {
          setError(data.error || "Failed to load image")
        }
      } catch (err) {
        setError("Network error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (params.imageId) {
      fetchImage()
    }
  }, [params.imageId])

  const downloadImage = () => {
    if (!imageData) return

    const link = document.createElement("a")
    link.href = `data:${imageData.mimeType};base64,${imageData.base64Data}`
    link.download = imageData.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <ImageIcon className="w-12 h-12 mx-auto text-gray-400 animate-pulse" />
            <p className="mt-4 text-gray-600">Loading image...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Upload
              </Button>
            </Link>
          </div>

          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Upload
            </Button>
          </Link>
          <Button onClick={downloadImage} size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>

        {/* Image Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              {imageData?.fileName}
            </CardTitle>
            <CardDescription>
              Uploaded on {new Date(imageData?.createdAt || "").toLocaleDateString()} •
              {imageData?.fileSize ? ` ${(imageData.fileSize / 1024 / 1024).toFixed(2)} MB` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={`data:${imageData?.mimeType};base64,${imageData?.base64Data}`}
                alt={imageData?.fileName}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            </div>
          </CardContent>
        </Card>

        {/* Image Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Image Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">File Name:</span>
                <p className="text-gray-900">{imageData?.fileName}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">File Size:</span>
                <p className="text-gray-900">
                  {imageData?.fileSize ? `${(imageData.fileSize / 1024 / 1024).toFixed(2)} MB` : "Unknown"}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Image ID:</span>
                <p className="text-gray-900 font-mono text-xs">{imageData?.imageId}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">MIME Type:</span>
                <p className="text-gray-900">{imageData?.mimeType}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
