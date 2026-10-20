// Achievements, shared by the NFTs page, the mint API and the NFT metadata route.
// `id` matches the achievement id defined in the achievements contract.
//
// Progress is still sample data: there's no per-user progress tracking yet. Until there
// is, any wallet can mint the badges marked `unlocked`. Replace `getProgress` with real
// data before relying on badges as proof of anything.

export type AchievementInfo = {
  id: number
  title: string
  description: string
  rarity: "Legendary" | "Epic" | "Rare" | "Common"
  total: number
}

export const ACHIEVEMENTS: AchievementInfo[] = [
  { id: 1, title: "Chess Master", description: "Won 50 chess games", rarity: "Legendary", total: 50 },
  { id: 2, title: "Mindful Warrior", description: "Completed 100 mindfulness sessions", rarity: "Epic", total: 100 },
  { id: 3, title: "Wellness Streak", description: "30-day consecutive login", rarity: "Rare", total: 30 },
  { id: 4, title: "Community Helper", description: "Helped 25 users in forums", rarity: "Common", total: 25 },
]

const SAMPLE_PROGRESS: Record<number, number> = { 1: 50, 2: 87, 3: 30, 4: 18 }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getProgress(address: string | null, achievementId: number) {
  return SAMPLE_PROGRESS[achievementId] ?? 0
}

export function isUnlocked(address: string | null, achievement: AchievementInfo) {
  return getProgress(address, achievement.id) >= achievement.total
}

// The message a wallet signs to prove it's asking for its own badge
export function mintBadgeMessage(address: string, achievementId: number, timestamp: number) {
  return `Stoneale: mint achievement ${achievementId} to ${address} at ${timestamp}`
}
