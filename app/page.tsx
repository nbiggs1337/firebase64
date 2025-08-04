"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Upload,
  ImageIcon,
  AlertCircle,
  CheckCircle2,
  Database,
  HardDrive,
  LinkIcon,
  FileText,
  Key,
} from "lucide-react"
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

interface ApiKeyResponse {
  success: boolean
  apiKey?: string
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

  // API Key Application State
  const [applying, setApplying] = useState(false)
  const [applicationResult, setApplicationResult] = useState<ApiKeyResponse | null>(null)
  const [applicationData, setApplicationData] = useState({
    name: "",
    email: "",
    company: "",
    website: "",
    useCase: "",
  })

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

  const handleApiKeyApplication = async () => {
    if (!applicationData.name || !applicationData.email || !applicationData.useCase) {
      setApplicationResult({
        success: false,
        error: "Please fill in all required fields (Name, Email, and Use Case)",
      })
      return
    }

    setApplying(true)
    setApplicationResult(null)

    try {
      const response = await fetch("/api/apply-api-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationData),
      })

      const data = await response.json()
      setApplicationResult(data)

      if (data.success) {
        // Reset form on success
        setApplicationData({
          name: "",
          email: "",
          company: "",
          website: "",
          useCase: "",
        })
      }
    } catch (error) {
      console.error("Application error:", error)
      setApplicationResult({
        success: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      })
    } finally {
      setApplying(false)
    }
  }

  const resetForm = () => {
    setSelectedFile(null)
    setPreview(null)
    setResult(null)
    setUploadProgress(0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-purple-600 rounded-xl">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">ImageAPI</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Secure, fast, and reliable image upload service with instant access URLs
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <span>✓ 10MB max file size</span>
            <span>✓ Multiple formats supported</span>
            <span>✓ Instant CDN delivery</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center">
          <div className="flex gap-2 p-1 bg-white rounded-lg shadow-sm border">
            <Link href="/docs">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                API Docs
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload" className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Image
                  </TabsTrigger>
                  <TabsTrigger value="apply" className="flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Get API Key
                  </TabsTrigger>
                </TabsList>

                {/* Upload Tab */}
                <TabsContent value="upload">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      Upload Image
                    </CardTitle>
                    <CardDescription>
                      Upload your image and get an instant access URL. Supports JPEG, PNG, GIF, WebP, BMP, and SVG
                      formats.
                    </CardDescription>
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
                      <p className="text-xs text-gray-500">
                        Don't have an API key? Switch to the "Get API Key" tab to apply for one.
                      </p>
                    </div>

                    {/* File Upload Area */}
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        isDragActive ? "border-purple-500 bg-purple-50" : "border-gray-300 hover:border-gray-400"
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
                              {isDragActive
                                ? "Drop the image here..."
                                : "Drag & drop an image here, or click to select"}
                            </p>
                            <p className="text-xs text-gray-500">Maximum file size: 10MB</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Image Preview */}
                    {preview && (
                      <div className="space-y-2">
                        <Label>Preview</Label>
                        <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={preview || "/placeholder.svg"}
                            alt="Preview"
                            className="w-full h-full object-contain"
                          />
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
                          {uploadProgress >= 25 && uploadProgress < 50 && "Processing image..."}
                          {uploadProgress >= 50 && uploadProgress < 75 && "Uploading to server..."}
                          {uploadProgress >= 75 && uploadProgress < 100 && "Finalizing..."}
                          {uploadProgress === 100 && "Complete!"}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        onClick={handleUpload}
                        disabled={!selectedFile || !apiKey.trim() || uploading}
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                      >
                        {uploading ? "Uploading..." : "Upload Image"}
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
                                      <span className="font-medium">Image URL:</span>
                                    </div>
                                    <div className="bg-white p-3 rounded border">
                                      <code className="text-sm break-all">{result.viewUrl}</code>
                                    </div>
                                    <Link href={result.viewUrl} target="_blank">
                                      <Button size="sm" variant="outline" className="w-full bg-transparent">
                                        View Image
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
                </TabsContent>

                {/* API Key Application Tab */}
                <TabsContent value="apply">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="w-5 h-5" />
                      Apply for API Key
                    </CardTitle>
                    <CardDescription>
                      Fill out the form below to request access to our image upload API. We'll review your application
                      and provide you with an API key.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          placeholder="Enter your full name"
                          value={applicationData.name}
                          onChange={(e) => setApplicationData({ ...applicationData, name: e.target.value })}
                          disabled={applying}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email address"
                          value={applicationData.email}
                          onChange={(e) => setApplicationData({ ...applicationData, email: e.target.value })}
                          disabled={applying}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company">Company/Organization</Label>
                        <Input
                          id="company"
                          placeholder="Enter your company name"
                          value={applicationData.company}
                          onChange={(e) => setApplicationData({ ...applicationData, company: e.target.value })}
                          disabled={applying}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          type="url"
                          placeholder="https://your-website.com"
                          value={applicationData.website}
                          onChange={(e) => setApplicationData({ ...applicationData, website: e.target.value })}
                          disabled={applying}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="useCase">Use Case Description *</Label>
                      <Textarea
                        id="useCase"
                        placeholder="Please describe how you plan to use our image upload API..."
                        rows={4}
                        value={applicationData.useCase}
                        onChange={(e) => setApplicationData({ ...applicationData, useCase: e.target.value })}
                        disabled={applying}
                      />
                      <p className="text-xs text-gray-500">
                        Help us understand your project and expected usage volume.
                      </p>
                    </div>

                    <Button
                      onClick={handleApiKeyApplication}
                      disabled={applying || !applicationData.name || !applicationData.email || !applicationData.useCase}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {applying ? "Submitting Application..." : "Submit Application"}
                    </Button>

                    {/* Application Result */}
                    {applicationResult && (
                      <Alert
                        className={
                          applicationResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                        }
                      >
                        <div className="flex items-start gap-2">
                          {applicationResult.success ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                          )}
                          <div className="space-y-2 flex-1">
                            <AlertDescription className={applicationResult.success ? "text-green-800" : "text-red-800"}>
                              {applicationResult.success
                                ? applicationResult.message || "Application submitted successfully!"
                                : applicationResult.error}
                            </AlertDescription>
                            {applicationResult.success && applicationResult.apiKey && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                  <Key className="w-4 h-4" />
                                  <span className="font-medium">Your API Key:</span>
                                </div>
                                <div className="bg-white p-3 rounded border">
                                  <code className="text-sm break-all font-mono">{applicationResult.apiKey}</code>
                                </div>
                                <p className="text-xs text-green-700">
                                  Please save this API key securely. You can now use it to upload images via our API.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </Alert>
                    )}

                    <div className="text-xs text-gray-500 space-y-1">
                      <p>* Required fields</p>
                      <p>
                        We typically review applications within 24 hours. You'll receive your API key via email once
                        approved.
                      </p>
                    </div>
                  </CardContent>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Features Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Upload className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Fast Upload</h4>
                    <p className="text-sm text-gray-600">Lightning-fast image processing and storage</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <LinkIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Instant URLs</h4>
                    <p className="text-sm text-gray-600">Get immediate access URLs for your images</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Database className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Secure Storage</h4>
                    <p className="text-sm text-gray-600">Enterprise-grade security and reliability</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Supported Formats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="px-2 py-1 bg-gray-100 rounded text-center">JPEG</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-center">PNG</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-center">GIF</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-center">WebP</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-center">BMP</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-center">SVG</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
