import { NextResponse } from "next/server"

// This would be set in your environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

export async function POST(request: Request) {
  try {
    const { text, model } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    if (!OPENAI_API_KEY) {
      // Fallback to a simple estimation if no API key is available
      // This is a very rough estimate and won't be accurate
      const words = text.trim().split(/\s+/).length
      const estimatedTokens = Math.ceil(words * 1.3) // Rough estimate: ~1.3 tokens per word

      return NextResponse.json({
        tokenCount: estimatedTokens,
        note: "This is an estimated count. For accurate counts, configure an OpenAI API key.",
      })
    }

    // Use OpenAI's tokenizer endpoint
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: model || "gpt-4o",
        messages: [{ role: "user", content: text }],
        max_tokens: 1, // We only need to know the prompt tokens
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "Failed to count tokens")
    }

    const data = await response.json()
    const tokenCount = data.usage.prompt_tokens

    return NextResponse.json({ tokenCount })
  } catch (error) {
    console.error("Token counting error:", error)
    return NextResponse.json({ error: error.message || "Failed to count tokens" }, { status: 500 })
  }
}
