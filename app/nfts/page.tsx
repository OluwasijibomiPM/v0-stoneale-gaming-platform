"use client"

import { useCallback, useEffect, useState } from "react"
import { signMessage } from "@stellar/freighter-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Award, Target, Zap, CheckCircle2, ExternalLink, Loader2, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { WalletConnect } from "@/components/wallet-connect"
import { useStellarWallet } from "@/components/stellar-wallet-provider"
import { ACHIEVEMENTS, getProgress, isUnlocked, mintBadgeMessage } from "@/lib/achievements"
import { CONTRACT_IDS, STELLAR_NETWORK } from "@/lib/stellar/config"
import { getBadgeIds } from "@/lib/stellar/contracts"

const STYLES: Record<number, { icon: typeof Trophy; color: string }> = {
  1: { icon: Trophy, color: "from-amber-500 to-yellow-500" },
  2: { icon: Target, color: "from-purple-500 to-pink-500" },
  3: { icon: Zap, color: "from-blue-500 to-cyan-500" },
  4: { icon: Award, color: "from-green-500 to-emerald-500" },
}

function toBase64(signature: string | Uint8Array) {
  if (typeof signature === "string") return signature
  return btoa(String.fromCharCode(...Array.from(signature)))
}

export default function NFTsPage() {
  const { address, signer } = useStellarWallet()
  const [badgeIds, setBadgeIds] = useState<Record<number, number | null> | null>(null)
  const [badgesError, setBadgesError] = useState<string | null>(null)
  const [minting, setMinting] = useState<number | null>(null)
  const [mintErrors, setMintErrors] = useState<Record<number, string>>({})

  const loadBadges = useCallback(async () => {
    if (!signer) {
      setBadgeIds(null)
      return
    }
    try {
      setBadgesError(null)
      setBadgeIds(
        await getBadgeIds(
          signer.publicKey,
          ACHIEVEMENTS.map((a) => a.id),
        ),
      )
    } catch (err) {
      console.error("Failed to load badges:", err)
      setBadgesError("Couldn't load your badges from Stellar")
    }
  }, [signer])

  useEffect(() => {
    loadBadges()
  }, [loadBadges])

  const mint = async (achievementId: number) => {
    if (!signer) return
    setMinting(achievementId)
    setMintErrors(({ [achievementId]: _, ...rest }) => rest)
    try {
      // Sign a short message so the server knows this wallet is asking for its own badge
      const timestamp = Date.now()
      const signed = await signMessage(mintBadgeMessage(signer.publicKey, achievementId, timestamp), {
        networkPassphrase: STELLAR_NETWORK.passphrase,
        address: signer.publicKey,
      })
      if (signed.error || !signed.signedMessage) {
        throw new Error(signed.error?.message || "Freighter didn't sign the request")
      }

      const res = await fetch("/api/nfts/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: signer.publicKey,
          achievementId,
          timestamp,
          signature: toBase64(signed.signedMessage as string | Uint8Array),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to mint badge")
      await loadBadges()
    } catch (err) {
      setMintErrors((prev) => ({ ...prev, [achievementId]: err instanceof Error ? err.message : "Failed to mint badge" }))
    } finally {
      setMinting(null)
    }
  }

  const unlockedCount = ACHIEVEMENTS.filter((a) => isUnlocked(address, a)).length
  const mintedCount = badgeIds ? Object.values(badgeIds).filter((id) => id !== null).length : null

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
          {!signer && (
            <div className="flex flex-col items-center gap-3 pt-2">
              <p className="text-sm text-neutral-400">Connect Freighter to see and mint your badges</p>
              <WalletConnect />
            </div>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-neutral-900/50 border-amber-900/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-amber-400 mb-2">{unlockedCount}</div>
              <div className="text-sm text-neutral-400">Unlocked</div>
            </CardContent>
          </Card>
          <Card className="bg-neutral-900/50 border-amber-900/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-amber-400 mb-2">{mintedCount ?? "—"}</div>
              <div className="text-sm text-neutral-400">Minted on Stellar</div>
            </CardContent>
          </Card>
          <Card className="bg-neutral-900/50 border-amber-900/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-amber-400 mb-2">{ACHIEVEMENTS.length}</div>
              <div className="text-sm text-neutral-400">Total Achievements</div>
            </CardContent>
          </Card>
        </div>

        {badgesError && (
          <div className="flex items-center justify-center gap-2 text-sm text-red-400">
            <AlertTriangle className="w-4 h-4" />
            {badgesError}
          </div>
        )}

        {/* Achievements Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {ACHIEVEMENTS.map((achievement) => {
            const { icon: Icon, color } = STYLES[achievement.id]
            const progress = getProgress(address, achievement.id)
            const unlocked = isUnlocked(address, achievement)
            const badgeId = badgeIds?.[achievement.id] ?? null
            const mintError = mintErrors[achievement.id]

            return (
              <Card
                key={achievement.id}
                className={`bg-neutral-900/50 border-amber-900/20 ${
                  unlocked ? "hover:border-amber-700/40" : "opacity-60"
                } transition-all`}
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-16 h-16 rounded-lg bg-gradient-to-br ${
                        unlocked ? color : "from-neutral-700 to-neutral-800"
                      } flex items-center justify-center`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-amber-200">{achievement.title}</CardTitle>
                      <CardDescription className="text-neutral-400">{achievement.description}</CardDescription>
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            unlocked ? "bg-amber-900/30 text-amber-400" : "bg-neutral-800/50 text-neutral-500"
                          }`}
                        >
                          {achievement.rarity}
                        </span>
                        {badgeId !== null && (
                          <span className="flex items-center gap-1 text-xs text-green-400">
                            <CheckCircle2 className="w-3 h-3" />
                            Badge #{badgeId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-400">Progress</span>
                      <span className={unlocked ? "text-green-400" : "text-amber-400"}>
                        {progress}/{achievement.total}
                      </span>
                    </div>
                    <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${color} transition-all`}
                        style={{ width: `${Math.min(progress / achievement.total, 1) * 100}%` }}
                      />
                    </div>
                  </div>
                  {!unlocked ? (
                    <Button disabled className="w-full bg-neutral-800/50 text-neutral-500 cursor-not-allowed">
                      Locked
                    </Button>
                  ) : badgeId !== null ? (
                    <Button
                      asChild
                      size="sm"
                      className="w-full bg-green-900/30 text-green-400 border border-green-700/30 hover:bg-green-900/40"
                    >
                      <a
                        href={`${STELLAR_NETWORK.explorerUrl}/contract/${CONTRACT_IDS.achievements}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Minted on Stellar
                        <ExternalLink className="w-3 h-3 ml-2" />
                      </a>
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        onClick={() => mint(achievement.id)}
                        disabled={!signer || badgeIds === null || minting !== null}
                        size="sm"
                        className="w-full bg-gradient-to-r from-rose-900 to-amber-900 hover:from-rose-800 hover:to-amber-800 text-amber-200"
                      >
                        {minting === achievement.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 mr-2" />
                        )}
                        {minting === achievement.id
                          ? "Minting..."
                          : signer
                            ? "Mint on Stellar"
                            : "Connect wallet to mint"}
                      </Button>
                      {mintError && <p className="text-xs text-red-400">{mintError}</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Info Card */}
        <Card className="bg-gradient-to-br from-rose-950/40 to-amber-950/40 border-amber-900/30">
          <CardHeader>
            <CardTitle className="text-amber-200">About Stellar NFTs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-neutral-300 text-sm">
            <p>
              Achievement badges are issued by a Soroban smart contract on Stellar and belong to your Freighter wallet.
              They&apos;re soulbound: they can&apos;t be sold or transferred, so they always prove your own progress.
            </p>
            <p>
              Minting is free. You sign a short message to prove the wallet is yours, and Stoneale pays the network fee.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
