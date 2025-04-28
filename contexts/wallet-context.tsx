"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { WalletInfo, WalletType, Token } from "@/lib/types"

interface WalletContextType {
  wallet: WalletInfo | null
  connectWallet: (type: WalletType) => Promise<boolean>
  disconnectWallet: () => void
  isConnecting: boolean
}

const WalletContext = createContext<WalletContextType>({
  wallet: null,
  connectWallet: async () => false,
  disconnectWallet: () => {},
  isConnecting: false,
})

export const useWallet = () => useContext(WalletContext)

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [wallet, setWallet] = useState<WalletInfo | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  // Check for existing wallet connection on mount
  useEffect(() => {
    const savedWallet = localStorage.getItem("nexus_wallet")
    if (savedWallet) {
      try {
        setWallet(JSON.parse(savedWallet))
      } catch (error) {
        console.error("Failed to parse saved wallet", error)
        localStorage.removeItem("nexus_wallet")
      }
    }
  }, [])

  // Mock wallet connection
  const connectWallet = async (type: WalletType): Promise<boolean> => {
    setIsConnecting(true)

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
      console.error("Failed to connect wallet", error)
      return false
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setWallet(null)
    localStorage.removeItem("nexus_wallet")
  }

  return (
    <WalletContext.Provider value={{ wallet, connectWallet, disconnectWallet, isConnecting }}>
      {children}
    </WalletContext.Provider>
  )
}
