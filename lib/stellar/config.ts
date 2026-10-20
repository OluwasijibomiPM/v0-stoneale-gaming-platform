export type StellarNetworkId = "testnet" | "mainnet"

export type StellarNetworkConfig = {
  id: StellarNetworkId
  name: string
  passphrase: string
  horizonUrl: string
  explorerUrl: string
  rpcUrl: string
  usdcIssuer: string
  // Stellar Asset Contracts, used to move XLM and USDC from Soroban contracts
  xlmContract: string
  usdcContract: string
}

export const STELLAR_NETWORKS: Record<StellarNetworkId, StellarNetworkConfig> = {
  testnet: {
    id: "testnet",
    name: "Stellar Testnet",
    passphrase: "Test SDF Network ; September 2015",
    horizonUrl: "https://horizon-testnet.stellar.org",
    explorerUrl: "https://stellar.expert/explorer/testnet",
    rpcUrl: "https://soroban-testnet.stellar.org",
    usdcIssuer: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    xlmContract: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
    usdcContract: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
  },
  mainnet: {
    id: "mainnet",
    name: "Stellar Mainnet",
    passphrase: "Public Global Stellar Network ; September 2015",
    horizonUrl: "https://horizon.stellar.org",
    explorerUrl: "https://stellar.expert/explorer/public",
    // SDF doesn't run a public mainnet RPC, so set NEXT_PUBLIC_STELLAR_RPC_URL to a provider's
    rpcUrl: "",
    usdcIssuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
    xlmContract: "CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA",
    usdcContract: "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75",
  },
}

const configuredNetwork = process.env.NEXT_PUBLIC_STELLAR_NETWORK === "mainnet" ? "mainnet" : "testnet"

// The network the app expects the user's wallet to be on
export const STELLAR_NETWORK: StellarNetworkConfig = {
  ...STELLAR_NETWORKS[configuredNetwork],
  rpcUrl: process.env.NEXT_PUBLIC_STELLAR_RPC_URL || STELLAR_NETWORKS[configuredNetwork].rpcUrl,
}

// Soroban contracts (see soroban/README.md). The defaults are the testnet deployments.
const TESTNET_CONTRACTS = {
  rewards: "CCHSCXH2TGCIDO5HLFQLMJK7LME4ZZZWK57RZ2LMEOKLLIZ5EAJGD7PS",
  achievements: "CBMB32CQYIEAJJ56LTZNXX4Q7P4JYKQEKIVV3IPBZWJ6QZFYVWI66YLQ",
  tournaments: "CAAT4NLDA5XRBVJEGEG6VHDMHPVYD2DHDSSNR57L22KICLIFX3Z2DXUU",
}
const defaults = configuredNetwork === "testnet" ? TESTNET_CONTRACTS : { rewards: "", achievements: "", tournaments: "" }

export const CONTRACT_IDS = {
  rewards: process.env.NEXT_PUBLIC_STONE_REWARDS_CONTRACT || defaults.rewards,
  achievements: process.env.NEXT_PUBLIC_ACHIEVEMENTS_CONTRACT || defaults.achievements,
  tournaments: process.env.NEXT_PUBLIC_TOURNAMENTS_CONTRACT || defaults.tournaments,
}

// Amounts of XLM and USDC are integers with 7 decimal places on Stellar
export function fromStroops(amount: bigint | number) {
  return Number(amount) / 10_000_000
}

export function tokenSymbol(contractId: string) {
  if (contractId === STELLAR_NETWORK.xlmContract) return "XLM"
  if (contractId === STELLAR_NETWORK.usdcContract) return "USDC"
  return shortenAddress(contractId)
}

export const FREIGHTER_INSTALL_URL = "https://www.freighter.app/"

export function shortenAddress(address: string) {
  return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`
}
