import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, query, orderBy, limit, startAfter, getDocs, getCountFromServer } from "firebase/firestore"

export async function GET(request: NextRequest) {
  console.log("=== ADMIN IMAGES API CALLED ===", new Date().toISOString())

  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const pageLimit = Number.parseInt(searchParams.get("limit") || "100")

    console.log(`[ADMIN] Fetching page ${page} with limit ${pageLimit}`)

    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Firestore query timeout")), 10000) // 10 second timeout
    })

    // Get total count with timeout
    console.log("[ADMIN] → Getting total count...")
    const imagesRef = collection(db, "images")

    const countSnapshot = (await Promise.race([getCountFromServer(imagesRef), timeoutPromise])) as any

    const totalImages = countSnapshot.data().count
    const totalPages = Math.ceil(totalImages / pageLimit)

    console.log(`[ADMIN] ✓ Total images: ${totalImages}, Total pages: ${totalPages}`)

    // Build query with timeout
    console.log("[ADMIN] → Building query...")
    let imagesQuery = query(imagesRef, orderBy("uploadedAt", "desc"), limit(pageLimit))

    // Handle pagination
    if (page > 1) {
      console.log(`[ADMIN] → Handling pagination for page ${page}`)
      const skipCount = (page - 1) * pageLimit
      const skipQuery = query(imagesRef, orderBy("uploadedAt", "desc"), limit(skipCount))

      const skipSnapshot = (await Promise.race([getDocs(skipQuery), timeoutPromise])) as any

      const lastDoc = skipSnapshot.docs[skipSnapshot.docs.length - 1]

      if (lastDoc) {
        imagesQuery = query(imagesRef, orderBy("uploadedAt", "desc"), startAfter(lastDoc), limit(pageLimit))
      }
    }

    console.log("[ADMIN] → Executing main query...")
    const snapshot = (await Promise.race([getDocs(imagesQuery), timeoutPromise])) as any

    console.log(`[ADMIN] ✓ Query executed, found ${snapshot.docs.length} documents`)

    const images = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }))

    console.log(`[ADMIN] ✓ Returning ${images.length} images`)

    return NextResponse.json({
      success: true,
      images,
      totalImages,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    })
  } catch (error) {
    console.error("[ADMIN] Error fetching images:", error)

    // Handle timeout specifically
    if (error instanceof Error && error.message === "Firestore query timeout") {
      return NextResponse.json(
        {
          success: false,
          error: "Database query timed out. Please try again.",
        },
        { status: 408 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch images",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
