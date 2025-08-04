"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, ArrowLeft, Code, Upload, Key } from "lucide-react"
import Link from "next/link"

export default function DocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const jsAxiosExample = `import axios from 'axios';

// Convert file to base64
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

// Upload image
const uploadImage = async (file, apiKey) => {
  try {
    const base64Data = await convertToBase64(file);
    
    const response = await axios.post('/api/upload-image', {
      imageData: base64Data,
      fileName: file.name,
      mimeType: file.type,
      apiKey: apiKey
    });
    
    console.log('Upload successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Upload failed:', error.response?.data || error.message);
    throw error;
  }
};

// Usage
const fileInput = document.getElementById('file-input');
const file = fileInput.files[0];
const apiKey = 'your-api-key-here';

uploadImage(file, apiKey)
  .then(result => {
    console.log('Image URL:', result.viewUrl);
  })
  .catch(error => {
    console.error('Error:', error);
  });`

  const curlExample = `# Convert your image to base64 first
base64_data=$(base64 -i your-image.jpg)

# Upload the image
curl -X POST https://your-domain.com/api/upload-image \\
  -H "Content-Type: application/json" \\
  -d '{
    "imageData": "'$base64_data'",
    "fileName": "your-image.jpg",
    "mimeType": "image/jpeg",
    "apiKey": "your-api-key-here"
  }'`

  const pythonExample = `import requests
import base64
import json

def upload_image(file_path, api_key, api_url="https://your-domain.com/api/upload-image"):
    """
    Upload an image to the ImageAPI service
    
    Args:
        file_path (str): Path to the image file
        api_key (str): Your API key
        api_url (str): API endpoint URL
    
    Returns:
        dict: Response from the API
    """
    try:
        # Read and encode the image
        with open(file_path, 'rb') as image_file:
            base64_data = base64.b64encode(image_file.read()).decode('utf-8')
        
        # Get file info
        file_name = file_path.split('/')[-1]
        mime_type = f"image/{file_name.split('.')[-1].lower()}"
        
        # Prepare the request
        payload = {
            "imageData": base64_data,
            "fileName": file_name,
            "mimeType": mime_type,
            "apiKey": api_key
        }
        
        # Make the request
        response = requests.post(api_url, json=payload)
        response.raise_for_status()
        
        return response.json()
        
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None

# Usage example
if __name__ == "__main__":
    api_key = "your-api-key-here"
    file_path = "path/to/your/image.jpg"
    
    result = upload_image(file_path, api_key)
    
    if result and result.get('success'):
        print(f"Upload successful!")
        print(f"Image ID: {result.get('imageId')}")
        print(f"View URL: {result.get('viewUrl')}")
        print(f"File Size: {result.get('fileSizeMB')} MB")
    else:
        print("Upload failed:", result.get('error') if result else "Unknown error")`

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Upload
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Code className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">API Documentation</h1>
              <p className="text-gray-600">Complete guide to using the ImageAPI service</p>
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Quick Start
            </CardTitle>
            <CardDescription>Get started with ImageAPI in just a few steps</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-600 rounded-full font-semibold text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Get API Key</h4>
                  <p className="text-sm text-gray-600">Apply for an API key using our application form</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-600 rounded-full font-semibold text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Convert to Base64</h4>
                  <p className="text-sm text-gray-600">Encode your image file as a base64 string</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-600 rounded-full font-semibold text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Make Request</h4>
                  <p className="text-sm text-gray-600">POST to /api/upload-image with your data</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Reference */}
        <Card>
          <CardHeader>
            <CardTitle>API Reference</CardTitle>
            <CardDescription>Complete reference for the ImageAPI endpoints</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Upload Endpoint */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="default" className="bg-green-600">
                  POST
                </Badge>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">/api/upload-image</code>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Request Body</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm">
                    {`{
  "imageData": "base64-encoded-image-data",
  "fileName": "image.jpg",
  "mimeType": "image/jpeg",
  "apiKey": "your-api-key"
}`}
                  </pre>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Response</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm">
                    {`{
  "success": true,
  "imageId": "unique-image-id",
  "viewUrl": "https://your-domain.com/view/unique-image-id",
  "fileSize": 1234567,
  "fileSizeMB": "1.23",
  "message": "Image uploaded successfully"
}`}
                  </pre>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Parameters</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded min-w-fit">imageData</code>
                    <div>
                      <p className="text-sm">
                        <strong>string</strong> (required)
                      </p>
                      <p className="text-sm text-gray-600">Base64-encoded image data without the data URL prefix</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded min-w-fit">fileName</code>
                    <div>
                      <p className="text-sm">
                        <strong>string</strong> (required)
                      </p>
                      <p className="text-sm text-gray-600">Original filename with extension</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded min-w-fit">mimeType</code>
                    <div>
                      <p className="text-sm">
                        <strong>string</strong> (required)
                      </p>
                      <p className="text-sm text-gray-600">MIME type of the image (e.g., image/jpeg, image/png)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded min-w-fit">apiKey</code>
                    <div>
                      <p className="text-sm">
                        <strong>string</strong> (required)
                      </p>
                      <p className="text-sm text-gray-600">Your API key for authentication</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Code Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Code Examples</CardTitle>
            <CardDescription>Ready-to-use code examples in popular programming languages</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="javascript" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="curl">cURL</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
              </TabsList>

              <TabsContent value="javascript" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">JavaScript with Axios</h4>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(jsAxiosExample, "js")}>
                    {copiedCode === "js" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedCode === "js" ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
                    <code>{jsAxiosExample}</code>
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="curl" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">cURL Command</h4>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(curlExample, "curl")}>
                    {copiedCode === "curl" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedCode === "curl" ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
                    <code>{curlExample}</code>
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="python" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Python with Requests</h4>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(pythonExample, "python")}>
                    {copiedCode === "python" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedCode === "python" ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
                    <code>{pythonExample}</code>
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Error Codes */}
        <Card>
          <CardHeader>
            <CardTitle>Error Codes</CardTitle>
            <CardDescription>Common error responses and their meanings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">400</Badge>
                    <span className="font-medium">Bad Request</span>
                  </div>
                  <p className="text-sm text-gray-600">Missing required fields or invalid data format</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">401</Badge>
                    <span className="font-medium">Unauthorized</span>
                  </div>
                  <p className="text-sm text-gray-600">Invalid or missing API key</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">413</Badge>
                    <span className="font-medium">Payload Too Large</span>
                  </div>
                  <p className="text-sm text-gray-600">Image file exceeds 10MB limit</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">500</Badge>
                    <span className="font-medium">Internal Server Error</span>
                  </div>
                  <p className="text-sm text-gray-600">Server error during image processing</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rate Limits */}
        <Card>
          <CardHeader>
            <CardTitle>Rate Limits & Guidelines</CardTitle>
            <CardDescription>Usage limits and best practices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium">Current Limits</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Maximum file size: 10MB</li>
                  <li>• Supported formats: JPEG, PNG, GIF, WebP, BMP, SVG</li>
                  <li>• Rate limit: 100 requests per minute</li>
                  <li>• Daily upload limit: 1,000 images</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium">Best Practices</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Compress images before uploading</li>
                  <li>• Use appropriate image formats</li>
                  <li>• Implement retry logic for failed requests</li>
                  <li>• Cache API responses when possible</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Get API Key CTA */}
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Need an API Key?
            </CardTitle>
            <CardDescription>Ready to start uploading images? Get your API key in minutes.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="bg-purple-600 hover:bg-purple-700">Apply for API Key</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
