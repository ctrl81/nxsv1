"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { CandleData, OrderBook, Position, Order, TradeHistory, PositionType, OrderType, Token } from "@/lib/types"
import { generateMockCandleData, generateMockOrderBook } from "@/lib/mock-data"
import { useWallet } from "./wallet-context"

interface TradeFormData {
  type: PositionType
  orderType: OrderType
  amount: number
  leverage: number
  price?: number
  token: Token
}

interface TradingContextType {
  candleData: CandleData[]
  orderBook: OrderBook
  positions: Position[]
  orders: Order[]
  tradeHistory: TradeHistory[]
  currentPrice: number
  executeTrade: (data: TradeFormData) => Promise<boolean>
  closePosition: (id: string) => Promise<boolean>
  cancelOrder: (id: string) => Promise<boolean>
  isLoading: boolean
}

const TradingContext = createContext<TradingContextType>({
  candleData: [],
  orderBook: { bids: [], asks: [] },
  positions: [],
  orders: [],
  tradeHistory: [],
  currentPrice: 0,
  executeTrade: async () => false,
  closePosition: async () => false,
  cancelOrder: async () => false,
  isLoading: false,
})

export const useTrading = () => useContext(TradingContext)

interface TradingProviderProps {
  children: ReactNode
}

export function TradingProvider({ children }: TradingProviderProps) {
  const { wallet } = useWallet()
  const [candleData, setCandleData] = useState<CandleData[]>([])
  const [orderBook, setOrderBook] = useState<OrderBook>({ bids: [], asks: [] })
  const [positions, setPositions] = useState<Position[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([])
  const [currentPrice, setCurrentPrice] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Initialize data on mount
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true)
      try {
        // Generate mock data
        const mockCandleData = generateMockCandleData()
        const mockOrderBook = generateMockOrderBook()

        setCandleData(mockCandleData)
        setOrderBook(mockOrderBook)

        // Set current price from the latest candle
        if (mockCandleData.length > 0) {
          setCurrentPrice(mockCandleData[mockCandleData.length - 1].close)
        }
      } catch (error) {
        console.error("Failed to initialize trading data", error)
      } finally {
        setIsLoading(false)
      }
    }

    initData()

    // Set up interval to update data
    const interval = setInterval(() => {
      // Update candle data with a new candle
      setCandleData((prev) => {
        if (prev.length === 0) return prev

        const lastCandle = prev[prev.length - 1]
        const time = lastCandle.time + 60 * 1000 // 1 minute
        const open = lastCandle.close
        const close = open * (1 + (Math.random() - 0.5) * 0.01)
        const high = Math.max(open, close) * (1 + Math.random() * 0.005)
        const low = Math.min(open, close) * (1 - Math.random() * 0.005)
        const volume = Math.random() * 100 + 50

        const newCandle: CandleData = { time, open, high, low, close, volume }
        setCurrentPrice(close)

        return [...prev.slice(1), newCandle]
      })

      // Update order book
      setOrderBook(generateMockOrderBook())

      // Update positions PnL
      setPositions((prev) =>
        prev.map((position) => {
          const pnlPercentage =
            position.type === "long"
              ? ((currentPrice - position.entryPrice) / position.entryPrice) * 100 * position.leverage
              : ((position.entryPrice - currentPrice) / position.entryPrice) * 100 * position.leverage

          const pnl = (position.size * pnlPercentage) / 100

          return {
            ...position,
            pnl,
            pnlPercentage,
          }
        }),
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Execute a trade
  const executeTrade = async (data: TradeFormData): Promise<boolean> => {
    if (!wallet?.connected) return false

    setIsLoading(true)
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Create a new position
      const newPosition: Position = {
        id: `pos-${Date.now()}`,
        type: data.type,
        entryPrice: currentPrice,
        leverage: data.leverage,
        size: data.amount,
        margin: data.amount / data.leverage,
        liquidationPrice:
          data.type === "long" ? currentPrice * (1 - 0.9 / data.leverage) : currentPrice * (1 + 0.9 / data.leverage),
        pnl: 0,
        pnlPercentage: 0,
        timestamp: Date.now(),
      }

      setPositions((prev) => [...prev, newPosition])

      // Add to trade history
      const newTrade: TradeHistory = {
        id: `trade-${Date.now()}`,
        type: data.type,
        price: currentPrice,
        size: data.amount,
        fee: data.amount * 0.0006, // 0.06% fee
        timestamp: Date.now(),
      }

      setTradeHistory((prev) => [...prev, newTrade])

      return true
    } catch (error) {
      console.error("Failed to execute trade", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Close a position
  const closePosition = async (id: string): Promise<boolean> => {
    if (!wallet?.connected) return false

    setIsLoading(true)
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Find the position
      const position = positions.find((p) => p.id === id)
      if (!position) return false

      // Add to trade history
      const newTrade: TradeHistory = {
        id: `trade-${Date.now()}`,
        type: position.type === "long" ? "short" : "long", // Opposite to close
        price: currentPrice,
        size: position.size,
        fee: position.size * 0.0006, // 0.06% fee
        timestamp: Date.now(),
      }

      setTradeHistory((prev) => [...prev, newTrade])

      // Remove the position
      setPositions((prev) => prev.filter((p) => p.id !== id))

      return true
    } catch (error) {
      console.error("Failed to close position", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Cancel an order
  const cancelOrder = async (id: string): Promise<boolean> => {
    if (!wallet?.connected) return false

    setIsLoading(true)
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update the order status
      setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, status: "canceled" } : order)))

      return true
    } catch (error) {
      console.error("Failed to cancel order", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <TradingContext.Provider
      value={{
        candleData,
        orderBook,
        positions,
        orders,
        tradeHistory,
        currentPrice,
        executeTrade,
        closePosition,
        cancelOrder,
        isLoading,
      }}
    >
      {children}
    </TradingContext.Provider>
  )
}
