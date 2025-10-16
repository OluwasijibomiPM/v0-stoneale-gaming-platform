"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Wallet, ChevronDown, Check } from "lucide-react"

type BlockchainNetwork = {
  id: string
  name: string
  chainId: string
  icon: string
  color: string
}

const SUPPORTED_NETWORKS: BlockchainNetwork[] = [
  {
    id: "stacks",
    name: "Stacks",
    chainId: "mainnet",
    icon: "STX",
    color: "from-purple-600 to-indigo-600",
  },
  {
    id: "base",
    name: "Base",
    chainId: "8453",
    icon: "BASE",
    color: "from-blue-600 to-cyan-600",
  },
  {
    id: "lisk",
    name: "Lisk",
    chainId: "1135",
    icon: "LSK",
    color: "from-blue-500 to-teal-500",
  },
  {
    id: "ethereum",
    name: "Ethereum",
    chainId: "1",
    icon: "ETH",
    color: "from-slate-600 to-gray-600",
  },
  {
    id: "polygon",
    name: "Polygon",
    chainId: "137",
    icon: "MATIC",
    color: "from-purple-500 to-violet-600",
  },
  {
    id: "arbitrum",
    name: "Arbitrum",
    chainId: "42161",
    icon: "ARB",
    color: "from-blue-400 to-cyan-500",
  },
  {
    id: "optimism",
    name: "Optimism",
    chainId: "10",
    icon: "OP",
    color: "from-red-500 to-pink-500",
  },
]

export function WalletConnect() {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [selectedNetwork, setSelectedNetwork] = useState<BlockchainNetwork>(SUPPORTED_NETWORKS[0])

  const connectWallet = async (network: BlockchainNetwork) => {
    try {
      console.log("[v0] Connecting wallet to", network.name)
      // Simulate wallet connection with WalletConnect
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Generate mock address based on network
      let mockAddress: string
      if (network.id === "stacks") {
        // Stacks addresses start with SP or SM
        mockAddress = "SP" + Math.random().toString(36).substring(2, 40).toUpperCase()
      } else {
        // EVM-compatible addresses
        mockAddress = "0x" + Math.random().toString(16).substring(2, 42)
      }

      setAddress(mockAddress)
      setSelectedNetwork(network)
      setIsConnected(true)
    } catch (error) {
      console.error("[v0] Wallet connection failed:", error)
    }
  }

  const switchNetwork = async (network: BlockchainNetwork) => {
    try {
      console.log("[v0] Switching to", network.name)
      await new Promise((resolve) => setTimeout(resolve, 800))
      setSelectedNetwork(network)
    } catch (error) {
      console.error("[v0] Network switch failed:", error)
    }
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setAddress(null)
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="bg-gradient-to-r from-rose-900/50 to-amber-900/50 border-amber-700/50 text-amber-200 hover:from-rose-800/50 hover:to-amber-800/50"
            >
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${selectedNetwork.color} mr-2`} />
              {selectedNetwork.name}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-neutral-900 border-amber-900/30">
            <DropdownMenuLabel className="text-amber-200">Select Network</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-amber-900/20" />
            {SUPPORTED_NETWORKS.map((network) => (
              <DropdownMenuItem
                key={network.id}
                onClick={() => switchNetwork(network)}
                className="text-neutral-300 hover:text-amber-200 hover:bg-amber-900/20 cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${network.color}`} />
                    <span>{network.name}</span>
                    <span className="text-xs text-neutral-500">({network.icon})</span>
                  </div>
                  {selectedNetwork.id === network.id && <Check className="w-4 h-4 text-amber-400" />}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="bg-gradient-to-r from-rose-900/50 to-amber-900/50 border-amber-700/50 text-amber-200 hover:from-rose-800/50 hover:to-amber-800/50"
            >
              <Wallet className="w-4 h-4 mr-2" />
              {address.substring(0, 6)}...{address.substring(address.length - 4)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-neutral-900 border-amber-900/30">
            <DropdownMenuLabel className="text-amber-200">Wallet</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-amber-900/20" />
            <DropdownMenuItem className="text-neutral-400 text-xs font-mono">{address}</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-amber-900/20" />
            <DropdownMenuItem
              onClick={disconnectWallet}
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20 cursor-pointer"
            >
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-gradient-to-r from-rose-900 to-amber-900 hover:from-rose-800 hover:to-amber-800 text-amber-200">
          <Wallet className="w-4 h-4 mr-2" />
          Connect Wallet
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-neutral-900 border-amber-900/30 w-56">
        <DropdownMenuLabel className="text-amber-200">Select Network</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-amber-900/20" />
        {SUPPORTED_NETWORKS.map((network) => (
          <DropdownMenuItem
            key={network.id}
            onClick={() => connectWallet(network)}
            className="text-neutral-300 hover:text-amber-200 hover:bg-amber-900/20 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${network.color}`} />
              <div>
                <div className="font-medium">{network.name}</div>
                <div className="text-xs text-neutral-500">{network.icon}</div>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
