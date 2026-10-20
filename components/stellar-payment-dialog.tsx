"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertTriangle, CheckCircle2, ExternalLink, Loader2, Sparkles } from "lucide-react"
import { useStellarWallet } from "@/components/stellar-wallet-provider"
import { WalletConnect } from "@/components/wallet-connect"
import { STELLAR_NETWORK } from "@/lib/stellar/config"
import { formatBalance } from "@/lib/stellar/horizon"
import { sendQuotedPayment } from "@/lib/stellar/pay"
import type { PaymentAsset, PaymentProduct } from "@/lib/payments/catalog"
import type { PaymentQuote } from "@/lib/payments/server"
import type { PurchaseRewards } from "@/lib/stellar/admin"

type Step = "idle" | "quoting" | "paying" | "verifying" | "done"

type StellarPaymentDialogProps<T> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  product: PaymentProduct
  usd: number
  // API route that verifies the payment and returns the purchase
  confirmEndpoint: string
  renderSuccess: (result: T) => React.ReactNode
}

export function StellarPaymentDialog<T>({
  open,
  onOpenChange,
  title,
  description,
  product,
  usd,
  confirmEndpoint,
  renderSuccess,
}: StellarPaymentDialogProps<T>) {
  const { status, address, wrongNetwork, balances, refreshBalances } = useStellarWallet()
  const [asset, setAsset] = useState<PaymentAsset>("USDC")
  const [quote, setQuote] = useState<{ quote: PaymentQuote; token: string } | null>(null)
  const [step, setStep] = useState<Step>("idle")
  const [error, setError] = useState<string | null>(null)
  // Kept after a failed confirmation so the user can retry without paying twice
  const [txHash, setTxHash] = useState<string | null>(null)
  const [result, setResult] = useState<T | null>(null)

  const busy = step === "quoting" || step === "paying" || step === "verifying"
  const canPay = status === "connected" && address && !wrongNetwork

  const productKey = JSON.stringify(product)

  const fetchQuote = useCallback(async () => {
    if (!address) return null
    setStep("quoting")
    setError(null)
    try {
      const res = await fetch("/api/payments/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: JSON.parse(productKey), asset, payer: address }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Could not get a price quote")
      setQuote(data)
      setStep("idle")
      return data as { quote: PaymentQuote; token: string }
    } catch (err) {
      setQuote(null)
      setError(err instanceof Error ? err.message : "Could not get a price quote")
      setStep("idle")
      return null
    }
  }, [address, asset, productKey])

  // Reset everything whenever the dialog opens for a new purchase
  useEffect(() => {
    if (!open) return
    setQuote(null)
    setStep("idle")
    setError(null)
    setTxHash(null)
    setResult(null)
  }, [open, productKey])

  useEffect(() => {
    if (open && canPay && !txHash) fetchQuote()
  }, [open, canPay, txHash, fetchQuote])

  const confirm = async (token: string, hash: string) => {
    setStep("verifying")
    setError(null)
    try {
      const res = await fetch(confirmEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, txHash: hash }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Could not confirm the payment")
      setResult(data as T)
      setStep("done")
      refreshBalances()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not confirm the payment")
      setStep("idle")
    }
  }

  const pay = async () => {
    let current = quote
    // A quote for the previously selected asset can still arrive late, so check it matches
    if (!current || current.quote.asset !== asset || current.quote.expiresAt - Date.now() < 60_000) {
      current = await fetchQuote()
      if (!current) return
    }

    setStep("paying")
    setError(null)
    try {
      const hash = await sendQuotedPayment(current.quote)
      setTxHash(hash)
      await confirm(current.token, hash)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed")
      setStep("idle")
    }
  }

  // Confirmation routes also report the STONE points earned for the purchase
  const rewards = (result as { rewards?: PurchaseRewards } | null)?.rewards

  const balance = asset === "XLM" ? balances?.xlm : balances?.usdc
  let balanceProblem: React.ReactNode = null
  if (canPay && balances) {
    if (!balances.funded) {
      balanceProblem = (
        <>
          Your account isn&apos;t funded on {STELLAR_NETWORK.name} yet.
          {STELLAR_NETWORK.id === "testnet" && (
            <>
              {" "}
              <a
                href={`https://friendbot.stellar.org/?addr=${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Fund it with Friendbot
              </a>
              , then refresh balances.
            </>
          )}
        </>
      )
    } else if (asset === "USDC" && balances.usdc === null) {
      balanceProblem = "Your account has no USDC trustline. Add USDC in Freighter under Manage assets, or pay with XLM."
    } else if (quote && balance != null && Number(balance) < Number(quote.quote.amount)) {
      balanceProblem = `Your ${asset} balance (${formatBalance(balance)}) is too low for this payment.`
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent className="bg-neutral-900 border-amber-900/30 text-neutral-200">
        <DialogHeader>
          <DialogTitle className="text-amber-200">{title}</DialogTitle>
          <DialogDescription className="text-neutral-400">{description}</DialogDescription>
        </DialogHeader>

        {step === "done" && result ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Payment confirmed on Stellar</span>
            </div>
            {renderSuccess(result)}
            {rewards &&
              ("amount" in rewards ? (
                <div className="flex items-center gap-2 text-sm text-amber-300">
                  <Sparkles className="w-4 h-4" />
                  You earned {Number(rewards.amount).toLocaleString()} STONE points (balance:{" "}
                  {Number(rewards.balance).toLocaleString()})
                </div>
              ) : (
                <div className="text-xs text-neutral-500">{rewards.error}</div>
              ))}
            {txHash && (
              <a
                href={`${STELLAR_NETWORK.explorerUrl}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300"
              >
                View transaction <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full bg-gradient-to-r from-rose-900 to-amber-900 hover:from-rose-800 hover:to-amber-800 text-amber-200"
            >
              Done
            </Button>
          </div>
        ) : !canPay ? (
          <div className="space-y-4">
            <p className="text-sm text-neutral-400">
              {wrongNetwork
                ? `Switch Freighter to ${STELLAR_NETWORK.name} to continue.`
                : "Connect your Freighter wallet to pay with XLM or USDC."}
            </p>
            <WalletConnect />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {(["USDC", "XLM"] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => setAsset(option)}
                  disabled={busy || txHash !== null}
                  className={`px-4 py-3 rounded-md border text-sm transition-all ${
                    asset === option
                      ? "border-amber-500/60 bg-amber-900/20 text-amber-200"
                      : "border-amber-900/20 text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  <div className="font-medium">{option}</div>
                  <div className="text-xs text-neutral-500">
                    {balances?.funded
                      ? option === "XLM"
                        ? `${formatBalance(balances.xlm ?? "0")} available`
                        : balances.usdc != null
                          ? `${formatBalance(balances.usdc)} available`
                          : "No trustline"
                      : "—"}
                  </div>
                </button>
              ))}
            </div>

            <div className="rounded-md border border-amber-900/20 bg-neutral-950/50 p-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Price</span>
                <span className="text-neutral-200">${usd.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">You pay</span>
                <span className="text-amber-200 font-mono">
                  {step === "quoting" ? (
                    <Loader2 className="w-4 h-4 animate-spin inline" />
                  ) : quote ? (
                    `${Number(quote.quote.amount).toLocaleString(undefined, { maximumFractionDigits: 7 })} ${quote.quote.asset}`
                  ) : (
                    "—"
                  )}
                </span>
              </div>
              <div className="text-xs text-neutral-500 pt-1">Plus a Stellar network fee of less than 0.001 XLM</div>
            </div>

            {balanceProblem && (
              <div className="flex gap-2 text-sm text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{balanceProblem}</span>
              </div>
            )}
            {error && (
              <div className="flex gap-2 text-sm text-red-400">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {txHash && quote ? (
              <Button
                onClick={() => confirm(quote.token, txHash)}
                disabled={busy}
                className="w-full bg-gradient-to-r from-rose-900 to-amber-900 hover:from-rose-800 hover:to-amber-800 text-amber-200"
              >
                {step === "verifying" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {step === "verifying" ? "Confirming payment..." : "Retry confirmation"}
              </Button>
            ) : (
              <Button
                onClick={pay}
                disabled={busy || !quote || balanceProblem !== null}
                className="w-full bg-gradient-to-r from-rose-900 to-amber-900 hover:from-rose-800 hover:to-amber-800 text-amber-200"
              >
                {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {step === "paying"
                  ? "Approve in Freighter..."
                  : step === "verifying"
                    ? "Confirming payment..."
                    : `Pay with ${asset}`}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
