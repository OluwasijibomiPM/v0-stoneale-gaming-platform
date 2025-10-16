"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Award, Target, Zap, Download, Network } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function NFTsPage() {
  const [minting, setMinting] = useState(false)
  const [mintingNetwork, setMintingNetwork] = useState<string | null>(null)

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
      mintedOn: ["stacks", "base"],
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
      mintedOn: [],
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
      mintedOn: ["ethereum"],
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
      mintedOn: [],
    },
  ]

  const handleMint = async (achievementTitle: string, network: string) => {
    setMinting(true)
    setMintingNetwork(network)
    console.log("[v0] Minting NFT for:", achievementTitle, "on", network)
    await new Promise((resolve) => setTimeout(resolve, 2500))
    alert(`Successfully minted "${achievementTitle}" NFT on ${network.toUpperCase()}!`)
    setMinting(false)
    setMintingNetwork(null)
  }

  const networkOptions = [
    { id: "stacks", name: "Stacks", color: "from-purple-600 to-indigo-600" },
    { id: "base", name: "Base", color: "from-blue-600 to-cyan-600" },
    { id: "lisk", name: "Lisk", color: "from-blue-500 to-teal-500" },
    { id: "ethereum", name: "Ethereum", color: "from-slate-600 to-gray-600" },
    { id: "polygon", name: "Polygon", color: "from-purple-500 to-violet-600" },
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
            Mint your achievements as blockchain NFTs on multiple networks - permanent proof of your mental wellness
            journey
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-sm text-neutral-500">Supported Networks:</span>
            {networkOptions.map((network) => (
              <Badge
                key={network.id}
                variant="outline"
                className="bg-gradient-to-r from-neutral-900/50 to-neutral-800/50 border-amber-900/20 text-amber-300"
              >
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${network.color} mr-1.5`} />
                {network.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4">
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
                {achievements.reduce((acc, a) => acc + a.mintedOn.length, 0)}
              </div>
              <div className="text-sm text-neutral-400">Total Mints</div>
            </CardContent>
          </Card>
          <Card className="bg-neutral-900/50 border-amber-900/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-amber-400 mb-2">{achievements.length}</div>
              <div className="text-sm text-neutral-400">Total Achievements</div>
            </CardContent>
          </Card>
          <Card className="bg-neutral-900/50 border-amber-900/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-amber-400 mb-2">{networkOptions.length}</div>
              <div className="text-sm text-neutral-400">Networks</div>
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
                        {achievement.mintedOn.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Network className="w-3 h-3 text-green-400" />
                            <span className="text-xs text-green-400">{achievement.mintedOn.length} minted</span>
                          </div>
                        )}
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
                    <div className="text-xs text-neutral-400 font-medium">Mint on:</div>
                    <div className="grid grid-cols-2 gap-2">
                      {networkOptions.map((network) => {
                        const alreadyMinted = achievement.mintedOn.includes(network.id)
                        return (
                          <Button
                            key={network.id}
                            onClick={() => handleMint(achievement.title, network.name)}
                            disabled={minting || alreadyMinted}
                            size="sm"
                            className={
                              alreadyMinted
                                ? "bg-green-900/30 text-green-400 border border-green-700/30 hover:bg-green-900/30"
                                : "bg-gradient-to-r from-rose-900 to-amber-900 hover:from-rose-800 hover:to-amber-800"
                            }
                          >
                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${network.color} mr-2`} />
                            {alreadyMinted
                              ? "Minted"
                              : minting && mintingNetwork === network.name
                                ? "Minting..."
                                : network.name}
                          </Button>
                        )
                      })}
                    </div>
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
            <CardTitle className="text-amber-200">About Multi-Chain NFTs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-neutral-300 text-sm">
            <p>
              Your achievements can be minted as NFTs on multiple blockchain networks including Stacks, Base, Lisk,
              Ethereum, and Polygon - creating permanent, verifiable proof across different ecosystems.
            </p>
            <p>
              Each network offers unique benefits: Stacks for Bitcoin security, Base for low fees, Lisk for scalability,
              Ethereum for maximum compatibility, and Polygon for fast transactions.
            </p>
            <p className="text-amber-400">
              Premium members can mint unlimited NFTs across all supported networks at no additional cost.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
