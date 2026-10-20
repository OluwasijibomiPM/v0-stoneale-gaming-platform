export type StellarNetworkId = "testnet" | "mainnet"

export type StellarNetworkConfig = {
  id: StellarNetworkId
  name: string
  passphrase: string
  horizonUrl: string
  explorerUrl: string
  usdcIssuer: string
}

export const STELLAR_NETWORKS: Record<StellarNetworkId, StellarNetworkConfig> = {
  testnet: {
    id: "testnet",
    name: "Stellar Testnet",
    passphrase: "Test SDF Network ; September 2015",
    horizonUrl: "https://horizon-testnet.stellar.org",
    explorerUrl: "https://stellar.expert/explorer/testnet",
    usdcIssuer: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
  },
  mainnet: {
    id: "mainnet",
    name: "Stellar Mainnet",
    passphrase: "Public Global Stellar Network ; September 2015",
    horizonUrl: "https://horizon.stellar.org",
    explorerUrl: "https://stellar.expert/explorer/public",
    usdcIssuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
  },
}

const configuredNetwork = process.env.NEXT_PUBLIC_STELLAR_NETWORK === "mainnet" ? "mainnet" : "testnet"

// The network the app expects the user's wallet to be on
export const STELLAR_NETWORK = STELLAR_NETWORKS[configuredNetwork]

export const FREIGHTER_INSTALL_URL = "https://www.freighter.app/"

export function shortenAddress(address: string) {
  return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`
}
