"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Wallet, ChevronDown, Check, Copy, ExternalLink, AlertTriangle, RefreshCw, Loader2 } from "lucide-react"
import { useStellarWallet } from "@/components/stellar-wallet-provider"
import { FREIGHTER_INSTALL_URL, STELLAR_NETWORK, shortenAddress } from "@/lib/stellar/config"
import { formatBalance } from "@/lib/stellar/horizon"

const buttonClass =
  "bg-gradient-to-r from-rose-900 to-amber-900 hover:from-rose-800 hover:to-amber-800 text-amber-200"
const outlineButtonClass =
  "bg-gradient-to-r from-rose-900/50 to-amber-900/50 border-amber-700/50 text-amber-200 hover:from-rose-800/50 hover:to-amber-800/50"

export function WalletConnect() {
  const {
    status,
    address,
    wrongNetwork,
    balances,
    stoneBalance,
    balancesLoading,
    error,
    connect,
    disconnect,
    refreshBalances,
  } = useStellarWallet()
  const [copied, setCopied] = useState(false)

  const copyAddress = async () => {
    if (!address) return
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (err) {
      console.error("Failed to copy address:", err)
    }
  }

  if (status === "checking") {
    return (
      <Button disabled className={buttonClass}>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Wallet
      </Button>
    )
  }

  if (status === "not-installed") {
    return (
      <Button asChild className={buttonClass}>
        <a href={FREIGHTER_INSTALL_URL} target="_blank" rel="noopener noreferrer">
          <Wallet className="w-4 h-4 mr-2" />
          Install Freighter
          <ExternalLink className="w-3 h-3 ml-2" />
        </a>
      </Button>
    )
  }

  if (status === "connected" && address) {
    return (
      <div className="flex items-center gap-2">
        <div
          className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-md border text-sm ${
            wrongNetwork
              ? "border-red-700/50 bg-red-900/20 text-red-300"
              : "border-amber-700/50 bg-neutral-900/50 text-amber-200"
          }`}
          title={wrongNetwork ? `Switch Freighter to ${STELLAR_NETWORK.name}` : undefined}
        >
          {wrongNetwork ? (
            <AlertTriangle className="w-4 h-4" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-sky-400 to-indigo-500" />
          )}
          {wrongNetwork ? "Wrong network" : STELLAR_NETWORK.name}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className={outlineButtonClass}>
              <Wallet className="w-4 h-4 mr-2" />
              {shortenAddress(address)}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-neutral-900 border-amber-900/30 w-72">
            <DropdownMenuLabel className="text-amber-200">Freighter Wallet</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-amber-900/20" />
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault()
                copyAddress()
              }}
              className="text-neutral-400 text-xs font-mono cursor-pointer break-all gap-2"
            >
              <span className="flex-1">{address}</span>
              {copied ? <Check className="w-4 h-4 text-amber-400 shrink-0" /> : <Copy className="w-4 h-4 shrink-0" />}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-amber-900/20" />

            {wrongNetwork ? (
              <div className="px-2 py-2 text-xs text-red-300">
                Freighter is on a different network. Switch it to {STELLAR_NETWORK.name} to see balances.
              </div>
            ) : balances && !balances.funded ? (
              <div className="px-2 py-2 text-xs text-neutral-400 space-y-2">
                <div>This account isn&apos;t funded on {STELLAR_NETWORK.name} yet.</div>
                {STELLAR_NETWORK.id === "testnet" && (
                  <a
                    href={`https://friendbot.stellar.org/?addr=${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300"
                  >
                    Fund with Friendbot <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ) : (
              <div className="px-2 py-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-400">XLM</span>
                  <span className="text-amber-200 font-mono">
                    {balances?.xlm != null ? formatBalance(balances.xlm) : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">USDC</span>
                  <span className="text-amber-200 font-mono">
                    {balances?.usdc != null ? formatBalance(balances.usdc) : balances ? "No trustline" : "—"}
                  </span>
                </div>
              </div>
            )}
            {!wrongNetwork && (
              <div className="px-2 pb-2 flex justify-between text-sm">
                <span className="text-neutral-400">STONE points</span>
                <span className="text-amber-200 font-mono">
                  {stoneBalance != null ? stoneBalance.toLocaleString() : "—"}
                </span>
              </div>
            )}

            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault()
                refreshBalances()
              }}
              disabled={balancesLoading || wrongNetwork}
              className="text-neutral-300 hover:text-amber-200 hover:bg-amber-900/20 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${balancesLoading ? "animate-spin" : ""}`} />
              Refresh balances
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="text-neutral-300 hover:text-amber-200 hover:bg-amber-900/20 cursor-pointer">
              <a href={`${STELLAR_NETWORK.explorerUrl}/account/${address}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Stellar Expert
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-amber-900/20" />
            <DropdownMenuItem
              onClick={disconnect}
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20 cursor-pointer"
            >
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {error && (
        <span className="hidden lg:inline text-xs text-red-400 max-w-48 truncate" title={error}>
          {error}
        </span>
      )}
      <Button onClick={connect} disabled={status === "connecting"} className={buttonClass}>
        {status === "connecting" ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Wallet className="w-4 h-4 mr-2" />
        )}
        {status === "connecting" ? "Connecting..." : "Connect Freighter"}
      </Button>
    </div>
  )
}
