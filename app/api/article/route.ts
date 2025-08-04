import { generateText } from "ai"
import { xai } from "@ai-sdk/xai"

export async function POST(request: Request) {
  try {
    const { topic } = await request.json()

    const { text } = await generateText({
      model: xai("grok-3"),
      prompt: `Write a comprehensive, well-structured article about "${topic.title}" in MDX format.

      Requirements:
      - Use proper MDX syntax with React components
      - Include a compelling title and subtitle
      - Structure with clear headings (##, ###)
      - Add relevant code examples where appropriate using \`\`\`language syntax
      - Include practical examples and real-world applications
      - Use callout boxes for important information
      - Add a conclusion section
      - Make it engaging and informative for tech professionals
      - Length should be 800-1200 words
      - Focus on: ${topic.description}

      MDX Components you can use:
      - <Callout type="info|warning|success">content</Callout>
      - <CodeBlock language="javascript|python|bash">code</CodeBlock>
      - Standard markdown syntax for lists, links, emphasis

      Start with a frontmatter section:
      ---
      title: "${topic.title}"
      description: "${topic.description}"
      category: "${topic.category}"
      publishedAt: "${new Date().toISOString()}"
      ---

      Then write the full article content.`,
    })

    return Response.json({ content: text })
  } catch (error) {
    console.error("Error generating article:", error)
    return Response.json({ error: "Failed to generate article" }, { status: 500 })
  }
}
