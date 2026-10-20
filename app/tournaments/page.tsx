"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, ArrowLeft, Crown, ExternalLink, Loader2, Trophy, Users } from "lucide-react"
import { WalletConnect } from "@/components/wallet-connect"
import { useStellarWallet } from "@/components/stellar-wallet-provider"
import { CONTRACT_IDS, STELLAR_NETWORK, fromStroops, shortenAddress, tokenSymbol } from "@/lib/stellar/config"
import {
  ContractCallError,
  TOURNAMENT_ERRORS,
  getTournaments,
  joinTournament,
  leaveTournament,
  type Tournament,
  type TournamentStatus,
} from "@/lib/stellar/contracts"

// XLM kept back for the account's minimum reserve and network fees
const XLM_HEADROOM = 2

const STATUS_STYLES: Record<TournamentStatus, string> = {
  Open: "bg-green-900/30 text-green-400 border-green-700/30",
  Live: "bg-amber-900/30 text-amber-400 border-amber-700/30",
  Finished: "bg-neutral-800/50 text-neutral-400 border-neutral-700/30",
  Cancelled: "bg-red-900/20 text-red-400 border-red-700/30",
}

const PLACES = ["1st", "2nd", "3rd"]

function formatAmount(amount: bigint, token: string) {
  return `${fromStroops(amount).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${tokenSymbol(token)}`
}

function describeError(err: unknown) {
  if (err instanceof ContractCallError && err.code !== undefined && TOURNAMENT_ERRORS[err.code]) {
    return TOURNAMENT_ERRORS[err.code]
  }
  return err instanceof Error ? err.message : "Something went wrong"
}

export default function TournamentsPage() {
  const { signer, balances, refreshBalances } = useStellarWallet()
  const [tournaments, setTournaments] = useState<Tournament[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [pending, setPending] = useState<number | null>(null)
  const [actionErrors, setActionErrors] = useState<Record<number, string>>({})

  const load = useCallback(async () => {
    try {
      setLoadError(null)
      setTournaments(await getTournaments())
    } catch (err) {
      console.error("Failed to load tournaments:", err)
      setLoadError("Couldn't load tournaments from Stellar")
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Checks the player can cover the entry fee before asking Freighter to sign
  const balanceProblem = (t: Tournament) => {
    if (t.entryFee === BigInt(0) || !balances) return null
    if (!balances.funded) return `Fund your account on ${STELLAR_NETWORK.name} first`
    const fee = fromStroops(t.entryFee)
    const symbol = tokenSymbol(t.token)
    if (symbol === "USDC") {
      if (balances.usdc === null) return "Add a USDC trustline in Freighter to join"
      if (Number(balances.usdc) < fee) return "Not enough USDC for the entry fee"
    } else if (symbol === "XLM" && Number(balances.xlm) < fee + XLM_HEADROOM) {
      return "Not enough XLM for the entry fee and network reserve"
    }
    return null
  }

  const act = async (t: Tournament, action: "join" | "leave") => {
    if (!signer) return
    setPending(t.id)
    setActionErrors(({ [t.id]: _, ...rest }) => rest)
    try {
      if (action === "join") await joinTournament(t.id, signer)
      else await leaveTournament(t.id, signer)
      await Promise.all([load(), refreshBalances()])
    } catch (err) {
      setActionErrors((prev) => ({ ...prev, [t.id]: describeError(err) }))
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-amber-200">
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200">
            Tournaments
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Compete in mindful chess and sudoku. Entry fees are held by a Stellar smart contract and paid straight to
            the winners.
          </p>
          {!signer && (
            <div className="flex flex-col items-center gap-3 pt-2">
              <p className="text-sm text-neutral-400">Connect Freighter to join a tournament</p>
              <WalletConnect />
            </div>
          )}
        </div>

        {loadError && (
          <div className="flex items-center justify-center gap-2 text-sm text-red-400">
            <AlertTriangle className="w-4 h-4" />
            {loadError}
            <Button variant="link" onClick={load} className="text-amber-400 h-auto p-0">
              Retry
            </Button>
          </div>
        )}

        {tournaments === null && !loadError ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          </div>
        ) : tournaments?.length === 0 ? (
          <p className="text-center text-neutral-400 py-16">No tournaments yet. Check back soon.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments?.map((t) => {
              const joined = signer ? t.players.includes(signer.publicKey) : false
              const problem = signer && !joined ? balanceProblem(t) : null
              const full = t.players.length >= t.maxPlayers
              const error = actionErrors[t.id]

              return (
                <Card key={t.id} className="bg-neutral-900/50 border-amber-900/20 hover:border-amber-700/40 transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-900 to-amber-900 flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-amber-200" />
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="border-amber-900/30 text-neutral-300 capitalize">
                          {t.game}
                        </Badge>
                        <Badge variant="outline" className={STATUS_STYLES[t.status]}>
                          {t.status}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-amber-200 pt-2">{t.name}</CardTitle>
                    <CardDescription className="text-neutral-400">
                      Entry: {t.entryFee === BigInt(0) ? "Free" : formatAmount(t.entryFee, t.token)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-1 text-neutral-400">
                          <Users className="w-4 h-4" />
                          Players
                        </span>
                        <span className="text-neutral-200">
                          {t.players.length}/{t.maxPlayers}
                        </span>
                      </div>
                      <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-rose-700 to-amber-500"
                          style={{ width: `${(t.players.length / t.maxPlayers) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="rounded-md border border-amber-900/20 bg-neutral-950/50 p-3 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Prize pool</span>
                        <span className="text-amber-200 font-medium">{formatAmount(t.prizePool, t.token)}</span>
                      </div>
                      {t.prizeSplitBps.map((bps, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-neutral-500">
                            {PLACES[i] ?? `${i + 1}th`} place · {bps / 100}%
                          </span>
                          <span className="text-neutral-300">
                            {formatAmount((t.prizePool * BigInt(bps)) / BigInt(10_000), t.token)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {t.status === "Finished" && t.winners.length > 0 && (
                      <div className="space-y-1">
                        {t.winners.map((winner, i) => (
                          <div key={winner} className="flex items-center gap-2 text-sm">
                            <Crown className={`w-4 h-4 ${i === 0 ? "text-amber-400" : "text-neutral-500"}`} />
                            <span className="text-neutral-400">{PLACES[i] ?? `${i + 1}th`}</span>
                            <span className="font-mono text-neutral-200">
                              {winner === signer?.publicKey ? "You" : shortenAddress(winner)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {t.status === "Open" ? (
                      joined ? (
                        <div className="space-y-2">
                          <div className="text-sm text-green-400 text-center">You&apos;re registered</div>
                          <Button
                            variant="outline"
                            onClick={() => act(t, "leave")}
                            disabled={pending !== null}
                            className="w-full border-amber-900/30 text-neutral-300 hover:bg-amber-900/20 bg-transparent"
                          >
                            {pending === t.id && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Leave and get refunded
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => act(t, "join")}
                          disabled={!signer || full || problem !== null || pending !== null}
                          className="w-full bg-gradient-to-r from-rose-900 to-amber-900 hover:from-rose-800 hover:to-amber-800 text-amber-200"
                        >
                          {pending === t.id && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          {full
                            ? "Tournament full"
                            : pending === t.id
                              ? "Approve in Freighter..."
                              : t.entryFee === BigInt(0)
                                ? "Join for free"
                                : `Join for ${formatAmount(t.entryFee, t.token)}`}
                        </Button>
                      )
                    ) : (
                      <div className="text-sm text-neutral-500 text-center">
                        {t.status === "Live"
                          ? joined
                            ? "In progress - good luck!"
                            : "In progress"
                          : t.status === "Cancelled"
                            ? "Cancelled - entry fees refunded"
                            : "Prizes paid out"}
                      </div>
                    )}

                    {problem && <p className="text-xs text-amber-300">{problem}</p>}
                    {error && <p className="text-xs text-red-400">{error}</p>}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        <p className="text-center text-xs text-neutral-500">
          Escrow contract:{" "}
          <a
            href={`${STELLAR_NETWORK.explorerUrl}/contract/${CONTRACT_IDS.tournaments}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300"
          >
            {CONTRACT_IDS.tournaments ? shortenAddress(CONTRACT_IDS.tournaments) : "not configured"}
            <ExternalLink className="w-3 h-3" />
          </a>
        </p>
      </div>
    </div>
  )
}
