import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { gameData, userId } = body

    // Simulate AI analysis
    const analysis = {
      wellnessScore: Math.floor(Math.random() * 30) + 70,
      insights: [
        {
          type: "behavioral",
          message: "Your decision-making speed has improved by 12% this week",
          confidence: 0.89,
        },
        {
          type: "mental_state",
          message: "Stress levels are within healthy range during gameplay",
          confidence: 0.92,
        },
        {
          type: "recommendation",
          message: "Consider taking a 5-minute break to maintain optimal focus",
          confidence: 0.85,
        },
      ],
      trends: {
        focus: "improving",
        stress: "stable",
        cognitive_load: "optimal",
      },
    }

    return NextResponse.json(analysis)
  } catch (error) {
    return NextResponse.json({ error: "Failed to analyze data" }, { status: 500 })
  }
}
