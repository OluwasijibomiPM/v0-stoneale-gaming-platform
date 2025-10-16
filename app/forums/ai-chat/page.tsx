"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bot, User, Send, Shield } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello, I'm your AI wellness companion. This is a safe, anonymous space. How are you feeling today? I'm here to provide scientifically-backed support and guidance.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        role: "assistant",
        content: generateAIResponse(input),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }

  const generateAIResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase()

    if (lowerInput.includes("stress") || lowerInput.includes("anxious")) {
      return "I understand you're experiencing stress. Here's a scientifically-proven technique: Try the 4-7-8 breathing method. Breathe in for 4 seconds, hold for 7, and exhale for 8. This activates your parasympathetic nervous system. Would you like to try it together, or discuss what's causing the stress?"
    }

    if (lowerInput.includes("sleep") || lowerInput.includes("tired")) {
      return "Sleep is crucial for mental health. Research shows that maintaining a consistent sleep schedule and avoiding screens 1 hour before bed can improve sleep quality by 40%. Have you tried establishing a bedtime routine? I can suggest some evidence-based techniques."
    }

    if (lowerInput.includes("focus") || lowerInput.includes("concentrate")) {
      return "Difficulty focusing is common. The Pomodoro Technique (25 minutes of focused work, 5-minute break) has been shown to improve concentration. Also, mindful gaming like chess can enhance cognitive control. Would you like specific exercises to improve focus?"
    }

    return "Thank you for sharing. Remember, seeking support is a sign of strength. Based on research, regular mindfulness practice and cognitive exercises can significantly improve mental wellness. Would you like me to suggest specific techniques tailored to your situation, or would you prefer to talk more about what you're experiencing?"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-neutral-900/50 border-amber-900/20">
          <CardHeader>
            <CardTitle className="text-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-6 h-6" />
                AI Wellness Bot
              </div>
              <div className="flex items-center gap-2 text-sm font-normal text-green-400">
                <Shield className="w-4 h-4" />
                Anonymous & Secure
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Chat Messages */}
        <Card className="bg-neutral-900/50 border-amber-900/20">
          <CardContent className="p-6">
            <div className="space-y-4 h-[500px] overflow-y-auto pr-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-900 to-amber-900 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-amber-200" />
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] p-4 rounded-lg ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-amber-900/50 to-rose-900/50 border border-amber-700/30"
                        : "bg-neutral-800/50 border border-neutral-700/30"
                    }`}
                  >
                    <p className="text-neutral-200 text-sm leading-relaxed">{message.content}</p>
                    <span className="text-xs text-neutral-500 mt-2 block">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-900 to-rose-900 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-amber-200" />
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-900 to-amber-900 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-amber-200" />
                  </div>
                  <div className="bg-neutral-800/50 border border-neutral-700/30 p-4 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="mt-4 flex gap-2">
              <Input
                type="text"
                placeholder="Share your thoughts anonymously..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                className="bg-neutral-800/50 border-amber-900/30 text-neutral-200"
              />
              <Button
                onClick={handleSend}
                className="bg-gradient-to-r from-rose-900 to-amber-900 hover:from-rose-800 hover:to-amber-800"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="bg-rose-950/20 border-rose-900/30">
          <CardContent className="p-4">
            <p className="text-xs text-neutral-400 text-center">
              This AI provides general wellness support based on scientific research. For serious mental health
              concerns, please consult a licensed professional through our booking system.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
