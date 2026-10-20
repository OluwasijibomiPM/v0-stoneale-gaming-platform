"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import {
  getAddress,
  getNetwork,
  isAllowed,
  isConnected,
  requestAccess,
  signTransaction,
  WatchWalletChanges,
} from "@stellar/freighter-api"
import type { contract } from "@stellar/stellar-sdk"
import { STELLAR_NETWORK } from "@/lib/stellar/config"
import { getStoneBalance, type ContractSigner } from "@/lib/stellar/contracts"
import { fetchBalances, type StellarBalances } from "@/lib/stellar/horizon"

export type WalletStatus = "checking" | "not-installed" | "disconnected" | "connecting" | "connected"

type StellarWalletContextValue = {
  status: WalletStatus
  address: string | null
  walletNetworkPassphrase: string | null
  // true when Freighter is on a different network than the app expects
  wrongNetwork: boolean
  balances: StellarBalances | null
  // STONE reward points from the rewards contract
  stoneBalance: bigint | null
  balancesLoading: boolean
  error: string | null
  // Signs Soroban contract calls with Freighter; null unless connected to the right network
  signer: ContractSigner | null
  connect: () => Promise<void>
  disconnect: () => void
  refreshBalances: () => Promise<void>
}

const StellarWalletContext = createContext<StellarWalletContextValue | null>(null)

// Freighter has no programmatic disconnect, so remember the user's choice to
// avoid silently reconnecting on the next page load.
const DISCONNECTED_KEY = "stoneale:wallet-disconnected"

function readDisconnectedFlag() {
  try {
    return localStorage.getItem(DISCONNECTED_KEY) === "1"
  } catch {
    return false
  }
}

function writeDisconnectedFlag(disconnected: boolean) {
  try {
    if (disconnected) localStorage.setItem(DISCONNECTED_KEY, "1")
    else localStorage.removeItem(DISCONNECTED_KEY)
  } catch {
    // Storage may be unavailable (private mode); the flag is only a convenience
  }
}

export function StellarWalletProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<WalletStatus>("checking")
  const [address, setAddress] = useState<string | null>(null)
  const [walletNetworkPassphrase, setWalletNetworkPassphrase] = useState<string | null>(null)
  const [balances, setBalances] = useState<StellarBalances | null>(null)
  const [stoneBalance, setStoneBalance] = useState<bigint | null>(null)
  const [balancesLoading, setBalancesLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const wrongNetwork = walletNetworkPassphrase !== null && walletNetworkPassphrase !== STELLAR_NETWORK.passphrase

  const signer = useMemo<ContractSigner | null>(
    () =>
      status === "connected" && address && !wrongNetwork
        ? { publicKey: address, signTransaction: signTransaction as contract.SignTransaction }
        : null,
    [status, address, wrongNetwork],
  )

  const loadNetwork = useCallback(async () => {
    const network = await getNetwork()
    if (!network.error) setWalletNetworkPassphrase(network.networkPassphrase)
  }, [])

  // Restore an existing connection on page load
  useEffect(() => {
    let cancelled = false

    const restore = async () => {
      const connection = await isConnected()
      if (cancelled) return
      if (connection.error || !connection.isConnected) {
        setStatus("not-installed")
        return
      }

      if (readDisconnectedFlag()) {
        setStatus("disconnected")
        return
      }

      const allowed = await isAllowed()
      const current = allowed.isAllowed ? await getAddress() : null
      if (cancelled) return

      // getAddress returns an empty string while Freighter is locked
      if (current && !current.error && current.address) {
        setAddress(current.address)
        await loadNetwork()
        if (!cancelled) setStatus("connected")
      } else {
        setStatus("disconnected")
      }
    }

    restore().catch((err) => {
      console.error("Failed to restore Freighter connection:", err)
      if (!cancelled) setStatus("disconnected")
    })

    return () => {
      cancelled = true
    }
  }, [loadNetwork])

  // Follow account and network switches made inside Freighter
  useEffect(() => {
    if (status !== "connected") return

    const watcher = new WatchWalletChanges(3000)
    watcher.watch(({ address: nextAddress, networkPassphrase, error: watchError }) => {
      if (watchError) return
      if (!nextAddress) {
        // Wallet was locked
        setAddress(null)
        setStatus("disconnected")
        return
      }
      setAddress(nextAddress)
      setWalletNetworkPassphrase(networkPassphrase)
    })

    return () => watcher.stop()
  }, [status])

  const refreshBalances = useCallback(async () => {
    if (!address || wrongNetwork) {
      setBalances(null)
      setStoneBalance(null)
      return
    }
    setBalancesLoading(true)
    await Promise.all([
      fetchBalances(address, STELLAR_NETWORK)
        .then(setBalances)
        .catch((err) => {
          console.error("Failed to load Stellar balances:", err)
          setBalances(null)
        }),
      getStoneBalance(address)
        .then(setStoneBalance)
        .catch((err) => {
          console.error("Failed to load STONE balance:", err)
          setStoneBalance(null)
        }),
    ])
    setBalancesLoading(false)
  }, [address, wrongNetwork])

  useEffect(() => {
    refreshBalances()
  }, [refreshBalances])

  const connect = useCallback(async () => {
    setError(null)
    setStatus("connecting")
    try {
      const access = await requestAccess()
      if (access.error || !access.address) {
        setError(access.error?.message ?? "Freighter did not share an address")
        setStatus("disconnected")
        return
      }
      writeDisconnectedFlag(false)
      setAddress(access.address)
      await loadNetwork()
      setStatus("connected")
    } catch (err) {
      console.error("Freighter connection failed:", err)
      setError("Could not connect to Freighter")
      setStatus("disconnected")
    }
  }, [loadNetwork])

  const disconnect = useCallback(() => {
    writeDisconnectedFlag(true)
    setAddress(null)
    setWalletNetworkPassphrase(null)
    setBalances(null)
    setStoneBalance(null)
    setError(null)
    setStatus("disconnected")
  }, [])

  return (
    <StellarWalletContext.Provider
      value={{
        status,
        address,
        walletNetworkPassphrase,
        wrongNetwork,
        balances,
        stoneBalance,
        balancesLoading,
        error,
        signer,
        connect,
        disconnect,
        refreshBalances,
      }}
    >
      {children}
    </StellarWalletContext.Provider>
  )
}

export function useStellarWallet() {
  const context = useContext(StellarWalletContext)
  if (!context) {
    throw new Error("useStellarWallet must be used within a StellarWalletProvider")
  }
  return context
}
