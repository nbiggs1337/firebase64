import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { NextResponse } from "next/server"

// GET /view/:imageId -> redirect to /view/:imageId/:fileName
export async function GET(req: Request, { params }: { params: { imageId: string } }) {
  try {
    const { imageId } = params
    const ref = doc(db, "images", imageId)
    const snap = await getDoc(ref)

    if (!snap.exists()) {
      return new Response("Not Found", { status: 404 })
    }

    const data = snap.data() as { fileName?: string }
    const fileName = data?.fileName || `${imageId}.png`

    const url = new URL(req.url)
    const target = new URL(`/view/${encodeURIComponent(imageId)}/${encodeURIComponent(fileName)}`, url.origin)
    return NextResponse.redirect(target, 302)
  } catch {
    return new Response("Server Error", { status: 500 })
  }
}
