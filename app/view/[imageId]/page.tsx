"use client"

import { useState, useEffect } from "react"

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

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f0f0f0",
        }}
      >
        <p>Loading...</p>
      </div>
    )
  }

  if (error || !imageData) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f0f0f0",
        }}
      >
        <p>Error: {error || "Image not found"}</p>
      </div>
    )
  }

  return (
    <img
      src={`data:${imageData.mimeType};base64,${imageData.base64Data}`}
      alt={imageData.fileName}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        display: "block",
        margin: 0,
        padding: 0,
      }}
    />
  )
}
