"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { SimpleCandlestickChart } from "@/components/trading/simple-candlestick-chart"
import { OrderBook } from "@/components/trading/order-book"
import { TradeForm } from "@/components/trading/trade-form"
import { PositionsTable } from "@/components/trading/positions-table"
import { DepositModal } from "@/components/trading/deposit-modal"
import { WithdrawModal } from "@/components/trading/withdraw-modal"
import { generateMockCandleData } from "@/lib/mock-data"
import { AnimatedButton } from "@/components/animations/animated-button"
import { ArrowDownToLine, ArrowUpFromLine, Menu, X } from "lucide-react"
import type { CandleData, Position, Token } from "@/lib/types"
import { formatPrice } from "@/lib/utils"

export default function TradingPage() {
  const [activeTab, setActiveTab] = useState("chart")
  const [activePositionsTab, setActivePositionsTab] = useState("positions")
  const [candleData, setCandleData] = useState<CandleData[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [currentPrice, setCurrentPrice] = useState(150.99)
  const [isConnected, setIsConnected] = useState(false)
  const [depositModalOpen, setDepositModalOpen] = useState(false)
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [balances, setBalances] = useState<Record<Token, number>>({
    WBTC: 0.25,
    ETH: 1.5,
    SUI: 500,
  })

  // Initialize with mock data
  useEffect(() => {
    const mockData = generateMockCandleData()
    setCandleData(mockData)

    if (mockData.length > 0) {
      setCurrentPrice(mockData[mockData.length - 1].close)
    }

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
        setCurrentPrice(close)

        return [...prev.slice(1), newCandle]
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleConnectWallet = () => {
    setIsConnected(true)
  }

  const handleTrade = (data: any) => {
    if (!isConnected) {
      setIsConnected(true)
      return
    }

    // Create a mock position
    const newPosition: Position = {
      id: `pos-${Date.now()}`,
      type: data.type,
      entryPrice: currentPrice,
      leverage: data.leverage,
      size: data.amount || 100, // Default value if amount is 0
      margin: (data.amount || 100) / data.leverage,
      liquidationPrice:
        data.type === "long" ? currentPrice * (1 - 0.9 / data.leverage) : currentPrice * (1 + 0.9 / data.leverage),
      pnl: 0,
      pnlPercentage: 0,
      timestamp: Date.now(),
    }

    setPositions((prev) => [...prev, newPosition])
  }

  const handleClosePosition = (id: string) => {
    setPositions((prev) => prev.filter((p) => p.id !== id))
  }

  const handleDeposit = (amount: number, token: Token) => {
    setBalances((prev) => ({
      ...prev,
      [token]: (prev[token] || 0) + amount,
    }))

    // Show success notification or feedback
    alert(`Successfully deposited ${amount} ${token}`)
  }

  const handleWithdraw = (amount: number, token: Token) => {
    if ((balances[token] || 0) >= amount) {
      setBalances((prev) => ({
        ...prev,
        [token]: (prev[token] || 0) - amount,
      }))

      // Show success notification or feedback
      alert(`Successfully withdrew ${amount} ${token}`)
    } else {
      // Show error notification
      alert(`Insufficient ${token} balance`)
    }
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
                  <div className="text-sm text-gray-400">0x7a...3f4d</div>
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
                  <div className="text-sm text-gray-400">0x7a...3f4d</div>
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
                </div>

                <motion.button
                  className="flex items-center justify-center space-x-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md text-sm"
                  onClick={() => {
                    setIsConnected(false)
                    setMobileMenuOpen(false)
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Disconnect</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Chart and Order Book */}
          <div className="lg:col-span-2 space-y-6">
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
                  Positions
                </TabsTrigger>
                <TabsTrigger value="orders" className="flex-1">
                  Open Orders
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1">
                  History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="positions" className="mt-4">
                <PositionsTable
                  positions={positions}
                  onClosePosition={handleClosePosition}
                  className="border border-gray-800 rounded-lg"
                />
              </TabsContent>

              <TabsContent value="orders" className="mt-4">
                <div className="border border-gray-800 rounded-lg p-8 text-center text-gray-500">No open orders</div>
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                <div className="border border-gray-800 rounded-lg p-8 text-center text-gray-500">No trade history</div>
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
    </main>
  )
}
