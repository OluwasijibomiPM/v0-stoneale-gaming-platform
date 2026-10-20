import { signTransaction } from "@stellar/freighter-api"
import { STELLAR_NETWORK } from "./config"
import type { PaymentQuote } from "@/lib/payments/server"

// Horizon result codes that have a clearer explanation for users
const RESULT_CODE_MESSAGES: Record<string, string> = {
  op_underfunded: "Your balance is too low for this payment",
  op_low_reserve: "Your XLM balance would drop below Stellar's minimum reserve",
  op_no_trust: "A USDC trustline is missing on your account or Stoneale's",
  op_src_no_trust: "Your account has no USDC trustline",
  op_no_destination: "Stoneale's payment account doesn't exist on this network",
  tx_bad_seq: "Your account sequence changed, please try again",
  tx_insufficient_balance: "Not enough XLM to cover the network fee",
  tx_too_late: "The transaction expired before it was submitted, please try again",
}

function describeSubmitError(err: unknown) {
  const codes = (err as { response?: { data?: { extras?: { result_codes?: { transaction?: string; operations?: string[] } } } } })
    ?.response?.data?.extras?.result_codes
  const code = codes?.operations?.find((c) => c !== "op_success") ?? codes?.transaction
  if (code) return RESULT_CODE_MESSAGES[code] ?? `Stellar rejected the transaction (${code})`
  return err instanceof Error ? err.message : "Failed to submit the transaction"
}

// Builds the payment described by a quote, has Freighter sign it and submits it to Horizon.
// Returns the transaction hash.
export async function sendQuotedPayment(quote: PaymentQuote): Promise<string> {
  // The SDK is large, so load it only when someone actually pays
  const { Asset, Horizon, Memo, Operation, TransactionBuilder } = await import("@stellar/stellar-sdk")
  const server = new Horizon.Server(STELLAR_NETWORK.horizonUrl)

  const account = await server.loadAccount(quote.payer)
  const fee = await server.fetchBaseFee()
  const asset = quote.asset === "XLM" ? Asset.native() : new Asset("USDC", STELLAR_NETWORK.usdcIssuer)

  const tx = new TransactionBuilder(account, { fee: String(fee), networkPassphrase: STELLAR_NETWORK.passphrase })
    .addOperation(Operation.payment({ destination: quote.destination, asset, amount: quote.amount }))
    .addMemo(Memo.text(quote.memo))
    .setTimeout(180)
    .build()

  const signed = await signTransaction(tx.toXDR(), {
    networkPassphrase: STELLAR_NETWORK.passphrase,
    address: quote.payer,
  })
  if (signed.error) throw new Error(signed.error.message || "Freighter did not sign the transaction")

  try {
    const result = await server.submitTransaction(
      TransactionBuilder.fromXDR(signed.signedTxXdr, STELLAR_NETWORK.passphrase),
    )
    return result.hash
  } catch (err) {
    throw new Error(describeSubmitError(err))
  }
}
