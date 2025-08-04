"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"

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

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f0f0f0'
      }}>
        <p>Loading image...</p>
      </div>
    )
  }

  if (error || !imageData) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f0f0f0'
      }}>
        <p>Error: {error || "Image not found"}</p>
      </div>
    )
  }

  return (
    <img
      src={`data:${imageData.mimeType};base64,${imageData.base64Data}`}
      alt={imageData.fileName}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        display: 'block'
      }}
    />
  )
}
