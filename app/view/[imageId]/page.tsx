import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { notFound } from "next/navigation"

interface ImageData {
  fileName: string
  mimeType: string
  base64Data: string
  fileSize: number
  uploadedAt: any
  createdAt: string
}

async function getImage(imageId: string): Promise<ImageData | null> {
  try {
    const docRef = doc(db, "images", imageId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return docSnap.data() as ImageData
    }
    return null
  } catch (error) {
    console.error("Error fetching image:", error)
    return null
  }
}

export default async function ViewImage({ params }: { params: { imageId: string } }) {
  const imageData = await getImage(params.imageId)

  if (!imageData) {
    notFound()
  }

  const { base64Data, mimeType, fileName } = imageData
  const imageSrc = `data:${mimeType};base64,${base64Data}`

  return (
    <img
      src={imageSrc || "/placeholder.svg"}
      alt={fileName}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        display: "block",
      }}
    />
  )
}
