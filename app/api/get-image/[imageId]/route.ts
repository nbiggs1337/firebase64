import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

export async function GET(request: NextRequest, { params }: { params: { imageId: string } }) {
  try {
    const { imageId } = params

    if (!imageId) {
      return NextResponse.json({ success: false, error: "Image ID is required" }, { status: 400 })
    }

    // Get document from Firestore
    const docRef = doc(db, "images", imageId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return NextResponse.json({ success: false, error: "Image not found" }, { status: 404 })
    }

    const data = docSnap.data()

    return NextResponse.json({
      success: true,
      imageId,
      fileName: data.fileName,
      mimeType: data.mimeType || "image/jpeg",
      base64Data: data.base64Data,
      fileSize: data.fileSize,
      uploadedAt: data.uploadedAt,
      createdAt: data.createdAt,
    })
  } catch (error) {
    console.error("Get image error:", error)

    if (error.code === "permission-denied") {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 })
    }

    return NextResponse.json({ success: false, error: "Failed to retrieve image" }, { status: 500 })
  }
}
