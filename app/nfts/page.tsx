"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Award, Target, Zap, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { STELLAR_NETWORK } from "@/lib/stellar/config"

export default function NFTsPage() {
  const achievements = [
    {
      title: "Chess Master",
      description: "Won 50 chess games",
      progress: 50,
      total: 50,
      unlocked: true,
      icon: Trophy,
      rarity: "Legendary",
      color: "from-amber-500 to-yellow-500",
    },
    {
      title: "Mindful Warrior",
      description: "Completed 100 mindfulness sessions",
      progress: 87,
      total: 100,
      unlocked: false,
      icon: Target,
      rarity: "Epic",
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Wellness Streak",
      description: "30-day consecutive login",
      progress: 30,
      total: 30,
      unlocked: true,
      icon: Zap,
      rarity: "Rare",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Community Helper",
      description: "Helped 25 users in forums",
      progress: 18,
      total: 25,
      unlocked: false,
      icon: Award,
      rarity: "Common",
      color: "from-green-500 to-emerald-500",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200">
            Progress NFTs
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Mint your achievements as NFTs on Stellar - permanent proof of your mental wellness journey
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-sm text-neutral-500">Network:</span>
            <Badge
              variant="outline"
              className="bg-gradient-to-r from-neutral-900/50 to-neutral-800/50 border-amber-900/20 text-amber-300"
            >
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 mr-1.5" />
              {STELLAR_NETWORK.name}
            </Badge>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-neutral-900/50 border-amber-900/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-amber-400 mb-2">
                {achievements.filter((a) => a.unlocked).length}
              </div>
              <div className="text-sm text-neutral-400">Unlocked</div>
            </CardContent>
          </Card>
          <Card className="bg-neutral-900/50 border-amber-900/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-amber-400 mb-2">
                {achievements.filter((a) => !a.unlocked).length}
              </div>
              <div className="text-sm text-neutral-400">In Progress</div>
            </CardContent>
          </Card>
          <Card className="bg-neutral-900/50 border-amber-900/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-amber-400 mb-2">{achievements.length}</div>
              <div className="text-sm text-neutral-400">Total Achievements</div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {achievements.map((achievement, index) => (
            <Card
              key={index}
              className={`bg-neutral-900/50 border-amber-900/20 ${
                achievement.unlocked ? "hover:border-amber-700/40" : "opacity-60"
              } transition-all`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-16 h-16 rounded-lg bg-gradient-to-br ${
                        achievement.unlocked ? achievement.color : "from-neutral-700 to-neutral-800"
                      } flex items-center justify-center`}
                    >
                      <achievement.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-amber-200">{achievement.title}</CardTitle>
                      <CardDescription className="text-neutral-400">{achievement.description}</CardDescription>
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            achievement.unlocked
                              ? "bg-amber-900/30 text-amber-400"
                              : "bg-neutral-800/50 text-neutral-500"
                          }`}
                        >
                          {achievement.rarity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Progress</span>
                    <span className={achievement.unlocked ? "text-green-400" : "text-amber-400"}>
                      {achievement.progress}/{achievement.total}
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${achievement.color} transition-all`}
                      style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                    />
                  </div>
                </div>
                {achievement.unlocked ? (
                  <div className="space-y-3">
                    <Button
                      disabled
                      size="sm"
                      className="w-full bg-gradient-to-r from-rose-900 to-amber-900 text-amber-200"
                      title="Achievement NFTs need the Soroban contract, which is still in development"
                    >
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 mr-2" />
                      Mint on Stellar - coming soon
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-amber-900/30 text-amber-400 hover:bg-amber-900/20 bg-transparent"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Metadata
                    </Button>
                  </div>
                ) : (
                  <Button disabled className="w-full bg-neutral-800/50 text-neutral-500 cursor-not-allowed">
                    Locked
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="bg-gradient-to-br from-rose-950/40 to-amber-950/40 border-amber-900/30">
          <CardHeader>
            <CardTitle className="text-amber-200">About Stellar NFTs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-neutral-300 text-sm">
            <p>
              Achievement NFTs will be issued by a Soroban smart contract on Stellar and sent to your connected Freighter
              wallet - permanent, verifiable proof of your progress.
            </p>
            <p>
              Stellar transactions settle in seconds for a fraction of a cent, so minting stays affordable even for
              everyday milestones.
            </p>
            <p className="text-amber-400">Premium members will be able to mint unlimited achievement NFTs at no additional cost.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
