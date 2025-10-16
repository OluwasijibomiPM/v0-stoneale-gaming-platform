import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { mentalState, gameHistory } = body

    // AI-powered wellness suggestions
    const suggestions = [
      {
        category: "mindfulness",
        title: "Breathing Exercise",
        description: "Try the 4-7-8 technique: Breathe in for 4 seconds, hold for 7, exhale for 8",
        priority: "high",
      },
      {
        category: "break",
        title: "Scheduled Break",
        description: "Take a 10-minute walk to refresh your mind and improve focus",
        priority: "medium",
      },
      {
        category: "cognitive",
        title: "Switch Games",
        description: "Consider switching to a different game type to engage different cognitive skills",
        priority: "low",
      },
    ]

    return NextResponse.json({ suggestions })
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 })
  }
}
