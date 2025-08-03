import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("=== SIMPLE UPLOAD START ===")

    // Parse body
    const body = await request.json()
    const { imageData, fileName, apiKey } = body

    console.log("Body parsed:", {
      hasImageData: !!imageData,
      fileName,
      apiKey,
      dataLength: imageData?.length,
    })

    if (!imageData || !fileName || !apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 },
      )
    }

    // Import Firebase dynamically
    console.log("Importing Firebase...")
    const { db } = await import("@/lib/firebase")
    const { collection, addDoc, serverTimestamp } = await import("firebase/firestore")

    console.log("Firebase imported, db type:", typeof db)

    // Create document
    const imageDoc = {
      fileName,
      base64Data: imageData,
      uploadedAt: serverTimestamp(),
      createdAt: new Date().toISOString(),
    }

    console.log("Creating document...")
    const imagesCollection = collection(db, "images")
    const docRef = await addDoc(imagesCollection, imageDoc)

    console.log("Document created:", docRef.id)

    return NextResponse.json({
      success: true,
      imageId: docRef.id,
      message: "Upload successful",
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
