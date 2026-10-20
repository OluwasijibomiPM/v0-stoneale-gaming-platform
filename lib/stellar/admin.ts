// Server-only: signs contract calls with Stoneale's admin key. Never import this from client components.
import { contract, Keypair } from "@stellar/stellar-sdk"
import { STELLAR_NETWORK } from "./config"
import { ContractCallError, invokeContract, type ContractSigner } from "./contracts"

// STONE points awarded per USD spent
export const STONE_PER_USD = 10
// Error code from the rewards contract
const ALREADY_AWARDED = 4

let signer: ContractSigner | null = null

function getAdminSigner(): ContractSigner {
  if (signer) return signer
  const secret = process.env.STELLAR_ADMIN_SECRET
  if (!secret) throw new Error("STELLAR_ADMIN_SECRET is not configured")
  const keypair = Keypair.fromSecret(secret)
  signer = {
    publicKey: keypair.publicKey(),
    signTransaction: contract.basicNodeSigner(keypair, STELLAR_NETWORK.passphrase).signTransaction,
  }
  return signer
}

/** Awards STONE for a verified payment, at most once per transaction. Returns the amount and new balance. */
export async function awardPurchaseRewards(to: string, usd: number, txHash: string) {
  const admin = getAdminSigner()
  const amount = BigInt(Math.round(usd * STONE_PER_USD))
  const balance = await invokeContract<bigint>(
    "rewards",
    "award_once",
    { minter: admin.publicKey, to, amount, reason: "purchase", reference: Buffer.from(txHash, "hex") },
    admin,
  )
  return { amount: amount.toString(), balance: balance.toString() }
}

export type PurchaseRewards = { amount: string; balance: string } | { error: string }

/** Like awardPurchaseRewards, but never throws: a rewards failure mustn't fail the purchase. */
export async function tryAwardPurchaseRewards(to: string, usd: number, txHash: string): Promise<PurchaseRewards> {
  try {
    return await awardPurchaseRewards(to, usd, txHash)
  } catch (error) {
    if (error instanceof ContractCallError && error.code === ALREADY_AWARDED) {
      return { error: "STONE for this payment was already awarded" }
    }
    console.error("Failed to award STONE:", error)
    return { error: "STONE rewards are unavailable right now" }
  }
}

/** Mints the badge for `achievementId` to `to`. Returns the new badge id. */
export async function mintBadge(to: string, achievementId: number) {
  const admin = getAdminSigner()
  const badgeId = await invokeContract<bigint>(
    "achievements",
    "mint",
    { issuer: admin.publicKey, to, achievement_id: achievementId },
    admin,
  )
  return Number(badgeId)
}
