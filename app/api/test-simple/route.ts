import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Just test that the API route works
    return NextResponse.json({
      success: true,
      message: "API route is working",
      timestamp: new Date().toISOString(),
      env: {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "missing",
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "set" : "missing",
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
