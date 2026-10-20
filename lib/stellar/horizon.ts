import type { StellarNetworkConfig } from "./config"

export type StellarBalances = {
  // false means the account has not been created (funded) on this network yet
  funded: boolean
  xlm: string | null
  // null means the account has no USDC trustline
  usdc: string | null
}

type HorizonBalance = {
  asset_type: string
  asset_code?: string
  asset_issuer?: string
  balance: string
}

export async function fetchBalances(address: string, network: StellarNetworkConfig): Promise<StellarBalances> {
  const res = await fetch(`${network.horizonUrl}/accounts/${address}`)

  if (res.status === 404) {
    return { funded: false, xlm: null, usdc: null }
  }
  if (!res.ok) {
    throw new Error(`Horizon request failed with status ${res.status}`)
  }

  const account: { balances: HorizonBalance[] } = await res.json()
  const xlm = account.balances.find((b) => b.asset_type === "native")
  const usdc = account.balances.find((b) => b.asset_code === "USDC" && b.asset_issuer === network.usdcIssuer)

  return {
    funded: true,
    xlm: xlm?.balance ?? "0",
    usdc: usdc?.balance ?? null,
  }
}

export function formatBalance(balance: string) {
  return Number(balance).toLocaleString(undefined, { maximumFractionDigits: 2 })
}
