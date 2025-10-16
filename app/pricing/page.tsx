"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Crown, Sparkles } from "lucide-react"

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")

  const plans = [
    {
      name: "Basic Access",
      price: billingCycle === "monthly" ? 1 : 10,
      description: "Essential mental wellness gaming",
      features: [
        "Access to all mindfulness games",
        "Basic AI wellness tracking",
        "Anonymous forum access",
        "Daily mental health tips",
        "Progress tracking",
      ],
      icon: Sparkles,
      gradient: "from-rose-900 to-amber-900",
      popular: false,
    },
    {
      name: "Premium",
      price: billingCycle === "monthly" ? 5 : 50,
      description: "Advanced features & professional support",
      features: [
        "Everything in Basic",
        "Book sessions with specialists",
        "Advanced AI behavioral analysis",
        "Personalized wellness plans",
        "Priority support",
        "Blockchain progress NFTs",
        "Third-party wellness integrations",
      ],
      icon: Crown,
      gradient: "from-amber-900 to-rose-900",
      popular: true,
    },
  ]

  const handleSubscribe = async (planName: string, price: number) => {
    // This would integrate with actual payment processor
    console.log("[v0] Subscribing to:", planName, "Price:", price)
    alert(`Subscribing to ${planName} plan for $${price}/${billingCycle}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200">
            Choose Your Wellness Plan
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Invest in your mental health with affordable, scientifically-backed gaming therapy
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-4 bg-neutral-900/50 p-2 rounded-lg border border-amber-900/20">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-md transition-all ${
                billingCycle === "monthly"
                  ? "bg-gradient-to-r from-rose-900 to-amber-900 text-amber-200"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 rounded-md transition-all ${
                billingCycle === "yearly"
                  ? "bg-gradient-to-r from-rose-900 to-amber-900 text-amber-200"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Yearly
              <span className="ml-2 text-xs text-green-400">(Save 17%)</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative bg-neutral-900/50 border-amber-900/20 hover:border-amber-700/40 transition-all ${
                plan.popular ? "ring-2 ring-amber-500/50" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                </div>
              )}
              <CardHeader>
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-3`}
                >
                  <plan.icon className="w-6 h-6 text-amber-200" />
                </div>
                <CardTitle className="text-amber-200 text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-neutral-400">{plan.description}</CardDescription>
                <div className="pt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-amber-400">${plan.price}</span>
                    <span className="text-neutral-500">/{billingCycle === "monthly" ? "month" : "year"}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleSubscribe(plan.name, plan.price)}
                  className={`w-full bg-gradient-to-r ${plan.gradient} hover:opacity-90 transition-opacity`}
                >
                  Subscribe Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <Card className="bg-neutral-900/50 border-amber-900/20 max-w-3xl mx-auto">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-amber-400 mb-2">30-Day</div>
                <div className="text-sm text-neutral-400">Money-back guarantee</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-400 mb-2">24/7</div>
                <div className="text-sm text-neutral-400">AI support available</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-400 mb-2">Cancel</div>
                <div className="text-sm text-neutral-400">Anytime, no questions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
