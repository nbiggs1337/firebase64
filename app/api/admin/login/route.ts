import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { adminKey } = await request.json()

    // Check against environment variable
    const validAdminKey = process.env.ADMIN_KEY

    if (!validAdminKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Admin key not configured",
        },
        { status: 500 },
      )
    }

    if (adminKey !== validAdminKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid admin key",
        },
        { status: 401 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Admin authenticated successfully",
    })
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Authentication failed",
      },
      { status: 500 },
    )
  }
}
