import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore"

import { query, where, getDocs } from "firebase/firestore"

async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const apiKeysCollection = collection(db, "apiKeys")
    const q = query(apiKeysCollection, where("key", "==", apiKey))
    const querySnapshot = await getDocs(q)
    if (!querySnapshot.empty) {
      // Check if any matching key is active
      const docData = querySnapshot.docs[0].data()
      return docData.active !== false // Default to true if active field doesn't exist
    }
    return false
  } catch (error) {
    console.error("Error validating API key:", error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageData, fileName, mimeType, apiKey } = body

    // Validate required fields
    if (!imageData || !fileName || !apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: imageData, fileName, and apiKey are required",
        },
        { status: 400 },
      )
    }

    // Validate API key against Firebase collection
    const isValidKey = await validateApiKey(apiKey)
    if (!isValidKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or inactive API key",
        },
        { status: 401 },
      )
    }

    // Create document for Firestore
    const imageDoc = {
      fileName,
      mimeType: mimeType || "image/jpeg",
      base64Data: imageData,
      fileSize: Math.round((imageData.length * 3) / 4), // Approximate file size from base64
      uploadedAt: serverTimestamp(),
      createdAt: new Date().toISOString(),
      apiKeyUsed: apiKey, // Track which API key was used
    }

    // Save to Firestore
    const imagesCollection = collection(db, "images")
    const docRef = await addDoc(imagesCollection, imageDoc)

    // Generate view URL
    const baseUrl = request.nextUrl.origin
    const viewUrl = `${baseUrl}/view/${docRef.id}`

    return NextResponse.json({
      success: true,
      imageId: docRef.id,
      viewUrl,
      fileSize: imageDoc.fileSize,
      fileSizeMB: (imageDoc.fileSize / (1024 * 1024)).toFixed(2),
      message: "Image uploaded successfully to Firebase Firestore",
    })
  } catch (error) {
    console.error("Upload error:", error)

    // Handle specific Firebase errors
    if (error.code === "permission-denied") {
      return NextResponse.json(
        {
          success: false,
          error: "Firebase permission denied. Check your Firestore security rules.",
        },
        { status: 403 },
      )
    }

    if (error.code === "unavailable") {
      return NextResponse.json(
        {
          success: false,
          error: "Firebase service temporarily unavailable. Please try again.",
        },
        { status: 503 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to upload image. Please try again.",
      },
      { status: 500 },
    )
  }
}
