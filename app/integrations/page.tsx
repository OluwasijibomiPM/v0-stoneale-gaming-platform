"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, ExternalLink, Heart, Activity, Moon, Dumbbell, Apple, Brain } from "lucide-react"

export default function IntegrationsPage() {
  const [connectedIntegrations, setConnectedIntegrations] = useState<string[]>([])

  const integrations = [
    {
      name: "Headspace",
      category: "Meditation",
      description: "Sync your meditation sessions and mindfulness practices",
      icon: Brain,
      color: "from-orange-500 to-red-500",
      features: ["Meditation tracking", "Mindfulness scores", "Daily reminders"],
      premium: false,
    },
    {
      name: "Calm",
      category: "Sleep & Relaxation",
      description: "Track sleep quality and relaxation exercises",
      icon: Moon,
      color: "from-blue-500 to-indigo-500",
      features: ["Sleep tracking", "Breathing exercises", "Stress management"],
      premium: false,
    },
    {
      name: "Fitbit",
      category: "Physical Health",
      description: "Monitor physical activity and its impact on mental wellness",
      icon: Activity,
      color: "from-teal-500 to-cyan-500",
      features: ["Activity tracking", "Heart rate monitoring", "Sleep patterns"],
      premium: true,
    },
    {
      name: "MyFitnessPal",
      category: "Nutrition",
      description: "Connect nutrition data to understand diet's impact on mood",
      icon: Apple,
      color: "from-green-500 to-emerald-500",
      features: ["Nutrition tracking", "Meal logging", "Wellness insights"],
      premium: true,
    },
    {
      name: "Strava",
      category: "Exercise",
      description: "Track exercise routines and their mental health benefits",
      icon: Dumbbell,
      color: "from-orange-500 to-amber-500",
      features: ["Workout tracking", "Activity goals", "Performance metrics"],
      premium: true,
    },
    {
      name: "BetterHelp",
      category: "Therapy",
      description: "Connect with licensed therapists for professional support",
      icon: Heart,
      color: "from-pink-500 to-rose-500",
      features: ["Therapist matching", "Session scheduling", "Progress notes"],
      premium: true,
    },
  ]

  const handleConnect = (integrationName: string) => {
    if (connectedIntegrations.includes(integrationName)) {
      setConnectedIntegrations(connectedIntegrations.filter((name) => name !== integrationName))
    } else {
      setConnectedIntegrations([...connectedIntegrations, integrationName])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200">
            Wellness Integrations
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Connect your favorite wellness platforms to get a complete picture of your mental and physical health
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-neutral-900/50 border-amber-900/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-amber-400 mb-2">{connectedIntegrations.length}</div>
              <div className="text-sm text-neutral-400">Connected</div>
            </CardContent>
          </Card>
          <Card className="bg-neutral-900/50 border-amber-900/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-amber-400 mb-2">{integrations.length}</div>
              <div className="text-sm text-neutral-400">Available</div>
            </CardContent>
          </Card>
          <Card className="bg-neutral-900/50 border-amber-900/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-amber-400 mb-2">
                {integrations.filter((i) => i.premium).length}
              </div>
              <div className="text-sm text-neutral-400">Premium Only</div>
            </CardContent>
          </Card>
        </div>

        {/* Integrations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration, index) => {
            const isConnected = connectedIntegrations.includes(integration.name)
            return (
              <Card
                key={index}
                className={`bg-neutral-900/50 border-amber-900/20 hover:border-amber-700/40 transition-all ${
                  isConnected ? "ring-2 ring-green-500/50" : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${integration.color} flex items-center justify-center`}
                    >
                      <integration.icon className="w-6 h-6 text-white" />
                    </div>
                    {integration.premium && (
                      <Badge className="bg-amber-900/30 text-amber-400 border-amber-700/30">Premium</Badge>
                    )}
                  </div>
                  <CardTitle className="text-amber-200">{integration.name}</CardTitle>
                  <CardDescription className="text-neutral-400">
                    <Badge variant="outline" className="mb-2 border-amber-900/30 text-amber-400">
                      {integration.category}
                    </Badge>
                    <p className="mt-2">{integration.description}</p>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {integration.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2 text-sm text-neutral-300">
                        <Check className="w-4 h-4 text-green-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => handleConnect(integration.name)}
                    className={`w-full ${
                      isConnected
                        ? "bg-green-900/50 hover:bg-green-900/70 text-green-400"
                        : "bg-gradient-to-r from-rose-900 to-amber-900 hover:from-rose-800 hover:to-amber-800"
                    }`}
                  >
                    {isConnected ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Connected
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Connect
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Info Card */}
        <Card className="bg-gradient-to-br from-rose-950/40 to-amber-950/40 border-amber-900/30">
          <CardHeader>
            <CardTitle className="text-amber-200">How Integrations Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-neutral-300 text-sm">
            <p>
              Connect your favorite wellness platforms to Stoneale to get a comprehensive view of your mental and
              physical health. Our AI analyzes data from all connected platforms to provide personalized insights.
            </p>
            <p>
              All data is encrypted and stored securely. You can disconnect any integration at any time, and your data
              will be immediately removed from our systems.
            </p>
            <p className="text-amber-400">
              Premium members get access to advanced integrations including fitness trackers, nutrition apps, and
              professional therapy platforms.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
