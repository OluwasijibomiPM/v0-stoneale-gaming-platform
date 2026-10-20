import { NextResponse } from "next/server"
import { ACHIEVEMENTS } from "@/lib/achievements"

// NFT metadata for each achievement, referenced by the achievements contract's metadata URIs
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const achievement = ACHIEVEMENTS.find((a) => a.id === Number(params.id))
  if (!achievement) {
    return NextResponse.json({ error: "Unknown achievement" }, { status: 404 })
  }

  return NextResponse.json({
    name: achievement.title,
    description: `${achievement.description}. A soulbound Stoneale achievement badge on Stellar.`,
    external_url: new URL("/nfts", request.url).toString(),
    attributes: [
      { trait_type: "Rarity", value: achievement.rarity },
      { trait_type: "Requirement", value: achievement.description },
    ],
  })
}
