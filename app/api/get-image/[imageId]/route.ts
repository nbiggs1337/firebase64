import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

export async function GET(request: NextRequest, { params }: { params: { imageId: string } }) {
  console.log("=== GET IMAGE API CALLED ===")
  console.log("Image ID:", params.imageId)

  try {
    if (!db) {
      return NextResponse.json(
        {
          success: false,
          error: "Database connection not available",
        },
        { status: 500 },
      )
    }

    const { imageId } = params

    if (!imageId || typeof imageId !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Valid Image ID is required",
        },
        { status: 400 },
      )
    }

    console.log("✓ Fetching document from Firestore...")

    // Get document from Firestore
    let docSnap
    try {
      const docRef = doc(db, "images", imageId)
      docSnap = await getDoc(docRef)
      console.log("✓ Document fetch completed, exists:", docSnap.exists())
    } catch (firestoreError) {
      console.error("✗ Firestore get error:", firestoreError)
      return NextResponse.json(
        {
          success: false,
          error: `Failed to retrieve from Firestore: ${firestoreError.message}`,
        },
        { status: 500 },
      )
    }

    if (!docSnap.exists()) {
      return NextResponse.json(
        {
          success: false,
          error: "Image not found",
        },
        { status: 404 },
      )
    }

    const data = docSnap.data()

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          error: "Image data is corrupted",
        },
        { status: 500 },
      )
    }

    // Handle timestamp conversion
    let uploadedAt = data.createdAt
    if (data.uploadedAt && typeof data.uploadedAt.toDate === "function") {
      uploadedAt = data.uploadedAt.toDate().toISOString()
    } else if (data.uploadedAt && data.uploadedAt instanceof Date) {
      uploadedAt = data.uploadedAt.toISOString()
    }

    const imageData = {
      id: docSnap.id,
      fileName: data.fileName || "unknown.jpg",
      mimeType: data.mimeType || "image/jpeg",
      base64Data: data.base64Data || "",
      fileSize: data.fileSize || 0,
      fileSizeMB: data.fileSizeMB || 0,
      uploadedAt,
    }

    // Validate essential data
    if (!imageData.base64Data) {
      return NextResponse.json(
        {
          success: false,
          error: "Image data is missing or corrupted",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      imageData,
    })
  } catch (error) {
    console.error("=== GET IMAGE ERROR ===", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
