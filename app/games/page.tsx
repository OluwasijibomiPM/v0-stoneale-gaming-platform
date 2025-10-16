"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, Clock, TrendingUp, Star, Play, Pause } from "lucide-react"
import Link from "next/link"

export default function GamesHub() {
  const [currentStreak, setCurrentStreak] = useState(7)
  const [todayPlayTime, setTodayPlayTime] = useState(45)

  const games = [
    {
      id: "chess",
      name: "Strategic Chess",
      description: "Enhance critical thinking and pattern recognition",
      icon: "♟️",
      difficulty: "Advanced",
      avgSession: "25 min",
      mentalBenefits: ["Critical Thinking", "Pattern Recognition", "Patience"],
      progress: 78,
      lastPlayed: "2 hours ago",
      color: "bg-primary/10 text-primary",
    },
    {
      id: "poker",
      name: "Mindful Poker",
      description: "Develop emotional regulation and risk assessment",
      icon: "🃏",
      difficulty: "Intermediate",
      avgSession: "20 min",
      mentalBenefits: ["Emotional Control", "Risk Assessment", "Decision Making"],
      progress: 65,
      lastPlayed: "1 day ago",
      color: "bg-secondary/10 text-secondary",
    },
    {
      id: "sudoku",
      name: "Zen Sudoku",
      description: "Improve focus and logical reasoning",
      icon: "🔢",
      difficulty: "Beginner",
      avgSession: "15 min",
      mentalBenefits: ["Focus", "Logic", "Mindfulness"],
      progress: 92,
      lastPlayed: "30 min ago",
      color: "bg-chart-3/10 text-chart-3",
    },
    {
      id: "monopoly",
      name: "Strategic Monopoly",
      description: "Build financial literacy and planning skills",
      icon: "🏠",
      difficulty: "Intermediate",
      avgSession: "35 min",
      mentalBenefits: ["Strategic Planning", "Financial Literacy", "Negotiation"],
      progress: 43,
      lastPlayed: "3 days ago",
      color: "bg-chart-4/10 text-chart-4",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">Stoneale</span>
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">Games Hub</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
              <span className="text-muted-foreground">Wellness tracking active</span>
            </div>
            <Button variant="outline" size="sm">
              <TrendingUp className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Wellness Dashboard */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Clock className="w-5 h-5 mr-2 text-secondary" />
                Today's Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-2">{todayPlayTime} min</div>
              <Progress value={75} className="mb-2" />
              <p className="text-sm text-muted-foreground">75% of daily wellness goal</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Star className="w-5 h-5 mr-2 text-secondary" />
                Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-2">{currentStreak} days</div>
              <p className="text-sm text-muted-foreground">Keep it up! Consistency builds mental strength</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Brain className="w-5 h-5 mr-2 text-secondary" />
                Mental State
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-secondary mb-2">Focused & Calm</div>
              <p className="text-sm text-muted-foreground">AI detected improved concentration patterns</p>
            </CardContent>
          </Card>
        </div>

        {/* Games Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-foreground">Choose Your Mindful Game</h2>
            <Button variant="outline">
              <Brain className="w-4 h-4 mr-2" />
              AI Recommendation
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {games.map((game) => (
              <Card key={game.id} className="group hover:shadow-lg transition-all duration-300 border-border/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl ${game.color}`}>
                        {game.icon}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{game.name}</CardTitle>
                        <CardDescription className="mt-1">{game.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline">{game.difficulty}</Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Mastery Progress</span>
                        <span className="text-foreground font-medium">{game.progress}%</span>
                      </div>
                      <Progress value={game.progress} className="h-2" />
                    </div>

                    {/* Mental Benefits */}
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Mental Benefits:</p>
                      <div className="flex flex-wrap gap-2">
                        {game.mentalBenefits.map((benefit) => (
                          <Badge key={benefit} variant="secondary" className="text-xs">
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Game Stats */}
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Avg. Session: {game.avgSession}</span>
                      <span>Last played: {game.lastPlayed}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-2">
                      <Link href={`/games/${game.id}`} className="flex-1">
                        <Button className="w-full">
                          <Play className="w-4 h-4 mr-2" />
                          Play Now
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm">
                        <TrendingUp className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Mindfulness Break Reminder */}
        <Card className="bg-secondary/5 border-secondary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
                  <Pause className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Time for a Mindfulness Break?</h3>
                  <p className="text-muted-foreground">
                    You've been playing for 45 minutes. Consider a 5-minute breathing exercise.
                  </p>
                </div>
              </div>
              <Button variant="secondary">Start Break</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
