import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { doc, deleteDoc } from "firebase/firestore"

export async function DELETE(request: NextRequest) {
  try {
    const { imageId } = await request.json()

    if (!imageId) {
      return NextResponse.json(
        {
          success: false,
          error: "Image ID is required",
        },
        { status: 400 },
      )
    }

    // Delete the document from Firebase
    const imageRef = doc(db, "images", imageId)
    await deleteDoc(imageRef)

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting image:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete image",
      },
      { status: 500 },
    )
  }
}
