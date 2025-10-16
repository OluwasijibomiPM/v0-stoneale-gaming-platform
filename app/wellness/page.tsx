"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Brain, TrendingUp, Heart, Activity, Lightbulb, Calendar } from "lucide-react"

export default function WellnessPage() {
  const [wellnessScore, setWellnessScore] = useState(72)
  const [insights, setInsights] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Simulate AI analysis
    const mockInsights = [
      {
        type: "positive",
        title: "Improved Focus",
        description: "Your focus duration has increased by 23% over the past week.",
        icon: Brain,
        color: "text-green-600",
      },
      {
        type: "suggestion",
        title: "Take a Break",
        description: "You have been playing for 45 minutes. Consider a 5-minute mindfulness break.",
        icon: Heart,
        color: "text-amber-600",
      },
      {
        type: "achievement",
        title: "Stress Management",
        description: "Your stress levels during gameplay have decreased by 15%.",
        icon: TrendingUp,
        color: "text-blue-600",
      },
    ]
    setInsights(mockInsights)
  }, [])

  const generateAIReport = async () => {
    setLoading(true)
    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setWellnessScore(Math.min(wellnessScore + 5, 100))
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200">
            AI Wellness Tracking
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Our AI analyzes your gaming patterns, behavioral changes, and mental state to provide personalized wellness
            insights
          </p>
        </div>

        {/* Overall Wellness Score */}
        <Card className="bg-gradient-to-br from-rose-950/40 to-amber-950/40 border-amber-900/30">
          <CardHeader>
            <CardTitle className="text-amber-200 flex items-center gap-2">
              <Activity className="w-6 h-6" />
              Overall Wellness Score
            </CardTitle>
            <CardDescription className="text-neutral-400">
              Based on AI analysis of your gaming behavior and mental state
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-6xl font-bold text-amber-400">{wellnessScore}</span>
              <span className="text-neutral-400">/100</span>
            </div>
            <Progress value={wellnessScore} className="h-3" />
            <Button
              onClick={generateAIReport}
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-900 to-amber-900 hover:from-rose-800 hover:to-amber-800"
            >
              {loading ? "Analyzing..." : "Generate AI Report"}
            </Button>
          </CardContent>
        </Card>

        {/* AI Insights Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {insights.map((insight, index) => (
            <Card
              key={index}
              className="bg-neutral-900/50 border-amber-900/20 hover:border-amber-700/40 transition-all"
            >
              <CardHeader>
                <CardTitle className="text-amber-200 flex items-center gap-2">
                  <insight.icon className={`w-5 h-5 ${insight.color}`} />
                  {insight.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-400 text-sm">{insight.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Behavioral Tracking */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-neutral-900/50 border-amber-900/20">
            <CardHeader>
              <CardTitle className="text-amber-200 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Behavioral Patterns
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Focus Level</span>
                  <span className="text-amber-400">High</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Stress Management</span>
                  <span className="text-green-400">Improving</span>
                </div>
                <Progress value={70} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Decision Making</span>
                  <span className="text-blue-400">Excellent</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900/50 border-amber-900/20">
            <CardHeader>
              <CardTitle className="text-amber-200 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-rose-950/30 rounded-lg border border-rose-900/30">
                <p className="text-sm text-neutral-300">
                  <strong className="text-amber-400">Mindfulness Tip:</strong> Try the 4-7-8 breathing technique before
                  your next game session
                </p>
              </div>
              <div className="p-3 bg-rose-950/30 rounded-lg border border-rose-900/30">
                <p className="text-sm text-neutral-300">
                  <strong className="text-amber-400">Break Reminder:</strong> Schedule a 10-minute break every hour for
                  optimal mental performance
                </p>
              </div>
              <div className="p-3 bg-rose-950/30 rounded-lg border border-rose-900/30">
                <p className="text-sm text-neutral-300">
                  <strong className="text-amber-400">Progress Note:</strong> Your cognitive flexibility has improved
                  significantly this week
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Progress */}
        <Card className="bg-neutral-900/50 border-amber-900/20">
          <CardHeader>
            <CardTitle className="text-amber-200 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Weekly Mental Wellness Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
                <div key={day} className="text-center space-y-2">
                  <div className="text-xs text-neutral-400">{day}</div>
                  <div
                    className="h-24 bg-gradient-to-t from-rose-900/50 to-amber-900/50 rounded-lg flex items-end justify-center p-2"
                    style={{ height: `${60 + Math.random() * 40}px` }}
                  >
                    <span className="text-xs text-amber-400 font-semibold">{Math.floor(65 + Math.random() * 25)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
