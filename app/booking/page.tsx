"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Video, DollarSign } from "lucide-react"

export default function BookingPage() {
  const [selectedSpecialist, setSelectedSpecialist] = useState<string | null>(null)

  const specialists = [
    {
      name: "Dr. Sarah Mitchell",
      specialty: "Clinical Psychologist",
      experience: "15 years",
      rating: 4.9,
      price: 5,
      avatar: "SM",
      available: ["Mon 2PM", "Wed 4PM", "Fri 10AM"],
    },
    {
      name: "Dr. James Chen",
      specialty: "Mental Health Counselor",
      experience: "12 years",
      rating: 4.8,
      price: 5,
      avatar: "JC",
      available: ["Tue 3PM", "Thu 1PM", "Sat 11AM"],
    },
    {
      name: "Dr. Emily Rodriguez",
      specialty: "Wellness Coach",
      experience: "10 years",
      rating: 4.9,
      price: 5,
      avatar: "ER",
      available: ["Mon 10AM", "Wed 2PM", "Fri 3PM"],
    },
  ]

  const handleBooking = (specialistName: string) => {
    console.log("[v0] Booking session with:", specialistName)
    alert(`Booking session with ${specialistName} for $5`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200">
            Book a Session
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Connect with licensed mental health professionals for personalized support
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-amber-400">
            <DollarSign className="w-4 h-4" />
            <span>$5 per session for Premium members</span>
          </div>
        </div>

        {/* Specialists Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {specialists.map((specialist, index) => (
            <Card
              key={index}
              className={`bg-neutral-900/50 border-amber-900/20 hover:border-amber-700/40 transition-all ${
                selectedSpecialist === specialist.name ? "ring-2 ring-amber-500/50" : ""
              }`}
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-900 to-amber-900 flex items-center justify-center text-amber-200 font-bold text-xl">
                    {specialist.avatar}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-amber-200 text-lg">{specialist.name}</CardTitle>
                    <CardDescription className="text-neutral-400 text-sm">{specialist.specialty}</CardDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-amber-400 text-sm">★ {specialist.rating}</span>
                      <span className="text-neutral-500 text-xs">• {specialist.experience}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <Calendar className="w-4 h-4" />
                    <span>Available slots:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {specialist.available.map((slot, slotIndex) => (
                      <div
                        key={slotIndex}
                        className="px-3 py-1 bg-neutral-800/50 border border-amber-900/20 rounded text-xs text-neutral-300"
                      >
                        {slot}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-amber-400" />
                    <span className="text-sm text-neutral-400">Video call</span>
                  </div>
                  <div className="text-lg font-bold text-amber-400">${specialist.price}</div>
                </div>
                <Button
                  onClick={() => handleBooking(specialist.name)}
                  className="w-full bg-gradient-to-r from-rose-900 to-amber-900 hover:from-rose-800 hover:to-amber-800"
                >
                  Book Session
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="bg-gradient-to-br from-rose-950/40 to-amber-950/40 border-amber-900/30 max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-amber-200">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-900 to-amber-900 flex items-center justify-center text-amber-200 font-bold text-sm flex-shrink-0">
                1
              </div>
              <div>
                <div className="text-neutral-200 font-medium">Choose a Specialist</div>
                <div className="text-neutral-400 text-sm">Select from our licensed professionals</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-900 to-amber-900 flex items-center justify-center text-amber-200 font-bold text-sm flex-shrink-0">
                2
              </div>
              <div>
                <div className="text-neutral-200 font-medium">Pick a Time Slot</div>
                <div className="text-neutral-400 text-sm">Book a convenient time for your session</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-900 to-amber-900 flex items-center justify-center text-amber-200 font-bold text-sm flex-shrink-0">
                3
              </div>
              <div>
                <div className="text-neutral-200 font-medium">Join Video Call</div>
                <div className="text-neutral-400 text-sm">Connect securely from anywhere</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
