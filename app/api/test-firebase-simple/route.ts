import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Import Firebase here to see if it causes issues
    const { db } = await import("@/lib/firebase")
    const { collection, addDoc } = await import("firebase/firestore")

    console.log("Firebase imported successfully")
    console.log("DB type:", typeof db)

    // Try a simple operation
    const testCollection = collection(db, "test")
    const docRef = await addDoc(testCollection, {
      test: true,
      timestamp: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: "Firebase test successful",
      docId: docRef.id,
    })
  } catch (error) {
    console.error("Firebase test error:", error)
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
