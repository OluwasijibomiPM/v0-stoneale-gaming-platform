import { NextResponse } from "next/server"
import { Keypair, StrKey } from "@stellar/stellar-sdk"
import { ACHIEVEMENTS, isUnlocked, mintBadgeMessage } from "@/lib/achievements"
import { mintBadge } from "@/lib/stellar/admin"
import { ContractCallError } from "@/lib/stellar/contracts"

const MAX_SIGNATURE_AGE_MS = 5 * 60 * 1000
// Error code from the achievements contract
const ALREADY_OWNED = 4

function decodeSignature(signature: string) {
  return /^[0-9a-f]{128}$/i.test(signature) ? Buffer.from(signature, "hex") : Buffer.from(signature, "base64")
}

// Accepts SEP-53 signed messages, plus signatures over the raw message from older wallets
function verifySignature(address: string, message: string, signature: Buffer) {
  const keypair = Keypair.fromPublicKey(address)
  try {
    return keypair.verifyMessage(message, signature) || keypair.verify(Buffer.from(message), signature)
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  try {
    const { address, achievementId, timestamp, signature } = await request.json()

    if (typeof address !== "string" || !StrKey.isValidEd25519PublicKey(address)) {
      return NextResponse.json({ error: "Invalid Stellar address" }, { status: 400 })
    }
    const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId)
    if (!achievement) {
      return NextResponse.json({ error: "Unknown achievement" }, { status: 400 })
    }
    if (typeof timestamp !== "number" || Math.abs(Date.now() - timestamp) > MAX_SIGNATURE_AGE_MS) {
      return NextResponse.json({ error: "Signature expired, please try again" }, { status: 400 })
    }
    if (typeof signature !== "string") {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 })
    }

    const message = mintBadgeMessage(address, achievement.id, timestamp)
    if (!verifySignature(address, message, decodeSignature(signature))) {
      return NextResponse.json({ error: "Signature doesn't match this wallet" }, { status: 401 })
    }
    if (!isUnlocked(address, achievement)) {
      return NextResponse.json({ error: "You haven't unlocked this achievement yet" }, { status: 403 })
    }

    const badgeId = await mintBadge(address, achievement.id)
    return NextResponse.json({ success: true, badgeId })
  } catch (error) {
    if (error instanceof ContractCallError && error.code === ALREADY_OWNED) {
      return NextResponse.json({ error: "You already own this badge" }, { status: 409 })
    }
    console.error("Badge mint failed:", error)
    return NextResponse.json({ error: "Failed to mint badge" }, { status: 500 })
  }
}
