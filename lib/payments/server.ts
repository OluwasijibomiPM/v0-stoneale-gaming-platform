import { createHmac, randomBytes, timingSafeEqual } from "crypto"
import { StrKey } from "@stellar/stellar-sdk"
import { STELLAR_NETWORK } from "@/lib/stellar/config"
import type { PaymentAsset, PaymentProduct } from "./catalog"

// How long the user has to sign and submit the payment after requesting a quote
const QUOTE_TTL_MS = 10 * 60 * 1000

export type PaymentQuote = {
  product: PaymentProduct
  usd: number
  asset: PaymentAsset
  // Decimal string with up to 7 places, as used by Stellar
  amount: string
  destination: string
  payer: string
  memo: string
  network: string
  expiresAt: number
}

export class PaymentError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message)
  }
}

function getTreasuryAddress() {
  const address = process.env.STELLAR_TREASURY_ADDRESS
  if (!address || !StrKey.isValidEd25519PublicKey(address)) {
    throw new PaymentError("Stellar payments are not configured (STELLAR_TREASURY_ADDRESS)", 503)
  }
  return address
}

function getQuoteSecret() {
  const secret = process.env.PAYMENT_QUOTE_SECRET
  if (!secret || secret.length < 32) {
    throw new PaymentError("Stellar payments are not configured (PAYMENT_QUOTE_SECRET)", 503)
  }
  return secret
}

async function getXlmUsdRate(): Promise<number> {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd", {
      next: { revalidate: 60 },
    })
    if (res.ok) {
      const data: { stellar?: { usd?: number } } = await res.json()
      if (data.stellar?.usd && data.stellar.usd > 0) return data.stellar.usd
    }
  } catch (err) {
    console.error("Failed to fetch XLM price:", err)
  }

  const fallback = Number(process.env.STELLAR_XLM_USD_FALLBACK_RATE)
  if (fallback > 0) return fallback
  throw new PaymentError("XLM price is unavailable right now, try paying with USDC", 503)
}

// Stellar amounts have 7 decimal places; compare them as integer stroops to avoid float errors
function toStroops(amount: string): bigint {
  const [whole, fraction = ""] = amount.split(".")
  return BigInt(whole) * BigInt(10_000_000) + BigInt(fraction.padEnd(7, "0").slice(0, 7))
}

function sign(payload: string) {
  return createHmac("sha256", getQuoteSecret()).update(payload).digest("base64url")
}

export async function createQuote(
  product: PaymentProduct,
  usd: number,
  asset: PaymentAsset,
  payer: string,
): Promise<{ quote: PaymentQuote; token: string }> {
  if (!StrKey.isValidEd25519PublicKey(payer)) {
    throw new PaymentError("Invalid Stellar address")
  }

  let amount: string
  if (asset === "USDC") {
    amount = usd.toFixed(7)
  } else {
    // Round up to the nearest stroop so the payment never falls short of the price
    const stroops = Math.ceil((usd / (await getXlmUsdRate())) * 10_000_000)
    amount = (stroops / 10_000_000).toFixed(7)
  }

  const quote: PaymentQuote = {
    product,
    usd,
    asset,
    amount,
    destination: getTreasuryAddress(),
    payer,
    // Text memos are limited to 28 bytes
    memo: `stn-${randomBytes(6).toString("hex")}`,
    network: STELLAR_NETWORK.passphrase,
    expiresAt: Date.now() + QUOTE_TTL_MS,
  }

  const payload = Buffer.from(JSON.stringify(quote)).toString("base64url")
  return { quote, token: `${payload}.${sign(payload)}` }
}

function readQuote(token: unknown): PaymentQuote {
  if (typeof token !== "string") throw new PaymentError("Missing payment quote")
  const [payload, signature] = token.split(".")
  if (!payload || !signature) throw new PaymentError("Malformed payment quote")

  const expected = Buffer.from(sign(payload))
  const actual = Buffer.from(signature)
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    throw new PaymentError("Payment quote signature is invalid")
  }

  const quote: PaymentQuote = JSON.parse(Buffer.from(payload, "base64url").toString())
  if (quote.network !== STELLAR_NETWORK.passphrase) {
    throw new PaymentError("Payment quote is for a different Stellar network")
  }
  return quote
}

type HorizonTransaction = {
  successful: boolean
  memo_type: string
  memo?: string
  created_at: string
}

type HorizonPayment = {
  type: string
  transaction_successful: boolean
  from: string
  to: string
  asset_type: string
  asset_code?: string
  asset_issuer?: string
  amount: string
}

// Checks on Horizon that the transaction pays the quoted amount to the treasury.
// Bookings and subscriptions aren't persisted yet, so a used transaction hash is not
// tracked; once they are, store the hash and reject repeats.
export async function verifyPayment(token: unknown, txHash: unknown): Promise<PaymentQuote & { txHash: string }> {
  const quote = readQuote(token)

  if (typeof txHash !== "string" || !/^[0-9a-f]{64}$/i.test(txHash)) {
    throw new PaymentError("Invalid transaction hash")
  }

  const txRes = await fetch(`${STELLAR_NETWORK.horizonUrl}/transactions/${txHash}`, { cache: "no-store" })
  if (txRes.status === 404) throw new PaymentError("Transaction not found on the Stellar network", 404)
  if (!txRes.ok) throw new PaymentError("Could not reach Stellar Horizon", 502)
  const tx: HorizonTransaction = await txRes.json()

  if (!tx.successful) throw new PaymentError("Transaction failed on the Stellar network")
  if (tx.memo_type !== "text" || tx.memo !== quote.memo) {
    throw new PaymentError("Transaction memo does not match this payment")
  }
  if (new Date(tx.created_at).getTime() > quote.expiresAt) {
    throw new PaymentError("Payment was made after the quote expired")
  }

  const paymentsRes = await fetch(`${STELLAR_NETWORK.horizonUrl}/transactions/${txHash}/payments?limit=200`, {
    cache: "no-store",
  })
  if (!paymentsRes.ok) throw new PaymentError("Could not reach Stellar Horizon", 502)
  const payments: { _embedded: { records: HorizonPayment[] } } = await paymentsRes.json()

  const required = toStroops(quote.amount)
  const paid = payments._embedded.records.some((p) => {
    const assetMatches =
      quote.asset === "XLM"
        ? p.asset_type === "native"
        : p.asset_code === "USDC" && p.asset_issuer === STELLAR_NETWORK.usdcIssuer
    return (
      p.type === "payment" &&
      p.transaction_successful &&
      p.from === quote.payer &&
      p.to === quote.destination &&
      assetMatches &&
      toStroops(p.amount) >= required
    )
  })

  if (!paid) throw new PaymentError("Transaction does not pay the quoted amount to Stoneale")

  return { ...quote, txHash }
}

export function paymentErrorResponse(error: unknown) {
  if (error instanceof PaymentError) {
    return { body: { error: error.message }, status: error.status }
  }
  console.error("Payment processing failed:", error)
  return { body: { error: "Payment processing failed" }, status: 500 }
}
