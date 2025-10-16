"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, Bot, Users, Lock } from "lucide-react"
import Link from "next/link"

export default function ForumsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const forumCategories = [
    {
      title: "Mental Health Support",
      description: "Share your journey and get AI-powered support",
      posts: 1247,
      icon: MessageCircle,
      color: "from-rose-900 to-amber-900",
    },
    {
      title: "Gaming & Mindfulness",
      description: "Discuss strategies for mindful gaming",
      posts: 892,
      icon: Users,
      color: "from-amber-900 to-rose-900",
    },
    {
      title: "AI Wellness Chat",
      description: "Private conversations with our AI wellness bot",
      posts: 2341,
      icon: Bot,
      color: "from-rose-950 to-amber-950",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200">
            Anonymous Forums
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            A safe, anonymous space to discuss mental health challenges with AI support and community
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-amber-400">
            <Lock className="w-4 h-4" />
            <span>Your identity is completely anonymous and protected</span>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search forums or ask the AI bot..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-neutral-900/50 border-amber-900/30 text-neutral-200 pl-4 pr-12"
            />
            <Button
              size="sm"
              className="absolute right-1 top-1 bg-gradient-to-r from-rose-900 to-amber-900 hover:from-rose-800 hover:to-amber-800"
            >
              Search
            </Button>
          </div>
        </div>

        {/* Forum Categories */}
        <div className="grid md:grid-cols-3 gap-6">
          {forumCategories.map((category, index) => (
            <Link key={index} href={`/forums/${category.title.toLowerCase().replace(/\s+/g, "-")}`}>
              <Card className="bg-neutral-900/50 border-amber-900/20 hover:border-amber-700/40 transition-all cursor-pointer h-full">
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center mb-3`}
                  >
                    <category.icon className="w-6 h-6 text-amber-200" />
                  </div>
                  <CardTitle className="text-amber-200">{category.title}</CardTitle>
                  <CardDescription className="text-neutral-400">{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-neutral-500">{category.posts.toLocaleString()} discussions</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick AI Chat */}
        <Card className="bg-gradient-to-br from-rose-950/40 to-amber-950/40 border-amber-900/30">
          <CardHeader>
            <CardTitle className="text-amber-200 flex items-center gap-2">
              <Bot className="w-6 h-6" />
              Quick Chat with AI Wellness Bot
            </CardTitle>
            <CardDescription className="text-neutral-400">
              Get immediate, scientifically-backed support for your mental health concerns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/forums/ai-chat">
              <Button className="w-full bg-gradient-to-r from-rose-900 to-amber-900 hover:from-rose-800 hover:to-amber-800">
                Start Anonymous Chat
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
