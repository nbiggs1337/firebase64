import { generateObject } from "ai"
import { xai } from "@ai-sdk/xai"
import { z } from "zod"

const topicsSchema = z.object({
  topics: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      category: z.string(),
    }),
  ),
})

export async function GET() {
  try {
    const { object } = await generateObject({
      model: xai("grok-3"),
      schema: topicsSchema,
      prompt: `Generate 20 diverse and current technology topics that would make for engaging articles.
      Include topics from different categories like AI, web development, cybersecurity, mobile tech,
      blockchain, cloud computing, IoT, and emerging technologies.
      
      For each topic, provide:
      - A unique ID (kebab-case)
      - An engaging title
      - A brief description of what the article would cover
      - A category classification
      
      Make sure the topics are current, relevant, and would appeal to tech professionals and enthusiasts.`,
    })

    return Response.json(object)
  } catch (error) {
    console.error("Error generating topics:", error)
    return Response.json({ error: "Failed to generate topics" }, { status: 500 })
  }
}
