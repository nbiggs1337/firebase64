import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, query, orderBy, limit, startAfter, getDocs, getCountFromServer } from "firebase/firestore"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const pageLimit = Number.parseInt(searchParams.get("limit") || "100")

    // Get total count
    const imagesRef = collection(db, "images")
    const countSnapshot = await getCountFromServer(imagesRef)
    const totalImages = countSnapshot.data().count
    const totalPages = Math.ceil(totalImages / pageLimit)

    // Build query
    let imagesQuery = query(imagesRef, orderBy("uploadedAt", "desc"), limit(pageLimit))

    // Handle pagination
    if (page > 1) {
      const skipCount = (page - 1) * pageLimit
      const skipQuery = query(imagesRef, orderBy("uploadedAt", "desc"), limit(skipCount))
      const skipSnapshot = await getDocs(skipQuery)
      const lastDoc = skipSnapshot.docs[skipSnapshot.docs.length - 1]

      if (lastDoc) {
        imagesQuery = query(imagesRef, orderBy("uploadedAt", "desc"), startAfter(lastDoc), limit(pageLimit))
      }
    }

    const snapshot = await getDocs(imagesQuery)
    const images = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

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
    console.error("Error fetching images:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch images",
      },
      { status: 500 },
    )
  }
}
