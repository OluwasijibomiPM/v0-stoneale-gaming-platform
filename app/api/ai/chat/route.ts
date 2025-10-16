import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message, conversationHistory } = body

    // Simulate AI processing with mental health focus
    const response = {
      message: generateWellnessResponse(message),
      suggestions: [
        "Would you like to try a breathing exercise?",
        "I can suggest some mindfulness techniques",
        "Let's explore what's causing these feelings",
      ],
      resources: [
        {
          title: "Cognitive Behavioral Techniques",
          type: "article",
        },
        {
          title: "Mindfulness Meditation Guide",
          type: "video",
        },
      ],
    }

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 })
  }
}

function generateWellnessResponse(message: string): string {
  // This would integrate with actual AI in production
  return "Thank you for sharing. Based on research in cognitive behavioral therapy, I can help you work through this. Would you like to explore some evidence-based coping strategies?"
}
