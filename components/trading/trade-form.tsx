"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { AnimatedButton } from "@/components/animations/animated-button"
import { PriceEditor } from "@/components/trading/price-editor"
import type { OrderType, PositionType, Token } from "@/lib/types"
import { AlertTriangle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useWallet } from "@/contexts/wallet-context"

interface TradeFormProps {
  currentPrice: number
  onTrade?: (data: {
    type: PositionType
    orderType: OrderType
    amount: number
    leverage: number
    price?: number
    stopLoss?: number
    takeProfit?: number
    token: Token
  }) => void
  className?: string
  isConnected?: boolean
  tradingPair?: {
    baseAsset: string
    quoteAsset: string
  }
}

export function TradeForm({
  currentPrice,
  onTrade,
  className = "",
  isConnected = false,
  tradingPair = { baseAsset: "SUI", quoteAsset: "USDC" },
}: TradeFormProps) {
  // Get toast
  const { toast } = useToast()

  // Get wallet context
  const { wallet, connectWallet } = useWallet()

  const [positionType, setPositionType] = useState<PositionType>("long")
  const [orderType, setOrderType] = useState<OrderType>("market")
  const [amount, setAmount] = useState<number>(100)
  const [leverage, setLeverage] = useState<number>(3)
  const [selectedToken, setSelectedToken] = useState<Token>("USDC")
  const [stopLoss, setStopLoss] = useState<string>("")
  const [takeProfit, setTakeProfit] = useState<string>("")
  const [showAdvanced, setShowAdvanced] = useState<boolean>(true)
  const [limitPrice, setLimitPrice] = useState<number>(currentPrice)

  // Min and max amount for the slider
  const minAmount = 10
  const maxAmount = 2000

  // Predefined amount options
  const amountOptions = [50, 100, 250, 500, 1000]

  // Sui blockchain tokens - filter to show only quote assets
  const quoteTokens: Token[] = ["USDC", "USDT", "SUI"]

  // Set initial limit price when current price changes
  useEffect(() => {
    if (orderType === "market") {
      setLimitPrice(currentPrice)
    }
  }, [currentPrice, orderType])

  // Set initial stop loss and take profit values on position type change only
  useEffect(() => {
    if (positionType === "long") {
      // For long positions: stop loss below entry, take profit above entry
      setStopLoss((currentPrice * 0.95).toFixed(2)) // 5% below entry price
      setTakeProfit((currentPrice * 1.1).toFixed(2)) // 10% above entry price
    } else {
      // For short positions: stop loss above entry, take profit below entry
      setStopLoss((currentPrice * 1.05).toFixed(2)) // 5% above entry price
      setTakeProfit((currentPrice * 0.9).toFixed(2)) // 10% below entry price
    }
  }, [positionType, currentPrice]) // Include currentPrice to update when price changes

  const handleSubmit = async () => {
    if (!validateForm()) return

    // If not connected, connect wallet first
    if (!isConnected && !wallet?.connected) {
      try {
        const connected = await connectWallet("sui")
        if (!connected) {
          toast({
            title: "Wallet Connection Required",
            description: "Please connect your wallet to trade",
            variant: "destructive",
          })
          return
        }
      } catch (error) {
        console.error("Failed to connect wallet:", error)
        toast({
          title: "Connection Failed",
          description: "Failed to connect wallet. Please try again.",
          variant: "destructive",
        })
        return
      }
    }

    if (onTrade) {
      onTrade({
        type: positionType,
        orderType,
        amount,
        leverage,
        price: orderType === "limit" ? limitPrice : undefined,
        stopLoss: stopLoss ? Number.parseFloat(stopLoss) : undefined,
        takeProfit: takeProfit ? Number.parseFloat(takeProfit) : undefined,
        token: selectedToken,
      })
    }
  }

  const validateForm = () => {
    // Basic validation
    if (!isStopLossValid) {
      toast({
        title: "Invalid Stop Loss",
        description: `Stop loss must be between ${stopLossConstraints.min.toFixed(2)} and ${stopLossConstraints.max.toFixed(2)}`,
        variant: "destructive",
      })
      return false
    }

    if (!isTakeProfitValid) {
      toast({
        title: "Invalid Take Profit",
        description: `Take profit must be between ${takeProfitConstraints.min.toFixed(2)} and ${takeProfitConstraints.max.toFixed(2)}`,
        variant: "destructive",
      })
      return false
    }

    return true
  }

  // Calculate liquidation price
  const liquidationPrice =
    positionType === "long"
      ? (orderType === "limit" ? limitPrice : currentPrice) * (1 - 0.9 / leverage)
      : (orderType === "limit" ? limitPrice : currentPrice) * (1 + 0.9 / leverage)

  // Calculate min/max values for stop loss and take profit
  const getStopLossConstraints = () => {
    const entryPrice = orderType === "limit" ? limitPrice : currentPrice

    if (positionType === "long") {
      // For long positions, stop loss must be below entry price but above liquidation price
      return {
        min: liquidationPrice * 1.05, // 5% above liquidation price for safety
        max: entryPrice * 0.99, // Just below entry price
      }
    } else {
      // For short positions, stop loss must be above entry price
      return {
        min: entryPrice * 1.01, // Just above entry price
        max: entryPrice * 1.2, // 20% above entry price as max
      }
    }
  }

  const getTakeProfitConstraints = () => {
    const entryPrice = orderType === "limit" ? limitPrice : currentPrice

    if (positionType === "long") {
      // For long positions, take profit must be above entry price
      return {
        min: entryPrice * 1.01, // Just above entry price
        max: entryPrice * 2, // 100% above entry price as max
      }
    } else {
      // For short positions, take profit must be below entry price
      return {
        min: entryPrice * 0.5, // 50% below entry price as min
        max: entryPrice * 0.99, // Just below entry price
      }
    }
  }

  const stopLossConstraints = getStopLossConstraints()
  const takeProfitConstraints = getTakeProfitConstraints()

  // Validate stop loss based on position type and constraints
  const validateStopLoss = (value: string) => {
    const numValue = Number.parseFloat(value)
    if (isNaN(numValue)) return false

    const { min, max } = stopLossConstraints
    return numValue >= min && numValue <= max
  }

  // Validate take profit based on position type and constraints
  const validateTakeProfit = (value: string) => {
    const numValue = Number.parseFloat(value)
    if (isNaN(numValue)) return false

    const { min, max } = takeProfitConstraints
    return numValue >= min && numValue <= max
  }

  // Handle stop loss input change with validation
  const handleStopLossChange = (value: string) => {
    setStopLoss(value)
  }

  // Handle take profit input change with validation
  const handleTakeProfitChange = (value: string) => {
    setTakeProfit(value)
  }

  // Handle limit price change
  const handleLimitPriceChange = (newPrice: number) => {
    setLimitPrice(newPrice)
  }

  // Handle amount slider change
  const handleAmountChange = (value: number[]) => {
    setAmount(value[0])
  }

  // Handle amount input change
  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value)
    if (!isNaN(value)) {
      setAmount(Math.min(Math.max(value, minAmount), maxAmount))
    }
  }

  // Check if stop loss is valid
  const isStopLossValid = validateStopLoss(stopLoss)

  // Check if take profit is valid
  const isTakeProfitValid = validateTakeProfit(takeProfit)

  return (
    <motion.div
      className={`bg-black rounded-lg p-4 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Trading Pair Display */}
      <div className="mb-4 flex justify-between items-center">
        <div className="text-lg font-bold text-white">
          {tradingPair.baseAsset}/{tradingPair.quoteAsset}
        </div>
        <div className="text-sm text-gray-400">Mark: ${currentPrice.toFixed(2)}</div>
      </div>

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

      {/* Limit Price Editor (only visible for limit orders) */}
      {orderType === "limit" && (
        <div className="mb-4">
          <PriceEditor
            initialPrice={limitPrice}
            onChange={handleLimitPriceChange}
            precision={2}
            step={0.01}
            label="Limit Price"
            className="mb-2"
          />
        </div>
      )}

      {/* Amount Selection - Now with slider instead of percentage buttons */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-1">
          <span>Amount to be paid</span>
          <span>
            {amount.toFixed(2)} {selectedToken}
          </span>
        </div>

        <div className="flex space-x-2 mb-4">
          <div className="flex-1 flex space-x-1">
            {quoteTokens.map((token) => (
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

          <Input
            type="number"
            value={amount.toFixed(2)}
            onChange={handleAmountInputChange}
            className="w-24 py-2 px-4 rounded-md bg-gray-900 text-white font-medium text-right"
            min={minAmount}
            max={maxAmount}
            step="10"
          />
        </div>

        {/* Amount slider */}
        <div className="mb-4">
          <div className="flex items-center space-x-4">
            <div className="text-white font-medium text-xs">{minAmount}</div>
            <Slider
              value={[amount]}
              min={minAmount}
              max={maxAmount}
              step={10}
              onValueChange={handleAmountChange}
              className="flex-1"
            />
            <div className="text-white font-medium text-xs">{maxAmount}</div>
          </div>
        </div>

        {/* Amount preset buttons */}
        <div className="grid grid-cols-5 gap-2">
          {amountOptions.map((option) => (
            <button
              key={option}
              className={`py-1 px-2 text-xs rounded-md transition-colors ${
                amount === option ? "bg-primary text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
              onClick={() => setAmount(option)}
            >
              {option}
            </button>
          ))}
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

      {/* Advanced Options - Now always visible */}
      <div className="mb-6 space-y-4 bg-gray-900/30 p-3 rounded-md">
        {/* Stop Loss */}
        <div>
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Stop Loss (USD)</span>
            <span className={!isStopLossValid ? "text-red-500" : ""}>
              {positionType === "long" ? "Below Entry" : "Above Entry"}
            </span>
          </div>
          <div className="flex space-x-2">
            <Input
              type="number"
              value={stopLoss}
              onChange={(e) => handleStopLossChange(e.target.value)}
              className={`bg-gray-900 border-gray-800 text-white flex-1 ${!isStopLossValid ? "border-red-500" : ""}`}
              placeholder={`Stop Loss Price`}
              step="0.01"
            />
            <div className="text-xs text-gray-400 flex flex-col justify-center">
              <div>Min: ${stopLossConstraints.min.toFixed(2)}</div>
              <div>Max: ${stopLossConstraints.max.toFixed(2)}</div>
            </div>
          </div>
          {!isStopLossValid && (
            <p className="text-red-500 text-xs mt-1">
              Stop loss must be between ${stopLossConstraints.min.toFixed(2)} and ${stopLossConstraints.max.toFixed(2)}
            </p>
          )}
        </div>

        {/* Take Profit */}
        <div>
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Take Profit (USD)</span>
            <span className={!isTakeProfitValid ? "text-red-500" : ""}>
              {positionType === "long" ? "Above Entry" : "Below Entry"}
            </span>
          </div>
          <div className="flex space-x-2">
            <Input
              type="number"
              value={takeProfit}
              onChange={(e) => handleTakeProfitChange(e.target.value)}
              className={`bg-gray-900 border-gray-800 text-white flex-1 ${!isTakeProfitValid ? "border-red-500" : ""}`}
              placeholder={`Take Profit Price`}
              step="0.01"
            />
            <div className="text-xs text-gray-400 flex flex-col justify-center">
              <div>Min: ${takeProfitConstraints.min.toFixed(2)}</div>
              <div>Max: ${takeProfitConstraints.max.toFixed(2)}</div>
            </div>
          </div>
          {!isTakeProfitValid && (
            <p className="text-red-500 text-xs mt-1">
              Take profit must be between ${takeProfitConstraints.min.toFixed(2)} and $
              {takeProfitConstraints.max.toFixed(2)}
            </p>
          )}
        </div>

        {/* Risk Assessment Indicator */}
        <div className="mt-3 p-2 bg-gray-800/50 rounded-md">
          <div className="flex items-center space-x-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium text-yellow-500">Risk Assessment</span>
          </div>
          <div className="text-xs text-gray-300">
            Position size:{" "}
            <span className={amount > 500 ? "text-red-400" : "text-green-400"}>
              {amount > 500 ? "High" : "Moderate"}
            </span>{" "}
            • Leverage:{" "}
            <span className={leverage > 5 ? "text-red-400" : "text-green-400"}>
              {leverage > 5 ? "High" : "Moderate"}
            </span>{" "}
            • Liquidation risk:{" "}
            <span className={leverage > 7 ? "text-red-400" : leverage > 3 ? "text-yellow-400" : "text-green-400"}>
              {leverage > 7 ? "High" : leverage > 3 ? "Medium" : "Low"}
            </span>
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
        disabled={!isStopLossValid || !isTakeProfitValid}
      >
        {isConnected || wallet?.connected
          ? orderType === "market"
            ? positionType === "long"
              ? "Open Long Position"
              : "Open Short Position"
            : positionType === "long"
              ? "Place Long Limit Order"
              : "Place Short Limit Order"
          : "Connect Wallet"}
      </AnimatedButton>

      {/* Trade Information */}
      <div className="mt-6 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Entry Price</span>
          <span className="text-white">${orderType === "limit" ? limitPrice.toFixed(2) : currentPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Liquidation Price</span>
          <span className="text-white">${liquidationPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Stop Loss</span>
          <span className="text-white">{stopLoss ? `$${Number.parseFloat(stopLoss).toFixed(2)}` : "-"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Take Profit</span>
          <span className="text-white">{takeProfit ? `$${Number.parseFloat(takeProfit).toFixed(2)}` : "-"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Open Fee(0.06%)</span>
          <span className="text-white">${(amount * 0.0006).toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Price Impact</span>
          <span className="text-white">~0.01%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Borrow Fees Due</span>
          <span className="text-white">${(amount * 0.0001 * leverage).toFixed(4)}/hr</span>
        </div>
      </div>
    </motion.div>
  )
}
