import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

// Generate a random API key
function generateApiKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = "img_"
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, company, website, useCase } = body

    // Validate required fields
    if (!name || !email || !useCase) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: name, email, and useCase are required",
        },
        { status: 400 },
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email format",
        },
        { status: 400 },
      )
    }

    // Generate API key
    const apiKey = generateApiKey()

    // Create the API key document
    const apiKeyData = {
      key: apiKey,
      active: true,
      applicant: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        company: company?.trim() || null,
        website: website?.trim() || null,
        useCase: useCase.trim(),
      },
      createdAt: serverTimestamp(),
      usage: {
        totalUploads: 0,
        lastUsed: null,
      },
      metadata: {
        userAgent: request.headers.get("user-agent") || null,
        ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || null,
      },
    }

    // Save to Firebase
    const docRef = await addDoc(collection(db, "apiKeys"), apiKeyData)

    console.log("API key application created:", {
      docId: docRef.id,
      email: email,
      apiKey: apiKey.substring(0, 8) + "...", // Log partial key for debugging
    })

    return NextResponse.json({
      success: true,
      message: "API key generated successfully! You can now use it to upload images.",
      apiKey: apiKey,
    })
  } catch (error) {
    console.error("API key application error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process API key application. Please try again.",
        debug: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: "Method not allowed. Use POST to apply for an API key.",
    },
    { status: 405 },
  )
}
