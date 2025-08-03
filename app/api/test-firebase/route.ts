import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, addDoc, deleteDoc, doc } from "firebase/firestore"

export async function GET() {
  console.log("=== TEST FIREBASE ROUTE CALLED ===")

  try {
    if (!db) {
      return NextResponse.json(
        {
          success: false,
          error: "Firebase Firestore not initialized",
        },
        { status: 500 },
      )
    }

    console.log("✓ Firebase db is available")
    console.log("DB constructor:", db.constructor.name)

    // Try to perform a simple operation
    let testDocId = "unknown"
    try {
      console.log("→ Creating test document...")
      const testCollection = collection(db, "test")
      console.log("✓ Collection reference created")

      const testDoc = await addDoc(testCollection, {
        test: true,
        timestamp: new Date(),
        message: "Firebase Client SDK test",
      })
      testDocId = testDoc.id
      console.log("✓ Test document created with ID:", testDocId)

      // Clean up test document
      console.log("→ Cleaning up test document...")
      const docToDelete = doc(db, "test", testDoc.id)
      await deleteDoc(docToDelete)
      console.log("✓ Test document deleted")
    } catch (firestoreError) {
      console.error("✗ Firestore operation failed:", firestoreError)

      const errorMessage = firestoreError.message
      let suggestions = ["Check Firestore permissions and security rules"]

      if (errorMessage.includes("PERMISSION_DENIED")) {
        suggestions = [
          "Update your Firestore security rules to allow read/write access",
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
          error: `Firestore operation failed: ${errorMessage}`,
          suggestions: suggestions,
          sdk: "Firebase Client SDK v10",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Firebase Client SDK connection successful",
      testDocId: testDocId,
      sdk: "Firebase Client SDK v10",
      operations: ["create document", "delete document"],
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    })
  } catch (error) {
    console.error("=== TEST FIREBASE ERROR ===", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        sdk: "Firebase Client SDK v10",
      },
      { status: 500 },
    )
  }
}
