"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Slider } from "@/components/ui/slider"
import { AnimatedButton } from "@/components/animations/animated-button"
import type { OrderType, PositionType, Token } from "@/lib/types"

interface TradeFormProps {
  currentPrice: number
  onTrade?: (data: {
    type: PositionType
    orderType: OrderType
    amount: number
    leverage: number
    price?: number
    token: Token
  }) => void
  className?: string
  isConnected?: boolean
}

export function TradeForm({ currentPrice, onTrade, className = "", isConnected = false }: TradeFormProps) {
  const [positionType, setPositionType] = useState<PositionType>("long")
  const [orderType, setOrderType] = useState<OrderType>("market")
  const [amount, setAmount] = useState<number>(0)
  const [leverage, setLeverage] = useState<number>(3)
  const [selectedToken, setSelectedToken] = useState<Token>("WBTC")

  const handleSubmit = () => {
    if (onTrade) {
      onTrade({
        type: positionType,
        orderType,
        amount,
        leverage,
        price: orderType === "limit" ? currentPrice : undefined,
        token: selectedToken,
      })
    }
  }

  return (
    <motion.div
      className={`bg-black rounded-lg p-4 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Position Type Selection */}
      <div className="flex space-x-2 mb-4">
        <button
          className={`flex-1 py-2 px-4 rounded-md text-white font-medium transition-colors ${
            positionType === "long" ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-800 hover:bg-gray-700"
          }`}
          onClick={() => setPositionType("long")}
        >
          Long <span className="ml-1">↗</span>
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-md text-white font-medium transition-colors ${
            positionType === "short" ? "bg-red-600 hover:bg-red-700" : "bg-gray-800 hover:bg-gray-700"
          }`}
          onClick={() => setPositionType("short")}
        >
          Short <span className="ml-1">↘</span>
        </button>
      </div>

      {/* Order Type Selection */}
      <div className="flex space-x-2 mb-4">
        <button
          className={`flex-1 py-2 px-4 rounded-md text-white font-medium transition-colors ${
            orderType === "market" ? "bg-blue-900 hover:bg-blue-800" : "bg-gray-800 hover:bg-gray-700"
          }`}
          onClick={() => setOrderType("market")}
        >
          Market
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-md text-white font-medium transition-colors ${
            orderType === "limit" ? "bg-blue-900 hover:bg-blue-800" : "bg-gray-800 hover:bg-gray-700"
          }`}
          onClick={() => setOrderType("limit")}
        >
          Limit
        </button>

        {/* Current Price Display */}
        <div className="flex-1 py-2 px-4 rounded-md bg-gray-900 text-white font-medium text-right">
          ${currentPrice.toFixed(2)}
        </div>
      </div>

      {/* Amount Input */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-400 mb-1">
          <span>Amount to be paid</span>
          <span>
            {amount.toFixed(2)} {selectedToken}
          </span>
        </div>

        <div className="flex space-x-2 mb-2">
          <div className="flex-1 flex space-x-1">
            {(["WBTC", "ETH", "SUI"] as Token[]).map((token) => (
              <button
                key={token}
                className={`flex-1 py-2 px-2 text-sm rounded-md transition-colors ${
                  selectedToken === token ? "bg-gray-700 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
                onClick={() => setSelectedToken(token)}
              >
                {token}
              </button>
            ))}
          </div>

          <div className="w-24 py-2 px-4 rounded-md bg-gray-900 text-white font-medium text-right">
            {amount.toFixed(2)}
            <button
              className="text-xs text-primary font-medium block ml-auto"
              onClick={() => setAmount(100)} // Set to max amount
            >
              MAX
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="0"
            max="100"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(Number.parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Leverage Slider */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-1">
          <span>Leverage</span>
          <span>{leverage}x</span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-white font-medium">1x</div>
          <Slider
            value={[leverage]}
            min={1}
            max={10}
            step={0.1}
            onValueChange={(value) => setLeverage(value[0])}
            className="flex-1"
          />
          <div className="text-white font-medium">10x</div>

          <div className="flex space-x-2">
            <button
              className="py-1 px-3 rounded-md bg-gray-800 text-white text-sm hover:bg-gray-700"
              onClick={() => setLeverage(Math.max(1, leverage - 1))}
            >
              -
            </button>
            <button
              className="py-1 px-3 rounded-md bg-gray-800 text-white text-sm hover:bg-gray-700"
              onClick={() => setLeverage(Math.min(10, leverage + 1))}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Trade Button */}
      <AnimatedButton
        className={`w-full py-3 font-medium ${
          positionType === "long"
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "bg-red-600 hover:bg-red-700 text-white"
        }`}
        onClick={handleSubmit}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isConnected ? (positionType === "long" ? "Open Long Position" : "Open Short Position") : "Connect Wallet"}
      </AnimatedButton>

      {/* Trade Information */}
      <div className="mt-6 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Entry Price</span>
          <span className="text-white">{isConnected ? `$${currentPrice.toFixed(2)}` : "-"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Liquidation Price</span>
          <span className="text-white">
            {isConnected
              ? `$${(
                  positionType === "long" ? currentPrice * (1 - 0.9 / leverage) : currentPrice * (1 + 0.9 / leverage)
                ).toFixed(2)}`
              : "-"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Open Fee(0.06%)</span>
          <span className="text-white">{isConnected ? `$${(amount * 0.0006).toFixed(2)}` : "-"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Price Impact</span>
          <span className="text-white">{isConnected ? "~0.01%" : "-"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Borrow Fees Due</span>
          <span className="text-white">{isConnected ? `$${(amount * 0.0001 * leverage).toFixed(4)}/hr` : "-"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Transaction Fee</span>
          <span className="text-white">{isConnected ? "~0.0001 SUI" : "-"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Account Rent</span>
          <span className="text-white">{isConnected ? "0.01 SUI/day" : "-"}</span>
        </div>
      </div>
    </motion.div>
  )
}
