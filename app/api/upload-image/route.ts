import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

export async function POST(request: NextRequest) {
  console.log("=== UPLOAD API ROUTE CALLED ===")

  try {
    // Check if db is properly initialized
    if (!db) {
      console.error("Firebase db not available")
      return NextResponse.json(
        {
          success: false,
          error: "Firebase Firestore not initialized",
        },
        { status: 500 },
      )
    }

    console.log("✓ Firebase db is available")
    console.log("DB instance:", db.constructor.name)

    // Parse request body
    let body
    try {
      body = await request.json()
      console.log("✓ Request body parsed, keys:", Object.keys(body))
    } catch (parseError) {
      console.error("✗ Failed to parse JSON:", parseError)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON in request body",
        },
        { status: 400 },
      )
    }

    const { imageData, fileName, mimeType, apiKey } = body

    // Basic validation
    if (!imageData || !fileName || !apiKey) {
      console.log("✗ Missing fields:", {
        hasImageData: !!imageData,
        hasFileName: !!fileName,
        hasApiKey: !!apiKey,
      })
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: imageData, fileName, or apiKey",
        },
        { status: 400 },
      )
    }

    console.log("✓ All required fields present")

    // Simple API key validation
    if (!apiKey || apiKey.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "API key is required",
        },
        { status: 401 },
      )
    }

    // Calculate file size
    const fileSizeBytes = Math.round((imageData.length * 3) / 4)
    const fileSizeMB = (fileSizeBytes / (1024 * 1024)).toFixed(2)

    console.log(`✓ File size calculated: ${fileSizeMB} MB`)

    // Create document for Firestore
    const imageDoc = {
      fileName: fileName,
      mimeType: mimeType || "image/jpeg",
      base64Data: imageData,
      fileSize: fileSizeBytes,
      fileSizeMB: Number.parseFloat(fileSizeMB),
      uploadedAt: serverTimestamp(),
      createdAt: new Date().toISOString(),
      apiKey: apiKey,
    }

    console.log("✓ Document prepared for Firestore")

    // Save to Firestore
    let docRef
    try {
      console.log("→ Creating collection reference...")
      const imagesCollection = collection(db, "images")
      console.log("✓ Collection reference created")

      console.log("→ Adding document to collection...")
      docRef = await addDoc(imagesCollection, imageDoc)
      console.log("✓ Document saved successfully with ID:", docRef.id)
    } catch (firestoreError) {
      console.error("✗ Firestore save error:", firestoreError)

      const errorMessage = firestoreError.message
      let suggestions = ["Check Firestore permissions and project configuration"]

      if (errorMessage.includes("PERMISSION_DENIED")) {
        suggestions = [
          "Update your Firestore security rules to allow write access",
          "Go to Firebase Console → Firestore Database → Rules",
          "Set rules to: allow read, write: if true; (for testing)",
        ]
      } else if (errorMessage.includes("NOT_FOUND")) {
        suggestions = [
          "Make sure Firestore database is created in your Firebase project",
          "Go to Firebase Console → Firestore Database → Create database",
        ]
      }

      return NextResponse.json(
        {
          success: false,
          error: `Failed to save to Firestore: ${errorMessage}`,
          suggestions: suggestions,
        },
        { status: 500 },
      )
    }

    // Generate view URL
    const viewUrl = `/view/${docRef.id}`

    console.log("✓ Upload completed successfully!")

    return NextResponse.json({
      success: true,
      imageId: docRef.id,
      viewUrl: `${request.nextUrl.origin}${viewUrl}`,
      fileSize: fileSizeBytes,
      fileSizeMB: Number.parseFloat(fileSizeMB),
      message: "Image uploaded to Firebase Firestore successfully!",
      debug: {
        firestoreDocId: docRef.id,
        collectionPath: "images",
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("=== UNEXPECTED ERROR ===", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}

// Keep the GET method for testing
export async function GET() {
  console.log("=== UPLOAD API GET TEST ===")

  try {
    return NextResponse.json({
      message: "Upload API is working",
      timestamp: new Date().toISOString(),
      firebase: {
        initialized: !!db,
        config: {
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "not set",
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "✓ Set" : "✗ Missing",
        },
        sdk: "Firebase Client SDK v10",
        debug: {
          dbConstructor: db?.constructor?.name,
        },
      },
    })
  } catch (error) {
    return NextResponse.json({
      message: "Upload API error",
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
