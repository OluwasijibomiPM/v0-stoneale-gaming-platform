"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, Heart, Lightbulb, Pause, Play, RotateCcw } from "lucide-react"
import Link from "next/link"

export default function ChessGame() {
  const [gameTime, setGameTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [stressLevel, setStressLevel] = useState(3) // 1-5 scale
  const [movesCount, setMovesCount] = useState(0)
  const [aiInsight, setAiInsight] = useState(
    "Take your time to analyze the position. Deep thinking builds mental resilience.",
  )

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setGameTime((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const toggleGame = () => {
    setIsPlaying(!isPlaying)
  }

  const makeMove = () => {
    setMovesCount((prev) => prev + 1)
    // Simulate AI wellness tracking
    if (movesCount > 0 && movesCount % 10 === 0) {
      setAiInsight("Great focus! Your decision-making speed has improved by 15% this session.")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/games" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">Stoneale</span>
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/games" className="text-muted-foreground hover:text-foreground">
              Games
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">Strategic Chess</span>
          </div>

          <div className="flex items-center space-x-4">
            <Badge variant="secondary">♟️ Chess Master</Badge>
            <Button variant="outline" size="sm">
              <Heart className="w-4 h-4 mr-2" />
              Wellness Check
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Game Board Area */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center">
                      <span className="text-3xl mr-3">♟️</span>
                      Strategic Chess
                    </CardTitle>
                    <CardDescription>Enhance critical thinking through mindful gameplay</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">{formatTime(gameTime)}</div>
                    <p className="text-sm text-muted-foreground">Session time</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Chess Board Placeholder */}
                <div className="aspect-square bg-gradient-to-br from-muted/30 to-muted/60 rounded-lg flex items-center justify-center mb-6 border-2 border-border/50">
                  <div className="text-center">
                    <div className="text-6xl mb-4">♟️</div>
                    <p className="text-xl font-semibold text-foreground mb-2">Interactive Chess Board</p>
                    <p className="text-muted-foreground mb-4">Click to start your mindful chess session</p>
                    <div className="flex justify-center space-x-4">
                      <Button onClick={toggleGame} size="lg">
                        {isPlaying ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                        {isPlaying ? "Pause" : "Start Game"}
                      </Button>
                      <Button variant="outline" onClick={makeMove}>
                        Make Move
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Game Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-3">
                    <Button variant="outline" size="sm">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Undo Move
                    </Button>
                    <Button variant="outline" size="sm">
                      Hint
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">Moves: {movesCount}</div>
                </div>
              </CardContent>
            </Card>

            {/* AI Wellness Insight */}
            <Card className="bg-secondary/5 border-secondary/20">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">AI Wellness Insight</h3>
                    <p className="text-muted-foreground">{aiInsight}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Wellness Sidebar */}
          <div className="space-y-6">
            {/* Mental State Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-primary" />
                  Mental State
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Focus Level</span>
                    <span className="text-foreground font-medium">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Stress Level</span>
                    <span className="text-foreground font-medium">Low</span>
                  </div>
                  <Progress value={30} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Decision Speed</span>
                    <span className="text-foreground font-medium">Optimal</span>
                  </div>
                  <Progress value={70} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Session Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Today's Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Play for 20 minutes</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    15/20
                  </Badge>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-muted rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Make 25 thoughtful moves</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {movesCount}/25
                  </Badge>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-muted rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Practice mindful breathing</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    Pending
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Mindfulness Break */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-primary" />
                  Mindful Moment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Before your next move, take three deep breaths. Feel the present moment.
                </p>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Pause className="w-4 h-4 mr-2" />
                  Start 2-min Break
                </Button>
              </CardContent>
            </Card>

            {/* Progress Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chess Mastery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Overall Progress</span>
                    <span className="text-foreground font-medium">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-foreground">127</div>
                    <p className="text-xs text-muted-foreground">Games Played</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-secondary">89</div>
                    <p className="text-xs text-muted-foreground">Wins</p>
                  </div>
                </div>

                <Button variant="secondary" size="sm" className="w-full">
                  View Detailed Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
