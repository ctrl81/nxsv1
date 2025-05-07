"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { WalletInfo, WalletType, Token } from "@/lib/types"

interface WalletContextType {
  wallet: WalletInfo | null
  connectWallet: (type: WalletType) => Promise<boolean>
  disconnectWallet: () => void
  isConnecting: boolean
  error: string | null
}

const WalletContext = createContext<WalletContextType>({
  wallet: null,
  connectWallet: async () => false,
  disconnectWallet: () => {},
  isConnecting: false,
  error: null,
})

export const useWallet = () => useContext(WalletContext)

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [wallet, setWallet] = useState<WalletInfo | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check for existing wallet connection on mount
  useEffect(() => {
    const savedWallet = localStorage.getItem("nexus_wallet")
    if (savedWallet) {
      try {
        const parsedWallet = JSON.parse(savedWallet)
        if (isValidWalletInfo(parsedWallet)) {
          setWallet(parsedWallet)
        } else {
          throw new Error("Invalid wallet data")
        }
      } catch (error) {
        console.error("Failed to parse saved wallet", error)
        localStorage.removeItem("nexus_wallet")
        setError("Failed to restore wallet connection")
      }
    }
  }, [])

  const isValidWalletInfo = (data: any): data is WalletInfo => {
    return (
      data &&
      typeof data.address === "string" &&
      typeof data.balance === "object" &&
      typeof data.connected === "boolean" &&
      typeof data.type === "string"
    )
  }

  const connectWallet = async (type: WalletType): Promise<boolean> => {
    setIsConnecting(true)
    setError(null)

    try {
      // Simulate connection delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Generate mock wallet data
      const mockAddress = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`

      const mockBalance: Record<Token, number> = {
        WBTC: Number.parseFloat((Math.random() * 2).toFixed(8)),
        ETH: Number.parseFloat((Math.random() * 10).toFixed(8)),
        SUI: Number.parseFloat((Math.random() * 1000).toFixed(2)),
      }

      const newWallet: WalletInfo = {
        address: mockAddress,
        balance: mockBalance,
        connected: true,
        type,
      }

      setWallet(newWallet)
      localStorage.setItem("nexus_wallet", JSON.stringify(newWallet))
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to connect wallet"
      setError(errorMessage)
      console.error("Failed to connect wallet", error)
      return false
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setWallet(null)
    setError(null)
    localStorage.removeItem("nexus_wallet")
  }

  return (
    <WalletContext.Provider value={{ wallet, connectWallet, disconnectWallet, isConnecting, error }}>
      {children}
    </WalletContext.Provider>
  )
}
