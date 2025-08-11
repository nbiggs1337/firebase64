import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

// GET /view/:imageId/:filename
export async function GET(req: Request, { params }: { params: { imageId: string; filename: string } }) {
  try {
    const { imageId } = params
    const ref = doc(db, "images", imageId)
    const snap = await getDoc(ref)

    if (!snap.exists()) {
      return new Response("Not Found", { status: 404 })
    }

    const data = snap.data() as {
      fileName: string
      mimeType: string
      base64Data: string
    }

    if (!data?.base64Data || !data?.mimeType) {
      return new Response("Invalid image data", { status: 422 })
    }

    // Decode base64 to binary
    const buffer = Buffer.from(data.base64Data, "base64")

    // Use stored fileName to ensure correct filename in headers
    const fileName = data.fileName || `${imageId}.png`

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": data.mimeType,
        "Content-Length": String(buffer.length),
        // Hint to browsers and CDNs to cache aggressively
        "Cache-Control": "public, max-age=31536000, immutable",
        // Inline display while preserving a proper filename when saved
        "Content-Disposition": `inline; filename="${encodeURIComponent(fileName)}"`,
      },
    })
  } catch (err) {
    return new Response("Server Error", { status: 500 })
  }
}
