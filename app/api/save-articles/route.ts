import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function POST(request: Request) {
  try {
    const { articles } = await request.json()

    // Create articles directory if it doesn't exist
    const articlesDir = join(process.cwd(), "generated-articles")
    await mkdir(articlesDir, { recursive: true })

    // Save each article
    const savedFiles = []
    for (const article of articles) {
      if (article.status === "completed") {
        const filename = `${article.topic.id}.mdx`
        const filepath = join(articlesDir, filename)
        await writeFile(filepath, article.content, "utf8")
        savedFiles.push(filename)
      }
    }

    return Response.json({
      success: true,
      message: `Saved ${savedFiles.length} articles to generated-articles folder`,
      files: savedFiles,
    })
  } catch (error) {
    console.error("Error saving articles:", error)
    return Response.json({ error: "Failed to save articles" }, { status: 500 })
  }
}
