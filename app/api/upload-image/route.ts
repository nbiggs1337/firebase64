import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { query, where, getDocs } from "firebase/firestore"

async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    console.log("→ Starting API key validation...")

    // Add timeout to the Firestore query
    const apiKeysCollection = collection(db, "apiKeys")
    const q = query(apiKeysCollection, where("key", "==", apiKey))

    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("API key validation timeout")), 5000)
    })

    // Race the query against the timeout
    const querySnapshot = await Promise.race([getDocs(q), timeoutPromise])

    console.log("✓ API key query completed")

    if (!querySnapshot.empty) {
      const docData = querySnapshot.docs[0].data()
      const isActive = docData.active !== false
      console.log(`✓ API key found, active: ${isActive}`)
      return isActive
    }

    console.log("✗ API key not found")
    return false
  } catch (error) {
    console.error("✗ Error validating API key:", error)

    // If it's a timeout error, return false but don't crash
    if (error instanceof Error && error.message.includes("timeout")) {
      console.log("→ API key validation timed out, rejecting request")
      return false
    }

    return false
  }
}

export async function POST(request: NextRequest) {
  console.log("=== UPLOAD API ROUTE CALLED ===")

  try {
    // Parse request body with timeout
    console.log("→ Parsing request body...")
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request parsing timeout")), 8000)
    })

    const bodyPromise = request.json()
    const body = await Promise.race([bodyPromise, timeoutPromise])

    console.log("✓ Request body parsed successfully")

    const { imageData, fileName, mimeType, apiKey } = body

    // Validate required fields
    if (!imageData || !fileName || !apiKey) {
      console.log("✗ Missing required fields")
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: imageData, fileName, and apiKey are required",
        },
        { status: 400 },
      )
    }

    console.log("✓ All required fields present")
    console.log(`File: ${fileName}, Size: ${imageData.length} chars`)

    // Validate API key with timeout
    console.log("→ Validating API key...")
    const isValidKey = await validateApiKey(apiKey)
    if (!isValidKey) {
      console.log("✗ Invalid API key")
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or inactive API key",
        },
        { status: 401 },
      )
    }

    console.log("✓ API key validated")

    // Calculate file size
    const fileSize = Math.round((imageData.length * 3) / 4)
    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2)

    console.log(`✓ File size calculated: ${fileSizeMB} MB`)

    // Create document for Firestore
    const imageDoc = {
      fileName,
      mimeType: mimeType || "image/webp",
      base64Data: imageData,
      fileSize,
      uploadedAt: serverTimestamp(),
      createdAt: new Date().toISOString(),
      apiKeyUsed: apiKey,
    }

    console.log("→ Saving to Firestore...")

    // Save to Firestore with timeout
    const firestorePromise = addDoc(collection(db, "images"), imageDoc)
    const firestoreTimeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Firestore save timeout")), 10000)
    })

    const docRef = await Promise.race([firestorePromise, firestoreTimeout])

    console.log("✓ Document saved with ID:", docRef.id)

    // Generate view URL with filename
    const baseUrl = request.nextUrl.origin
    const viewUrl = `${baseUrl}/view/${docRef.id}/${fileName}`

    console.log("✓ Upload completed successfully!")

    return NextResponse.json({
      success: true,
      imageId: docRef.id,
      viewUrl,
      fileSize,
      fileSizeMB: Number.parseFloat(fileSizeMB),
      message: "Image uploaded successfully!",
    })
  } catch (error) {
    console.error("=== UPLOAD ERROR ===", error)

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("timeout")) {
        console.log("→ Request timed out")
        return NextResponse.json(
          {
            success: false,
            error: "Upload timeout - please try with a smaller image or check your connection",
          },
          { status: 408 },
        )
      }

      if (error.message.includes("permission-denied")) {
        return NextResponse.json(
          {
            success: false,
            error: "Database permission denied - please contact support",
          },
          { status: 403 },
        )
      }

      if (error.message.includes("unavailable")) {
        return NextResponse.json(
          {
            success: false,
            error: "Database temporarily unavailable - please try again",
          },
          { status: 503 },
        )
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Upload failed - please try again",
      },
      { status: 500 },
    )
  }
}
