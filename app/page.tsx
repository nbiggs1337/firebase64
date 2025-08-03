"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, ImageIcon, AlertCircle, CheckCircle2 } from "lucide-react"

export default function HomePage() {
  const [apiKey, setApiKey] = useState("test")
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>("")

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setSelectedFile(file)
      setResult(null)
      setDebugInfo("")

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
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
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

  const testSimpleApi = async () => {
    try {
      setDebugInfo("Testing simple API...")
      const response = await fetch("/api/test-simple")
      const data = await response.json()
      setDebugInfo(JSON.stringify(data, null, 2))
    } catch (error) {
      setDebugInfo(`Error: ${error.message}`)
    }
  }

  const testFirebaseSimple = async () => {
    try {
      setDebugInfo("Testing Firebase...")
      const response = await fetch("/api/test-firebase-simple")
      const data = await response.json()
      setDebugInfo(JSON.stringify(data, null, 2))
    } catch (error) {
      setDebugInfo(`Error: ${error.message}`)
    }
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
    setResult(null)
    setDebugInfo("")

    try {
      setDebugInfo("Converting to base64...")
      const base64Data = await convertToBase64(selectedFile)

      setDebugInfo("Uploading to Firebase...")
      const response = await fetch("/api/upload-simple", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageData: base64Data,
          fileName: selectedFile.name,
          apiKey: apiKey,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        setDebugInfo("Upload successful!")
      } else {
        setResult(data)
        setDebugInfo(`Upload failed: ${data.error}`)
      }
    } catch (error) {
      setResult({
        success: false,
        error: error.message,
      })
      setDebugInfo(`Error: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Simple Firebase Test</h1>
          <p className="text-gray-600">Testing Firebase with minimal setup</p>
        </div>

        {/* Debug Panel */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg text-green-800">Debug Panel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Button onClick={testSimpleApi} variant="outline" size="sm">
                Test Simple API
              </Button>
              <Button onClick={testFirebaseSimple} variant="outline" size="sm">
                Test Firebase
              </Button>
            </div>
            {debugInfo && (
              <div className="bg-white p-3 rounded border text-sm font-mono whitespace-pre-line">{debugInfo}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Simple Upload Test
            </CardTitle>
            <CardDescription>Minimal Firebase upload test</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* API Key Input */}
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="text"
                placeholder="Enter API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={uploading}
              />
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
                    <p className="text-xs text-gray-500">Supports JPEG, PNG, GIF, WebP (max 10MB)</p>
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

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={handleUpload} disabled={!selectedFile || !apiKey.trim() || uploading} className="flex-1">
                {uploading ? "Uploading..." : "Upload"}
              </Button>
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
                      {result.success ? result.message : result.error}
                    </AlertDescription>
                    {result.success && result.imageId && (
                      <div className="text-sm text-green-700">Image ID: {result.imageId}</div>
                    )}
                    {result.stack && (
                      <div className="text-xs text-red-600 bg-white p-2 rounded border font-mono">{result.stack}</div>
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
