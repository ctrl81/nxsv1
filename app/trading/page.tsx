"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { SimpleCandlestickChart } from "@/components/trading/simple-candlestick-chart"
import { OrderBook } from "@/components/trading/order-book"
import { TradeForm } from "@/components/trading/trade-form"
import { PositionsTable } from "@/components/trading/positions-table"
import { OrdersTable } from "@/components/trading/orders-table"
import { TradeHistoryTable } from "@/components/trading/trade-history-table"
import { DepositModal } from "@/components/trading/deposit-modal"
import { WithdrawModal } from "@/components/trading/withdraw-modal"
import { AnimatedButton } from "@/components/animations/animated-button"
import { TradingPairSelector } from "@/components/trading/trading-pair-selector"
import { PriceAlertModal } from "@/components/trading/price-alert"
import { TradeConfirmationModal } from "@/components/trading/trade-confirmation-modal"
import { PerformanceMetrics } from "@/components/trading/performance-metrics"
import { ArrowDownToLine, ArrowUpFromLine, Menu, X, Settings, BarChart2, Bell } from "lucide-react"
import type {
  CandleData,
  Position,
  Order,
  TradeHistory,
  OrderType,
  PositionType,
  Token,
  TradingPair,
} from "@/lib/types"
import { formatPrice } from "@/lib/utils"
import { generateMockCandleData, suiTradingPairs } from "@/lib/mock-data"
import { useWallet } from "@/contexts/wallet-context"
import { useToast } from "@/components/ui/use-toast"

export default function TradingPage() {
  // Get toast function
  const { toast } = useToast()

  // State for tabs
  const [activeTab, setActiveTab] = useState("chart")
  const [activePositionsTab, setActivePositionsTab] = useState("positions")
  const [timeframe, setTimeframe] = useState("1h")
  const [showPerformance, setShowPerformance] = useState(false)

  // State for modals
  const [depositModalOpen, setDepositModalOpen] = useState(false)
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [alertModalOpen, setAlertModalOpen] = useState(false)
  const [tradeConfirmModalOpen, setTradeConfirmModalOpen] = useState(false)
  const [pendingTradeDetails, setPendingTradeDetails] = useState<any>(null)

  // Trading data state
  const [candleData, setCandleData] = useState<CandleData[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([])
  const [currentPrice, setCurrentPrice] = useState(1.45) // Default to SUI price
  const [isConnected, setIsConnected] = useState(false)
  const [priceAlerts, setPriceAlerts] = useState<any[]>([])

  // Trading pairs state - using Sui blockchain pairs
  const [tradingPairs, setTradingPairs] = useState<TradingPair[]>(suiTradingPairs)
  const [selectedPair, setSelectedPair] = useState<TradingPair>(suiTradingPairs[0]) // Default to SUI/USDC

  // Balances state - using Sui blockchain tokens
  const [balances, setBalances] = useState<Record<Token, number>>({
    SUI: 500,
    USDC: 1000,
    USDT: 1000,
    WETH: 0.5,
    WBTC: 0.02,
    CETUS: 1000,
    TURBOS: 500,
    AFT: 2000,
  })

  // Use the wallet context
  const { wallet, connectWallet } = useWallet()
  const walletIsConnected = wallet?.connected || false

  // Refs to track position changes for notifications
  const positionsRef = useRef<Position[]>([])
  const ordersRef = useRef<Order[]>([])

  // Initialize with mock data
  useEffect(() => {
    loadPairData(selectedPair.id)

    // Simulate price updates
    const interval = setInterval(() => {
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
        const newPrice = close
        setCurrentPrice(newPrice)

        // Update the price in the trading pairs
        setTradingPairs((pairs) =>
          pairs.map((pair) => (pair.id === selectedPair.id ? { ...pair, price: newPrice } : pair)),
        )

        // Check for triggered price alerts
        checkPriceAlerts(newPrice)

        return [...prev.slice(1), newCandle]
      })

      // Update positions PnL and check for stop loss/take profit
      setPositions((prev) => {
        const updatedPositions = prev.map((position) => {
          // Calculate new PnL based on current price
          const pnlPercentage =
            position.type === "long"
              ? ((currentPrice - position.entryPrice) / position.entryPrice) * 100 * position.leverage
              : ((position.entryPrice - currentPrice) / position.entryPrice) * 100 * position.leverage

          const pnl = (position.size * pnlPercentage) / 100

          // Check if stop loss or take profit would be triggered
          const isStopLossTriggered =
            position.stopLoss &&
            ((position.type === "long" && currentPrice <= position.stopLoss) ||
              (position.type === "short" && currentPrice >= position.stopLoss))

          const isTakeProfitTriggered =
            position.takeProfit &&
            ((position.type === "long" && currentPrice >= position.takeProfit) ||
              (position.type === "short" && currentPrice <= position.takeProfit))

          // If stop loss or take profit is triggered, we'll handle it in the next step
          return {
            ...position,
            pnl,
            pnlPercentage,
            _shouldClose: isStopLossTriggered || isTakeProfitTriggered,
            _closeReason: isStopLossTriggered ? "Stop Loss" : isTakeProfitTriggered ? "Take Profit" : null,
          }
        })

        // Close positions that hit stop loss or take profit
        const positionsToClose = updatedPositions.filter((position) => position._shouldClose)

        if (positionsToClose.length > 0) {
          // Add to trade history for closed positions
          positionsToClose.forEach((position) => {
            const closeReason = position._closeReason || "Manual Close"

            // Add to trade history
            const newTrade: TradeHistory = {
              id: `trade-${Date.now()}-${position.id}`,
              type: position.type === "long" ? "short" : "long", // Opposite to close
              price: currentPrice,
              size: position.size,
              fee: position.size * 0.0006, // 0.06% fee
              timestamp: Date.now(),
              action: "close",
              pnl: position.pnl,
              reason: closeReason,
            }

            setTradeHistory((prev) => [...prev, newTrade])
          })

          // Filter out closed positions
          return updatedPositions.filter((position) => !position._shouldClose)
        }

        return updatedPositions
      })

      // Process limit orders
      setOrders((prev) => {
        const updatedOrders = prev.map((order) => {
          if (order.status !== "open" || order.type !== "limit") return order

          // Check if limit order should be filled
          const shouldFill =
            (order.positionType === "long" && currentPrice <= order.price) ||
            (order.positionType === "short" && currentPrice >= order.price)

          if (shouldFill) {
            // Create a new position
            const newPosition: Position = {
              id: `pos-${Date.now()}-${order.id}`,
              type: order.positionType,
              entryPrice: order.price,
              leverage: order.leverage || 1,
              size: order.size,
              margin: order.size / (order.leverage || 1),
              liquidationPrice:
                order.positionType === "long"
                  ? order.price * (1 - 0.9 / (order.leverage || 1))
                  : order.price * (1 + 0.9 / (order.leverage || 1)),
              stopLoss: order.stopLoss,
              takeProfit: order.takeProfit,
              pnl: 0,
              pnlPercentage: 0,
              timestamp: Date.now(),
            }

            setPositions((positions) => [...positions, newPosition])

            // Add to trade history
            const newTrade: TradeHistory = {
              id: `trade-${Date.now()}-${order.id}`,
              type: order.positionType,
              price: order.price,
              size: order.size,
              fee: order.size * 0.0006, // 0.06% fee
              timestamp: Date.now(),
              action: "open",
              reason: "Limit Order Filled",
            }

            setTradeHistory((history) => [...history, newTrade])

            return { ...order, status: "filled", filledAt: Date.now() }
          }

          return order
        })

        return updatedOrders
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [selectedPair.id])

  // Load pair data when selected pair changes
  const loadPairData = (pairId: string) => {
    // Get the selected pair
    const pair = tradingPairs.find((p) => p.id === pairId)
    if (!pair) return

    // Generate new candle data for the pair
    const mockData = generateMockCandleData()

    // Adjust the price to match the selected pair's price
    const lastCandlePrice = mockData[mockData.length - 1].close
    const priceFactor = pair.price / lastCandlePrice

    const adjustedData = mockData.map((candle) => ({
      ...candle,
      open: candle.open * priceFactor,
      high: candle.high * priceFactor,
      low: candle.low * priceFactor,
      close: candle.close * priceFactor,
    }))

    setCandleData(adjustedData)
    setCurrentPrice(pair.price)

    // Optionally reset positions or orders if they are specific to a pair
    // setPositions([]);
    // setOrders([]);
  }

  // Handle trading pair change
  const handlePairChange = (pair: TradingPair) => {
    setSelectedPair(pair)
    setCurrentPrice(pair.price)
    loadPairData(pair.id)
  }

  // Check if any price alerts have been triggered
  const checkPriceAlerts = (price: number) => {
    priceAlerts.forEach((alert) => {
      if (!alert.isActive) return

      const isTriggered =
        (alert.condition === "above" && price >= alert.price) || (alert.condition === "below" && price <= alert.price)

      if (isTriggered) {
        // Show notification
        toast({
          title: "Price Alert Triggered",
          description: `${alert.pair} price is now ${alert.condition} $${alert.price.toFixed(2)}`,
        })

        // Deactivate the alert
        setPriceAlerts((alerts) => alerts.map((a) => (a.id === alert.id ? { ...a, isActive: false } : a)))
      }
    })
  }

  // Effect to handle position changes and show notifications
  useEffect(() => {
    // Check for closed positions (positions that were in the previous state but not in the current state)
    const prevPositionIds = new Set(positionsRef.current.map((p) => p.id))
    const currentPositionIds = new Set(positions.map((p) => p.id))

    // Find positions that were closed
    const closedPositions = positionsRef.current.filter((p) => !currentPositionIds.has(p.id))

    // Show notifications for closed positions
    closedPositions.forEach((position) => {
      toast({
        title: `Position Closed`,
        description: `Your ${position.type.toUpperCase()} position has been closed at $${currentPrice.toFixed(2)}`,
        variant: position.pnl >= 0 ? "default" : "destructive",
      })
    })

    // Find new positions (positions that are in the current state but weren't in the previous state)
    const newPositions = positions.filter((p) => !prevPositionIds.has(p.id))

    // Show notifications for new positions
    newPositions.forEach((position) => {
      toast({
        title: `Position Opened`,
        description: `Your ${position.type.toUpperCase()} position has been opened at $${position.entryPrice.toFixed(2)}`,
      })
    })

    // Update the ref
    positionsRef.current = positions
  }, [positions, currentPrice, toast])

  // Effect to handle order changes and show notifications
  useEffect(() => {
    // Check for filled or canceled orders
    const prevOpenOrderIds = new Set(ordersRef.current.filter((o) => o.status === "open").map((o) => o.id))
    const currentOpenOrderIds = new Set(orders.filter((o) => o.status === "open").map((o) => o.id))

    // Find orders that were filled or canceled
    const changedOrders = ordersRef.current.filter((o) => o.status === "open" && !currentOpenOrderIds.has(o.id))

    // Show notifications for changed orders
    changedOrders.forEach((order) => {
      const currentOrder = orders.find((o) => o.id === order.id)
      if (currentOrder?.status === "filled") {
        toast({
          title: "Limit Order Filled",
          description: `Your ${order.positionType.toUpperCase()} limit order at $${order.price.toFixed(2)} has been filled.`,
        })
      } else if (currentOrder?.status === "canceled") {
        toast({
          title: "Order Canceled",
          description: `Your ${order.positionType.toUpperCase()} limit order at $${order.price.toFixed(2)} has been canceled.`,
        })
      }
    })

    // Find new orders
    const newOrders = orders.filter((o) => !ordersRef.current.some((prevOrder) => prevOrder.id === o.id))

    // Show notifications for new orders
    newOrders.forEach((order) => {
      if (order.status === "open") {
        toast({
          title: "Limit Order Placed",
          description: `Your ${order.positionType.toUpperCase()} limit order at $${order.price.toFixed(2)} has been placed.`,
        })
      }
    })

    // Update the ref
    ordersRef.current = orders
  }, [orders, toast])

  const handleConnectWallet = async () => {
    try {
      if (walletIsConnected || (await connectWallet("sui"))) {
        setIsConnected(true)
        toast({
          title: "Wallet Connected",
          description: "Your wallet has been successfully connected.",
        })
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleTrade = (data: {
    type: PositionType
    orderType: OrderType
    amount: number
    leverage: number
    price?: number
    stopLoss?: number
    takeProfit?: number
    token: Token
  }) => {
    if (!isConnected) {
      handleConnectWallet()
      return
    }

    // Show trade confirmation modal
    setPendingTradeDetails({
      ...data,
      asset: selectedPair.baseAsset,
      quoteAsset: selectedPair.quoteAsset,
      price: data.price || currentPrice,
      liquidationPrice:
        data.type === "long"
          ? (data.price || currentPrice) * (1 - 0.9 / data.leverage)
          : (data.price || currentPrice) * (1 + 0.9 / data.leverage),
      fee: data.amount * 0.0006, // 0.06% fee
    })

    setTradeConfirmModalOpen(true)
  }

  // Process the trade after confirmation
  const processTrade = () => {
    if (!pendingTradeDetails) return

    const data = pendingTradeDetails

    if (data.orderType === "market") {
      // Create a market position
      const newPosition: Position = {
        id: `pos-${Date.now()}`,
        type: data.type,
        entryPrice: currentPrice,
        leverage: data.leverage,
        size: data.amount,
        margin: data.amount / data.leverage,
        liquidationPrice:
          data.type === "long" ? currentPrice * (1 - 0.9 / data.leverage) : currentPrice * (1 + 0.9 / data.leverage),
        stopLoss: data.stopLoss,
        takeProfit: data.takeProfit,
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
        action: "open",
        reason: "Market Order",
      }

      setTradeHistory((prev) => [...prev, newTrade])
    } else {
      // Create a limit order
      const newOrder: Order = {
        id: `order-${Date.now()}`,
        type: "limit",
        positionType: data.type,
        price: data.price || currentPrice,
        size: data.amount,
        leverage: data.leverage,
        stopLoss: data.stopLoss,
        takeProfit: data.takeProfit,
        filled: 0,
        status: "open",
        timestamp: Date.now(),
      }

      setOrders((prev) => [...prev, newOrder])
    }

    // Close the confirmation modal
    setTradeConfirmModalOpen(false)
    setPendingTradeDetails(null)
  }

  const handleClosePosition = (id: string) => {
    // Find the position
    const position = positions.find((p) => p.id === id)
    if (!position) return

    // Add to trade history
    const newTrade: TradeHistory = {
      id: `trade-${Date.now()}-${id}`,
      type: position.type === "long" ? "short" : "long", // Opposite to close
      price: currentPrice,
      size: position.size,
      fee: position.size * 0.0006, // 0.06% fee
      timestamp: Date.now(),
      action: "close",
      pnl: position.pnl,
      reason: "Manual Close",
    }

    setTradeHistory((prev) => [...prev, newTrade])

    // Remove the position
    setPositions((prev) => prev.filter((p) => p.id !== id))
  }

  const handleCancelOrder = (id: string) => {
    // Update the order status
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "canceled" } : o)))
  }

  const handleDeposit = (amount: number, token: Token) => {
    setBalances((prev) => ({
      ...prev,
      [token]: (prev[token] || 0) + amount,
    }))

    toast({
      title: "Deposit Successful",
      description: `Successfully deposited ${amount} ${token}`,
    })
  }

  const handleWithdraw = (amount: number, token: Token) => {
    if ((balances[token] || 0) >= amount) {
      setBalances((prev) => ({
        ...prev,
        [token]: (prev[token] || 0) - amount,
      }))

      toast({
        title: "Withdrawal Successful",
        description: `Successfully withdrew ${amount} ${token}`,
      })
    } else {
      toast({
        title: "Withdrawal Failed",
        description: `Insufficient ${token} balance`,
        variant: "destructive",
      })
    }
  }

  // Price alerts management
  const handleAddPriceAlert = (alertData: Omit<any, "id" | "createdAt" | "isActive">) => {
    const newAlert = {
      ...alertData,
      id: `alert-${Date.now()}`,
      createdAt: new Date(),
      isActive: true,
    }

    setPriceAlerts((prev) => [...prev, newAlert])

    toast({
      title: "Price Alert Created",
      description: `Alert will trigger when ${alertData.pair} goes ${alertData.condition} $${alertData.price.toFixed(2)}`,
    })
  }

  const handleDeleteAlert = (id: string) => {
    setPriceAlerts((alerts) => alerts.filter((a) => a.id !== id))
  }

  const handleToggleAlert = (id: string, isActive: boolean) => {
    setPriceAlerts((alerts) => alerts.map((alert) => (alert.id === id ? { ...alert, isActive } : alert)))
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 p-4 sticky top-0 z-50 bg-black">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Image src="/images/logo.png" alt="Nexus Trade Logo" width={40} height={40} className="h-8 w-auto" />
            </motion.div>
          </Link>

          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-2">
                <div className="hidden md:flex items-center space-x-2">
                  <div className="text-sm text-gray-400">
                    {wallet?.address
                      ? wallet.address.substring(0, 6) + "..." + wallet.address.substring(wallet.address.length - 4)
                      : "0x7a...3f4d"}
                  </div>
                  <div className="text-sm text-gray-400">|</div>
                  <div className="text-sm text-primary font-medium">
                    ${formatPrice(Object.values(balances).reduce((sum, balance) => sum + balance * currentPrice, 0))}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <motion.button
                    className="hidden md:flex items-center space-x-1 px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded-md text-sm"
                    onClick={() => setDepositModalOpen(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowDownToLine className="h-4 w-4" />
                    <span>Deposit</span>
                  </motion.button>

                  <motion.button
                    className="hidden md:flex items-center space-x-1 px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded-md text-sm"
                    onClick={() => setWithdrawModalOpen(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowUpFromLine className="h-4 w-4" />
                    <span>Withdraw</span>
                  </motion.button>

                  <motion.button
                    className="md:hidden px-2 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded-md"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </motion.button>
                </div>
              </div>
            ) : (
              <AnimatedButton
                className="px-4 py-2 bg-cta-blue text-dark hover:bg-primary rounded-md"
                onClick={handleConnectWallet}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Connect Wallet
              </AnimatedButton>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && isConnected && (
            <motion.div
              className="md:hidden absolute left-0 right-0 bg-gray-900 z-50 mt-4 p-4 border-t border-gray-800"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col space-y-3">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-400">
                    {wallet?.address
                      ? wallet.address.substring(0, 6) + "..." + wallet.address.substring(wallet.address.length - 4)
                      : "0x7a...3f4d"}
                  </div>
                  <div className="text-sm text-primary font-medium">
                    ${formatPrice(Object.values(balances).reduce((sum, balance) => sum + balance * currentPrice, 0))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    className="flex items-center justify-center space-x-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md text-sm"
                    onClick={() => {
                      setDepositModalOpen(true)
                      setMobileMenuOpen(false)
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowDownToLine className="h-4 w-4 mr-1" />
                    <span>Deposit</span>
                  </motion.button>

                  <motion.button
                    className="flex items-center justify-center space-x-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md text-sm"
                    onClick={() => {
                      setWithdrawModalOpen(true)
                      setMobileMenuOpen(false)
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowUpFromLine className="h-4 w-4 mr-1" />
                    <span>Withdraw</span>
                  </motion.button>

                  <motion.button
                    className="flex items-center justify-center space-x-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md text-sm col-span-2"
                    onClick={() => {
                      setAlertModalOpen(true)
                      setMobileMenuOpen(false)
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Bell className="h-4 w-4 mr-1" />
                    <span>Price Alerts</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Trading View Style Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-2">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Trading Pair Selector */}
          <TradingPairSelector
            pairs={tradingPairs}
            selectedPair={selectedPair}
            onSelectPair={handlePairChange}
            className="w-40 sm:w-48"
          />

          <div className="flex items-center space-x-2 flex-grow md:flex-grow-0 justify-end md:justify-start">
            <div className={`text-xl font-bold ${selectedPair.change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
              ${currentPrice.toFixed(2)}
            </div>
            <div className={`text-sm ${selectedPair.change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
              ({selectedPair.change24h >= 0 ? "+" : ""}
              {selectedPair.change24h.toFixed(2)}%)
            </div>
          </div>

          <div className="flex items-center space-x-2 order-last md:order-none w-full md:w-auto">
            {/* Timeframe selector */}
            <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
              {["1m", "5m", "15m", "1h", "4h", "1d"].map((tf) => (
                <button
                  key={tf}
                  className={`px-2 py-1 text-xs rounded whitespace-nowrap ${
                    timeframe === tf ? "bg-primary text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                  onClick={() => setTimeframe(tf)}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Chart type and price alert buttons */}
          <div className="flex items-center space-x-1">
            <button
              className="p-1 rounded hover:bg-gray-800 flex items-center space-x-1 text-xs text-gray-300"
              onClick={() => setShowPerformance(!showPerformance)}
            >
              <BarChart2 className="h-4 w-4 text-gray-400" />
              <span className="hidden sm:inline">Metrics</span>
            </button>

            <button
              className="p-1 rounded hover:bg-gray-800 flex items-center space-x-1 text-xs text-gray-300"
              onClick={() => setAlertModalOpen(true)}
            >
              <Bell className="h-4 w-4 text-gray-400" />
              <span className="hidden sm:inline">Alerts</span>
              {priceAlerts.some((a) => a.isActive) && (
                <span className="inline-block w-2 h-2 bg-primary rounded-full"></span>
              )}
            </button>

            <button className="p-1 rounded hover:bg-gray-800">
              <Settings className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Performance Metrics Panel (Collapsible) */}
      <AnimatePresence>
        {showPerformance && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container mx-auto p-4">
              <PerformanceMetrics tradeHistory={tradeHistory} className="border border-gray-800 rounded-lg" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Chart and Order Book */}
          <div className="lg:col-span-3 space-y-6">
            {/* Chart/Order Book Tabs */}
            <Tabs defaultValue="chart" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="chart" className="flex-1">
                  Chart
                </TabsTrigger>
                <TabsTrigger value="orderbook" className="flex-1">
                  Order Book
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chart" className="mt-4">
                {candleData.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full overflow-hidden"
                  >
                    <SimpleCandlestickChart
                      data={candleData}
                      height={500}
                      className="rounded-lg overflow-hidden border border-gray-800"
                    />
                  </motion.div>
                )}
              </TabsContent>

              <TabsContent value="orderbook" className="mt-4">
                <OrderBook className="border border-gray-800 rounded-lg" />
              </TabsContent>
            </Tabs>

            {/* Positions/Orders/History Tabs */}
            <Tabs defaultValue="positions" value={activePositionsTab} onValueChange={setActivePositionsTab}>
              <TabsList className="w-full">
                <TabsTrigger value="positions" className="flex-1">
                  Positions {positions.length > 0 && `(${positions.length})`}
                </TabsTrigger>
                <TabsTrigger value="orders" className="flex-1">
                  Open Orders{" "}
                  {orders.filter((o) => o.status === "open").length > 0 &&
                    `(${orders.filter((o) => o.status === "open").length})`}
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1">
                  History {tradeHistory.length > 0 && `(${tradeHistory.length})`}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="positions" className="mt-4">
                <PositionsTable
                  positions={positions}
                  onClosePosition={handleClosePosition}
                  currentPrice={currentPrice}
                  className="border border-gray-800 rounded-lg"
                />
              </TabsContent>

              <TabsContent value="orders" className="mt-4">
                {orders.filter((o) => o.status === "open").length > 0 ? (
                  <OrdersTable
                    orders={orders.filter((o) => o.status === "open")}
                    onCancelOrder={handleCancelOrder}
                    className="border border-gray-800 rounded-lg"
                  />
                ) : (
                  <div className="border border-gray-800 rounded-lg p-8 text-center text-gray-500">No open orders</div>
                )}
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                {tradeHistory.length > 0 ? (
                  <TradeHistoryTable history={tradeHistory} className="border border-gray-800 rounded-lg" />
                ) : (
                  <div className="border border-gray-800 rounded-lg p-8 text-center text-gray-500">
                    No trade history
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Trade Form */}
          <div className="lg:col-span-1">
            <TradeForm
              currentPrice={currentPrice}
              onTrade={handleTrade}
              className="border border-gray-800 rounded-lg"
              isConnected={isConnected}
              tradingPair={{
                baseAsset: selectedPair.baseAsset,
                quoteAsset: selectedPair.quoteAsset,
              }}
            />
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      <DepositModal open={depositModalOpen} onOpenChange={setDepositModalOpen} onDeposit={handleDeposit} />

      {/* Withdraw Modal */}
      <WithdrawModal
        open={withdrawModalOpen}
        onOpenChange={setWithdrawModalOpen}
        onWithdraw={handleWithdraw}
        balances={balances}
      />

      {/* Price Alert Modal */}
      <PriceAlertModal
        open={alertModalOpen}
        onOpenChange={setAlertModalOpen}
        onAddAlert={handleAddPriceAlert}
        onDeleteAlert={handleDeleteAlert}
        onToggleAlert={handleToggleAlert}
        currentPair={`${selectedPair.baseAsset}/${selectedPair.quoteAsset}`}
        currentPrice={currentPrice}
        alerts={priceAlerts}
      />

      {/* Trade Confirmation Modal */}
      {pendingTradeDetails && (
        <TradeConfirmationModal
          open={tradeConfirmModalOpen}
          onOpenChange={setTradeConfirmModalOpen}
          onConfirm={processTrade}
          tradeDetails={pendingTradeDetails}
        />
      )}
    </main>
  )
}
