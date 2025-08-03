"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Download, ArrowLeft, AlertCircle, ImageIcon } from "lucide-react"
import Link from "next/link"

interface ImageData {
  id: string
  fileName: string
  mimeType: string
  base64Data: string
  fileSize: number
  fileSizeMB: number
  uploadedAt: string
}

export default function ViewImagePage() {
  const params = useParams()
  const imageId = params.imageId as string
  const [imageData, setImageData] = useState<ImageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchImage = async () => {
      try {
        // This would call your Firebase function to retrieve the image data
        const response = await fetch(`/api/get-image/${imageId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch image")
        }

        const data = await response.json()

        if (data.success) {
          setImageData(data.imageData)
        } else {
          setError(data.error || "Failed to load image")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (imageId) {
      fetchImage()
    }
  }, [imageId])

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
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Upload
              </Button>
            </Link>
            <Skeleton className="h-8 w-48" />
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="w-full h-96" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-24" />
              </div>
            </CardContent>
          </Card>
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
            <h1 className="text-2xl font-bold text-gray-900">Image Viewer</h1>
          </div>

          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (!imageData) {
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
            <h1 className="text-2xl font-bold text-gray-900">Image Not Found</h1>
          </div>

          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>The requested image could not be found.</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Image Viewer</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              {imageData.fileName}
            </CardTitle>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Firestore Document ID: {imageData.id}</p>
              <p>Type: {imageData.mimeType}</p>
              <p>
                Size: {imageData.fileSizeMB} MB ({imageData.fileSize.toLocaleString()} bytes)
              </p>
              <p>Uploaded: {new Date(imageData.uploadedAt).toLocaleString()}</p>
              <p className="text-xs text-blue-600">Stored as base64 string in Firebase Firestore</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={`data:${imageData.mimeType};base64,${imageData.base64Data}`}
                alt={imageData.fileName}
                className="w-full h-auto max-h-96 object-contain mx-auto"
                crossOrigin="anonymous"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={downloadImage} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download Image
              </Button>
              <Button variant="outline" onClick={() => navigator.clipboard.writeText(window.location.href)}>
                Copy Link
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
