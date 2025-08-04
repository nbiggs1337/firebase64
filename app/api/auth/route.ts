export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (password === process.env.ADMIN_KEY) {
      return Response.json({ success: true })
    } else {
      return Response.json({ success: false, error: "Invalid password" }, { status: 401 })
    }
  } catch (error) {
    console.error("Auth error:", error)
    return Response.json({ success: false, error: "Authentication failed" }, { status: 500 })
  }
}
