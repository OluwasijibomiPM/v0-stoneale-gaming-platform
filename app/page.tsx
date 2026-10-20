"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Gamepad2, MessageCircle, TrendingUp, Shield, Users, Sparkles } from "lucide-react"
import { WalletConnect } from "@/components/wallet-connect"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      {/* Header */}
      <header className="border-b border-amber-900/20 backdrop-blur-sm bg-neutral-900/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-rose-900 to-amber-900 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-amber-200" />
            </div>
            <span className="text-2xl font-bold text-amber-200">Stoneale</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/games" className="text-neutral-400 hover:text-amber-200 transition-colors">
              Games
            </Link>
            <Link href="/wellness" className="text-neutral-400 hover:text-amber-200 transition-colors">
              Wellness
            </Link>
            <Link href="/forums" className="text-neutral-400 hover:text-amber-200 transition-colors">
              Forums
            </Link>
            <Link href="/tournaments" className="text-neutral-400 hover:text-amber-200 transition-colors">
              Tournaments
            </Link>
            <Link href="/pricing" className="text-neutral-400 hover:text-amber-200 transition-colors">
              Pricing
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <WalletConnect />
            <Button
              variant="outline"
              className="border-amber-900/30 text-amber-200 hover:bg-amber-900/20 bg-transparent"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="animate-float mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-rose-900 to-amber-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Brain className="w-10 h-10 text-amber-200" />
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-balance mb-6">
            <span className="text-amber-200">Mental Wellness</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200">
              Through Gaming
            </span>
          </h1>

          <p className="text-xl text-neutral-400 text-balance max-w-2xl mx-auto mb-8">
            Boost your mental health with mindful games like chess, poker, and sudoku. Track your progress with
            AI-powered insights and connect with a supportive community.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/games">
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-gradient-to-r from-rose-900 to-amber-900 hover:from-rose-800 hover:to-amber-800"
              >
                <Gamepad2 className="w-5 h-5 mr-2" />
                Start Playing
              </Button>
            </Link>
            <Link href="/forums">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-amber-900/30 text-amber-200 hover:bg-amber-900/20 bg-transparent"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Join Forums
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="games" className="py-20 px-4 bg-neutral-900/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-amber-200 mb-4">Mindful Gaming Experience</h2>
            <p className="text-xl text-neutral-400 text-balance max-w-2xl mx-auto">
              Our carefully curated games are designed to challenge your mind while promoting mental wellness
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Chess Card */}
            <Card className="group hover:shadow-lg transition-all duration-300 bg-neutral-900/50 border-amber-900/20 hover:border-amber-700/40">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-rose-900/50 to-amber-900/50 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">♟️</span>
                </div>
                <CardTitle className="text-amber-200">Strategic Chess</CardTitle>
                <CardDescription className="text-neutral-400">
                  Enhance critical thinking and pattern recognition through classic chess gameplay
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="mb-2 bg-amber-900/30 text-amber-400">
                  Strategy
                </Badge>
                <p className="text-sm text-neutral-400">
                  AI tracks your decision-making patterns and suggests mindfulness breaks
                </p>
              </CardContent>
            </Card>

            {/* Poker Card */}
            <Card className="group hover:shadow-lg transition-all duration-300 bg-neutral-900/50 border-amber-900/20 hover:border-amber-700/40">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-rose-900/50 to-amber-900/50 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🃏</span>
                </div>
                <CardTitle className="text-amber-200">Mindful Poker</CardTitle>
                <CardDescription className="text-neutral-400">
                  Develop emotional regulation and risk assessment skills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="mb-2 bg-amber-900/30 text-amber-400">
                  Psychology
                </Badge>
                <p className="text-sm text-neutral-400">
                  Learn to manage stress and make calculated decisions under pressure
                </p>
              </CardContent>
            </Card>

            {/* Sudoku Card */}
            <Card className="group hover:shadow-lg transition-all duration-300 bg-neutral-900/50 border-amber-900/20 hover:border-amber-700/40">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-rose-900/50 to-amber-900/50 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🔢</span>
                </div>
                <CardTitle className="text-amber-200">Zen Sudoku</CardTitle>
                <CardDescription className="text-neutral-400">
                  Improve focus and logical reasoning in a meditative environment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="mb-2 bg-amber-900/30 text-amber-400">
                  Focus
                </Badge>
                <p className="text-sm text-neutral-400">Guided breathing exercises integrated with puzzle solving</p>
              </CardContent>
            </Card>

            {/* Monopoly Card */}
            <Card className="group hover:shadow-lg transition-all duration-300 bg-neutral-900/50 border-amber-900/20 hover:border-amber-700/40">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-rose-900/50 to-amber-900/50 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🏠</span>
                </div>
                <CardTitle className="text-amber-200">Strategic Monopoly</CardTitle>
                <CardDescription className="text-neutral-400">
                  Build financial literacy and long-term planning skills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="mb-2 bg-amber-900/30 text-amber-400">
                  Planning
                </Badge>
                <p className="text-sm text-neutral-400">
                  Learn patience and strategic thinking through property management
                </p>
              </CardContent>
            </Card>

            {/* AI Tracking Card */}
            <Card className="group hover:shadow-lg transition-all duration-300 bg-neutral-900/50 border-amber-900/20 hover:border-amber-700/40">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-900/50 to-rose-900/50 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-amber-400" />
                </div>
                <CardTitle className="text-amber-200">AI Wellness Tracking</CardTitle>
                <CardDescription className="text-neutral-400">
                  Monitor your mental state and receive personalized insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="mb-2 border-amber-900/30 text-amber-400">
                  AI Powered
                </Badge>
                <p className="text-sm text-neutral-400">
                  Track mood, stress levels, and cognitive performance over time
                </p>
              </CardContent>
            </Card>

            {/* Blockchain Assets Card */}
            <Card className="group hover:shadow-lg transition-all duration-300 bg-neutral-900/50 border-amber-900/20 hover:border-amber-700/40">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-900/50 to-rose-900/50 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-amber-400" />
                </div>
                <CardTitle className="text-amber-200">Progress NFTs</CardTitle>
                <CardDescription className="text-neutral-400">
                  Mint your achievements as blockchain-verified proof of progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="mb-2 border-amber-900/30 text-amber-400">
                  Blockchain
                </Badge>
                <p className="text-sm text-neutral-400">
                  Collect unique digital assets representing your wellness journey
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section id="forums" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-amber-200 mb-6">Anonymous Support Community</h2>
              <p className="text-xl text-neutral-400 mb-8">
                Connect with others on similar wellness journeys. Share experiences, get support, and receive AI-powered
                guidance in a safe, anonymous environment.
              </p>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-amber-400" />
                  <span className="text-neutral-200">Complete anonymity protected</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Brain className="w-5 h-5 text-amber-400" />
                  <span className="text-neutral-200">AI-powered mental health support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-amber-400" />
                  <span className="text-neutral-200">Peer-to-peer community support</span>
                </div>
              </div>

              <Link href="/forums">
                <Button
                  size="lg"
                  className="mt-8 bg-gradient-to-r from-rose-900 to-amber-900 hover:from-rose-800 hover:to-amber-800"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Join Community
                </Button>
              </Link>
            </div>

            <Card className="p-8 bg-neutral-900/50 border-amber-900/20">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-2xl text-amber-200">AI Wellness Assistant</CardTitle>
                <CardDescription className="text-neutral-400">
                  Get personalized, scientifically-backed mental health guidance
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="bg-neutral-800/50 rounded-lg p-4 mb-4 border border-neutral-700/30">
                  <p className="text-sm text-neutral-500 mb-2">Anonymous User:</p>
                  <p className="text-neutral-200">"I've been feeling overwhelmed with work stress lately..."</p>
                </div>
                <div className="bg-gradient-to-br from-rose-950/30 to-amber-950/30 rounded-lg p-4 border border-amber-900/30">
                  <p className="text-sm text-amber-400 mb-2">AI Assistant:</p>
                  <p className="text-neutral-200">
                    "Based on your gaming patterns, I notice increased decision-making time during chess games. Try the
                    4-7-8 breathing technique before your next session..."
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-neutral-900/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-amber-200 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-neutral-400 text-balance max-w-2xl mx-auto">
              Affordable mental wellness for everyone. Start your journey today.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Basic Plan */}
            <Card className="relative bg-neutral-900/50 border-amber-900/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-amber-200">Basic Access</CardTitle>
                <div className="text-4xl font-bold text-amber-400 mt-4">
                  $1<span className="text-lg text-neutral-500">/month</span>
                </div>
                <CardDescription className="text-neutral-400">
                  Perfect for getting started with mindful gaming
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span className="text-neutral-300">Access to all games (Chess, Poker, Sudoku, Monopoly)</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span className="text-neutral-300">Basic AI wellness tracking</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span className="text-neutral-300">Anonymous forum access</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span className="text-neutral-300">Progress NFT minting</span>
                  </li>
                </ul>
                <Link href="/pricing">
                  <Button
                    className="w-full mt-6 bg-gradient-to-r from-rose-900 to-amber-900 hover:from-rose-800 hover:to-amber-800"
                    size="lg"
                  >
                    Start Basic Plan
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="relative bg-neutral-900/50 border-amber-700/50 shadow-lg ring-2 ring-amber-500/30">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-amber-500 to-rose-500 text-white">Most Popular</Badge>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-amber-200">Premium Access</CardTitle>
                <div className="text-4xl font-bold text-amber-400 mt-4">
                  $5<span className="text-lg text-neutral-500">/month</span>
                </div>
                <CardDescription className="text-neutral-400">
                  Advanced features for serious wellness enthusiasts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span className="text-neutral-300">Everything in Basic plan</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span className="text-neutral-300">1-on-1 sessions with mental health specialists</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span className="text-neutral-300">Advanced AI insights and recommendations</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span className="text-neutral-300">Priority support and exclusive content</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span className="text-neutral-300">Third-party wellness platform integrations</span>
                  </li>
                </ul>
                <Link href="/pricing">
                  <Button
                    className="w-full mt-6 bg-gradient-to-r from-amber-900 to-rose-900 hover:from-amber-800 hover:to-rose-800"
                    size="lg"
                  >
                    Upgrade to Premium
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-amber-900/20 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-rose-900 to-amber-900 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-amber-200" />
                </div>
                <span className="text-xl font-bold text-amber-200">Stoneale</span>
              </div>
              <p className="text-neutral-400">
                Mental wellness through mindful gaming. Join thousands on their wellness journey.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-amber-200 mb-4">Games</h4>
              <ul className="space-y-2 text-neutral-400">
                <li>
                  <Link href="/games/chess" className="hover:text-amber-200 transition-colors">
                    Chess
                  </Link>
                </li>
                <li>
                  <Link href="/games/poker" className="hover:text-amber-200 transition-colors">
                    Poker
                  </Link>
                </li>
                <li>
                  <Link href="/games/sudoku" className="hover:text-amber-200 transition-colors">
                    Sudoku
                  </Link>
                </li>
                <li>
                  <Link href="/games/monopoly" className="hover:text-amber-200 transition-colors">
                    Monopoly
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-amber-200 mb-4">Wellness</h4>
              <ul className="space-y-2 text-neutral-400">
                <li>
                  <Link href="/wellness/ai-tracking" className="hover:text-amber-200 transition-colors">
                    AI Tracking
                  </Link>
                </li>
                <li>
                  <Link href="/wellness/tips" className="hover:text-amber-200 transition-colors">
                    Mental Health Tips
                  </Link>
                </li>
                <li>
                  <Link href="/wellness/analytics" className="hover:text-amber-200 transition-colors">
                    Progress Analytics
                  </Link>
                </li>
                <li>
                  <Link href="/booking" className="hover:text-amber-200 transition-colors">
                    Specialists
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-amber-200 mb-4">Community</h4>
              <ul className="space-y-2 text-neutral-400">
                <li>
                  <Link href="/forums" className="hover:text-amber-200 transition-colors">
                    Forums
                  </Link>
                </li>
                <li>
                  <Link href="/forums/ai-chat" className="hover:text-amber-200 transition-colors">
                    AI Support
                  </Link>
                </li>
                <li>
                  <Link href="/nfts" className="hover:text-amber-200 transition-colors">
                    NFTs
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-amber-200 transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-amber-900/20 mt-8 pt-8 text-center text-neutral-400">
            <p>&copy; 2025 Stoneale. All rights reserved. Mental wellness through mindful gaming.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
