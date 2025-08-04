"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Upload, ImageIcon, AlertCircle, CheckCircle2, Database, HardDrive, LinkIcon } from "lucide-react"
import Link from "next/link"

interface UploadResponse {
  success: boolean
  imageId?: string
  viewUrl?: string
  fileSize?: number
  fileSizeMB?: string
  error?: string
  message?: string
}

export default function HomePage() {
  const [apiKey, setApiKey] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [result, setResult] = useState<UploadResponse | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setSelectedFile(file)
      setResult(null)

      // Create preview
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp", ".bmp", ".svg"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string
        const base64 = result.split(",")[1]
        resolve(base64)
      }
      reader.onerror = (error) => reject(error)
    })
  }

  const handleUpload = async () => {
    if (!selectedFile || !apiKey.trim()) {
      setResult({
        success: false,
        error: "Please select a file and enter your API key",
      })
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setResult(null)

    try {
      setUploadProgress(25)
      const base64Data = await convertToBase64(selectedFile)

      setUploadProgress(50)
      const response = await fetch("/api/upload-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageData: base64Data,
          fileName: selectedFile.name,
          mimeType: selectedFile.type,
          apiKey: apiKey.trim(),
        }),
      })

      setUploadProgress(75)
      const data = await response.json()
      setUploadProgress(100)

      setResult(data)
    } catch (error) {
      console.error("Upload error:", error)
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      })
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  const resetForm = () => {
    setSelectedFile(null)
    setPreview(null)
    setResult(null)
    setUploadProgress(0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Firebase Image Upload</h1>
          <p className="text-gray-600">Upload images to Firebase Firestore as base64 strings</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Image
            </CardTitle>
            <CardDescription>Images are converted to base64 and stored in Firebase Firestore</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* API Key Input */}
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={uploading}
              />
              <p className="text-xs text-gray-500">Enter any non-empty value for testing purposes</p>
            </div>

            {/* File Upload Area */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
              } ${uploading ? "pointer-events-none opacity-50" : ""}`}
            >
              <input {...getInputProps()} />
              <div className="space-y-4">
                <ImageIcon className="w-12 h-12 mx-auto text-gray-400" />
                {selectedFile ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      {isDragActive ? "Drop the image here..." : "Drag & drop an image here, or click to select"}
                    </p>
                    <p className="text-xs text-gray-500">Supports JPEG, PNG, GIF, WebP, BMP, SVG (max 10MB)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Image Preview */}
            {preview && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <img src={preview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-contain" />
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <Label>Upload Progress</Label>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-gray-600 text-center">
                  {uploadProgress < 25 && "Preparing upload..."}
                  {uploadProgress >= 25 && uploadProgress < 50 && "Converting to base64..."}
                  {uploadProgress >= 50 && uploadProgress < 75 && "Uploading to Firebase..."}
                  {uploadProgress >= 75 && uploadProgress < 100 && "Finalizing..."}
                  {uploadProgress === 100 && "Complete!"}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={handleUpload} disabled={!selectedFile || !apiKey.trim() || uploading} className="flex-1">
                {uploading ? "Uploading..." : "Upload to Firebase"}
              </Button>
              {selectedFile && (
                <Button variant="outline" onClick={resetForm} disabled={uploading}>
                  Reset
                </Button>
              )}
            </div>

            {/* Result Display */}
            {result && (
              <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <div className="flex items-start gap-2">
                  {result.success ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                  )}
                  <div className="space-y-2 flex-1">
                    <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
                      {result.success ? result.message || "Upload successful!" : result.error}
                    </AlertDescription>
                    {result.success && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 text-sm text-green-700">
                          <div className="flex items-center gap-1">
                            <Database className="w-4 h-4" />
                            <span>ID: {result.imageId}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <HardDrive className="w-4 h-4" />
                            <span>Size: {result.fileSizeMB} MB</span>
                          </div>
                        </div>
                        {result.viewUrl && (
                          <>
                            <div className="flex items-center gap-2 text-sm">
                              <LinkIcon className="w-4 h-4" />
                              <span className="font-medium">View URL:</span>
                            </div>
                            <div className="bg-white p-3 rounded border">
                              <code className="text-sm break-all">{result.viewUrl}</code>
                            </div>
                            <Link href={result.viewUrl} target="_blank">
                              <Button size="sm" variant="outline" className="w-full bg-transparent">
                                Open Image in New Tab
                              </Button>
                            </Link>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
