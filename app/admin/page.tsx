"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Eye, ChevronLeft, ChevronRight, Shield, LogOut, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ImageRecord {
  id: string
  filename: string
  uploadedAt: string
  apiKeyUsed: string
  size: number
  mimeType: string
  base64Data: string
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminKey, setAdminKey] = useState("")
  const [images, setImages] = useState<ImageRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalImages, setTotalImages] = useState(0)
  const [selectedImage, setSelectedImage] = useState<ImageRecord | null>(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    if (!adminKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter admin key",
        variant: "destructive",
      })
      return
    }

    try {
      console.log("[ADMIN CLIENT] Attempting login...")
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminKey }),
      })

      const data = await response.json()

      if (data.success) {
        console.log("[ADMIN CLIENT] ✓ Login successful")
        setIsAuthenticated(true)
        localStorage.setItem("adminAuth", "true")
        toast({
          title: "Success",
          description: "Admin access granted",
        })
        fetchImages(1)
      } else {
        console.log("[ADMIN CLIENT] ✗ Login failed:", data.error)
        toast({
          title: "Access Denied",
          description: "Invalid admin key",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[ADMIN CLIENT] Login error:", error)
      toast({
        title: "Error",
        description: "Failed to authenticate",
        variant: "destructive",
      })
    }
  }

  const fetchImages = async (page: number) => {
    console.log(`[ADMIN CLIENT] Fetching images for page ${page}`)
    setLoading(true)
    setError(null)

    try {
      // Add timeout to the fetch request
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

      const response = await fetch(`/api/admin/images?page=${page}&limit=100`, {
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        console.log(`[ADMIN CLIENT] ✓ Fetched ${data.images.length} images`)
        setImages(data.images)
        setTotalPages(data.totalPages)
        setTotalImages(data.totalImages)
        setCurrentPage(page)
        setError(null)
      } else {
        console.error("[ADMIN CLIENT] API returned error:", data.error)
        setError(data.error || "Failed to fetch images")
        toast({
          title: "Error",
          description: data.error || "Failed to fetch images",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[ADMIN CLIENT] Fetch error:", error)

      let errorMessage = "Failed to fetch images"
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          errorMessage = "Request timed out. Please try again."
        } else {
          errorMessage = error.message
        }
      }

      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteImage = async (imageId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return

    try {
      console.log(`[ADMIN CLIENT] Deleting image ${imageId}`)
      const response = await fetch(`/api/admin/delete-image`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId }),
      })

      const data = await response.json()

      if (data.success) {
        console.log(`[ADMIN CLIENT] ✓ Image ${imageId} deleted`)
        toast({
          title: "Success",
          description: "Image deleted successfully",
        })
        fetchImages(currentPage)
      } else {
        console.error("[ADMIN CLIENT] Delete failed:", data.error)
        toast({
          title: "Error",
          description: data.error || "Failed to delete image",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[ADMIN CLIENT] Delete error:", error)
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      })
    }
  }

  const logout = () => {
    console.log("[ADMIN CLIENT] Logging out")
    setIsAuthenticated(false)
    localStorage.removeItem("adminAuth")
    setImages([])
    setAdminKey("")
    setError(null)
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown date"
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return "Invalid date"
    }
  }

  const getFileExtension = (mimeType: string) => {
    if (!mimeType || typeof mimeType !== "string") return "FILE"

    const parts = mimeType.split("/")
    if (parts.length < 2) return "FILE"

    return parts[1].toUpperCase()
  }

  const getSafeImageSrc = (image: ImageRecord) => {
    if (!image.base64Data || !image.mimeType) {
      return "/placeholder.svg?height=200&width=300&text=No+Image"
    }
    return `data:${image.mimeType};base64,${image.base64Data}`
  }

  useEffect(() => {
    const savedAuth = localStorage.getItem("adminAuth")
    if (savedAuth === "true") {
      console.log("[ADMIN CLIENT] Found saved auth, auto-logging in")
      setIsAuthenticated(true)
      fetchImages(1)
    }
  }, [])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <CardTitle className="text-2xl">Admin Access</CardTitle>
            <CardDescription>Enter your admin key to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter admin key"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <Button onClick={handleLogin} className="w-full">
              Access Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ImageAPI Admin</h1>
                <p className="text-sm text-gray-500">Content Moderation Dashboard</p>
              </div>
            </div>
            <Button onClick={logout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Images</p>
                  <p className="text-2xl font-bold text-gray-900">{totalImages}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Page</p>
                  <p className="text-2xl font-bold text-gray-900">{currentPage}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <ChevronRight className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pages</p>
                  <p className="text-2xl font-bold text-gray-900">{totalPages}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <div>
                  <p className="font-medium">Error loading images</p>
                  <p className="text-sm text-red-500">{error}</p>
                </div>
                <Button onClick={() => fetchImages(currentPage)} variant="outline" size="sm" className="ml-auto">
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Images Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Images ({images.length} on this page)</CardTitle>
            <CardDescription>Manage uploaded images and moderate content</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <p className="text-sm text-gray-500">Loading images...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Failed to load images</p>
                <Button onClick={() => fetchImages(currentPage)} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No images found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {images.map((image) => (
                  <div key={image.id} className="border rounded-lg p-4 space-y-3">
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={getSafeImageSrc(image) || "/placeholder.svg"}
                        alt={image.filename || "Uploaded image"}
                        className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                          setSelectedImage(image)
                          setShowImageModal(true)
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=200&width=300&text=Error+Loading"
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">{image.filename || "Unknown file"}</p>
                        <Badge variant="secondary" className="text-xs">
                          {getFileExtension(image.mimeType)}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>Size: {formatFileSize(image.size)}</p>
                        <p>Uploaded: {formatDate(image.uploadedAt)}</p>
                        <p>
                          API Key: <code className="bg-gray-100 px-1 rounded">{image.apiKeyUsed || "unknown"}</code>
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedImage(image)
                            setShowImageModal(true)
                          }}
                          className="flex-1"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteImage(image.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && !loading && !error && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchImages(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchImages(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Image Modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{selectedImage.filename || "Unknown file"}</h3>
                <Button variant="outline" size="sm" onClick={() => setShowImageModal(false)}>
                  Close
                </Button>
              </div>
              <div className="space-y-4">
                <img
                  src={getSafeImageSrc(selectedImage) || "/placeholder.svg"}
                  alt={selectedImage.filename || "Uploaded image"}
                  className="w-full max-h-96 object-contain rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=400&width=600&text=Error+Loading+Image"
                  }}
                />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">File Details</p>
                    <p>Size: {formatFileSize(selectedImage.size)}</p>
                    <p>Type: {selectedImage.mimeType || "Unknown"}</p>
                    <p>Uploaded: {formatDate(selectedImage.uploadedAt)}</p>
                  </div>
                  <div>
                    <p className="font-medium">API Information</p>
                    <p>
                      Key: <code className="bg-gray-100 px-1 rounded">{selectedImage.apiKeyUsed || "unknown"}</code>
                    </p>
                    <p>
                      Image ID: <code className="bg-gray-100 px-1 rounded">{selectedImage.id}</code>
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      deleteImage(selectedImage.id)
                      setShowImageModal(false)
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Image
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
