"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, Heart, Pause, Play, RotateCcw, Wind } from "lucide-react"
import Link from "next/link"

export default function SudokuGame() {
  const [gameTime, setGameTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [breathingMode, setBreathingMode] = useState(false)
  const [completedCells, setCompletedCells] = useState(23)
  const [totalCells] = useState(81)
  const [difficulty, setDifficulty] = useState("Medium")

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && !breathingMode) {
      interval = setInterval(() => {
        setGameTime((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, breathingMode])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const toggleGame = () => {
    setIsPlaying(!isPlaying)
  }

  const startBreathing = () => {
    setBreathingMode(true)
    setIsPlaying(false)
    // Auto-stop breathing mode after 2 minutes
    setTimeout(() => {
      setBreathingMode(false)
    }, 120000)
  }

  const fillCell = () => {
    if (completedCells < totalCells) {
      setCompletedCells((prev) => prev + 1)
    }
  }

  // Generate a simple sudoku grid placeholder
  const generateGrid = () => {
    const grid = []
    for (let i = 0; i < 9; i++) {
      const row = []
      for (let j = 0; j < 9; j++) {
        const isCompleted = i * 9 + j < completedCells
        const hasNumber = Math.random() > 0.6 || isCompleted
        row.push({
          value: hasNumber ? Math.floor(Math.random() * 9) + 1 : "",
          isCompleted,
          isGiven: Math.random() > 0.7,
        })
      }
      grid.push(row)
    }
    return grid
  }

  const [grid] = useState(generateGrid())

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
            <span className="text-foreground font-medium">Zen Sudoku</span>
          </div>

          <div className="flex items-center space-x-4">
            <Badge variant="secondary">🔢 Zen Master</Badge>
            <Button variant="outline" size="sm" onClick={startBreathing}>
              <Wind className="w-4 h-4 mr-2" />
              Breathing Mode
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
                      <span className="text-3xl mr-3">🔢</span>
                      Zen Sudoku
                    </CardTitle>
                    <CardDescription>Find peace through logical reasoning and mindful focus</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">{formatTime(gameTime)}</div>
                    <p className="text-sm text-muted-foreground">Meditation time</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {breathingMode ? (
                  /* Breathing Exercise Mode */
                  <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center mb-6 border-2 border-primary/20">
                    <div className="text-center">
                      <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center mb-6 mx-auto animate-pulse">
                        <Wind className="w-16 h-16 text-primary" />
                      </div>
                      <p className="text-2xl font-semibold text-foreground mb-2">Breathe Mindfully</p>
                      <p className="text-muted-foreground mb-4">Inhale for 4... Hold for 7... Exhale for 8...</p>
                      <Button onClick={() => setBreathingMode(false)} variant="outline">
                        Return to Puzzle
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Sudoku Grid */
                  <div className="mb-6">
                    <div className="grid grid-cols-9 gap-1 bg-border p-2 rounded-lg max-w-md mx-auto">
                      {grid.map((row, i) =>
                        row.map((cell, j) => (
                          <div
                            key={`${i}-${j}`}
                            className={`
                              aspect-square flex items-center justify-center text-sm font-semibold cursor-pointer
                              transition-all duration-200 hover:bg-secondary/20
                              ${cell.isGiven ? "bg-muted text-muted-foreground" : "bg-background text-foreground"}
                              ${cell.isCompleted ? "bg-secondary/10 text-secondary" : ""}
                              ${(i + 1) % 3 === 0 && i !== 8 ? "border-b-2 border-border" : ""}
                              ${(j + 1) % 3 === 0 && j !== 8 ? "border-r-2 border-border" : ""}
                            `}
                            onClick={fillCell}
                          >
                            {cell.value}
                          </div>
                        )),
                      )}
                    </div>
                  </div>
                )}

                {/* Game Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-3">
                    <Button onClick={toggleGame} variant={isPlaying ? "secondary" : "default"}>
                      {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                      {isPlaying ? "Pause" : "Resume"}
                    </Button>
                    <Button variant="outline" size="sm">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Undo
                    </Button>
                    <Button variant="outline" size="sm">
                      Hint
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">Difficulty: {difficulty}</div>
                </div>
              </CardContent>
            </Card>

            {/* Mindfulness Integration */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Wind className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Mindful Sudoku Practice</h3>
                    <p className="text-muted-foreground mb-3">
                      Notice when you feel frustrated. Take a breath, observe the feeling, then return to the puzzle
                      with fresh eyes.
                    </p>
                    <Button variant="outline" size="sm" onClick={startBreathing}>
                      Start Breathing Exercise
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Wellness Sidebar */}
          <div className="space-y-6">
            {/* Progress Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-primary" />
                  Puzzle Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Completion</span>
                    <span className="text-foreground font-medium">
                      {Math.round((completedCells / totalCells) * 100)}%
                    </span>
                  </div>
                  <Progress value={(completedCells / totalCells) * 100} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{completedCells}</div>
                    <p className="text-xs text-muted-foreground">Cells Filled</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-secondary">{81 - completedCells}</div>
                    <p className="text-xs text-muted-foreground">Remaining</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mental State */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-secondary" />
                  Mindfulness State
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Focus Level</span>
                    <span className="text-foreground font-medium">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Calm State</span>
                    <span className="text-foreground font-medium">High</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Patience Level</span>
                    <span className="text-foreground font-medium">Excellent</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Daily Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Zen Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Complete one puzzle</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    28%
                  </Badge>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Practice breathing 3x</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    1/3
                  </Badge>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-muted rounded-full"></div>
                  <span className="text-sm text-muted-foreground">15 min mindful play</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {formatTime(gameTime)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Breathing Reminder */}
            <Card className="bg-secondary/5 border-secondary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Wind className="w-5 h-5 mr-2 text-secondary" />
                  Mindful Breathing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  When stuck on a number, pause and take three conscious breaths. The answer often comes in stillness.
                </p>
                <Button variant="secondary" size="sm" className="w-full" onClick={startBreathing}>
                  <Wind className="w-4 h-4 mr-2" />
                  Guided Breathing
                </Button>
              </CardContent>
            </Card>

            {/* Achievement */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sudoku Mastery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Overall Progress</span>
                    <span className="text-foreground font-medium">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-foreground">156</div>
                    <p className="text-xs text-muted-foreground">Puzzles Solved</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-secondary">12:34</div>
                    <p className="text-xs text-muted-foreground">Best Time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
