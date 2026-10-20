import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { StellarWalletProvider } from "@/components/stellar-wallet-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "Stoneale - Mental Wellness Gaming Platform",
  description:
    "Boost your mental health through mindful gaming. Play chess, poker, sudoku, and more while tracking your wellness journey with AI-powered insights.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <StellarWalletProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </StellarWalletProvider>
        <Analytics />
      </body>
    </html>
  )
}
