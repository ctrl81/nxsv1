"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { TradeHistory } from "@/lib/types"

interface PerformanceMetricsProps {
  tradeHistory: TradeHistory[]
  className?: string
}

export function PerformanceMetrics({ tradeHistory, className = "" }: PerformanceMetricsProps) {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y" | "all">("30d")

  // Removed the incomplete useState declaration that was causing the error

  // Calculate metrics based on trade history and time range
  const metrics = useMemo(() => {
    // Filter trades based on selected time range
    const now = Date.now()
    const msInDay = 24 * 60 * 60 * 1000

    let filteredTrades = tradeHistory

    if (timeRange === "7d") {
      filteredTrades = tradeHistory.filter((trade) => now - trade.timestamp <= 7 * msInDay)
    } else if (timeRange === "30d") {
      filteredTrades = tradeHistory.filter((trade) => now - trade.timestamp <= 30 * msInDay)
    } else if (timeRange === "90d") {
      filteredTrades = tradeHistory.filter((trade) => now - trade.timestamp <= 90 * msInDay)
    } else if (timeRange === "1y") {
      filteredTrades = tradeHistory.filter((trade) => now - trade.timestamp <= 365 * msInDay)
    }

    // Calculate total PnL
    const totalPnL = filteredTrades
      .filter((trade) => trade.action === "close" && trade.pnl !== undefined)
      .reduce((sum, trade) => sum + (trade.pnl || 0), 0)

    // Calculate win rate
    const winningTrades = filteredTrades.filter((trade) => trade.action === "close" && (trade.pnl || 0) > 0)
    const losingTrades = filteredTrades.filter((trade) => trade.action === "close" && (trade.pnl || 0) < 0)
    const winRate =
      winningTrades.length + losingTrades.length > 0
        ? (winningTrades.length / (winningTrades.length + losingTrades.length)) * 100
        : 0

    // Calculate average profit and loss
    const avgProfit =
      winningTrades.length > 0
        ? winningTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0) / winningTrades.length
        : 0
    const avgLoss =
      losingTrades.length > 0
        ? Math.abs(losingTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0) / losingTrades.length)
        : 0

    // Calculate profit factor
    const profitFactor = avgLoss > 0 ? avgProfit / avgLoss : avgProfit > 0 ? Number.POSITIVE_INFINITY : 0

    // Prepare chart data - daily PnL
    const chartData = []
    if (filteredTrades.length > 0) {
      // Group trades by day
      const tradesByDay = filteredTrades
        .filter((trade) => trade.action === "close" && trade.pnl !== undefined)
        .reduce(
          (acc, trade) => {
            const date = new Date(trade.timestamp).toLocaleDateString()
            if (!acc[date]) acc[date] = 0
            acc[date] += trade.pnl || 0
            return acc
          },
          {} as Record<string, number>,
        )

      // Convert to chart data format
      Object.entries(tradesByDay).forEach(([date, pnl]) => {
        chartData.push({ date, pnl })
      })

      // Sort by date
      chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }

    return {
      totalPnL,
      winRate,
      avgProfit,
      avgLoss,
      profitFactor,
      totalTrades: filteredTrades.filter((trade) => trade.action === "close").length,
      chartData,
    }
  }, [tradeHistory, timeRange])

  return (
    <div className={`bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">Performance Metrics</h2>
          <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
            <TabsList className="bg-gray-800">
              <TabsTrigger value="7d" className="text-xs">
                7D
              </TabsTrigger>
              <TabsTrigger value="30d" className="text-xs">
                30D
              </TabsTrigger>
              <TabsTrigger value="90d" className="text-xs">
                90D
              </TabsTrigger>
              <TabsTrigger value="1y" className="text-xs">
                1Y
              </TabsTrigger>
              <TabsTrigger value="all" className="text-xs">
                All
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-sm text-gray-400">Total P&L</div>
            <div className={`text-xl font-bold ${metrics.totalPnL >= 0 ? "text-green-500" : "text-red-500"}`}>
              ${metrics.totalPnL.toFixed(2)}
            </div>
          </div>

          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-sm text-gray-400">Win Rate</div>
            <div className="text-xl font-bold text-white">{metrics.winRate.toFixed(1)}%</div>
          </div>

          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-sm text-gray-400">Total Trades</div>
            <div className="text-xl font-bold text-white">{metrics.totalTrades}</div>
          </div>

          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-sm text-gray-400">Avg. Profit</div>
            <div className="text-xl font-bold text-green-500">${metrics.avgProfit.toFixed(2)}</div>
          </div>

          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-sm text-gray-400">Avg. Loss</div>
            <div className="text-xl font-bold text-red-500">${metrics.avgLoss.toFixed(2)}</div>
          </div>

          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-sm text-gray-400">Profit Factor</div>
            <div className="text-xl font-bold text-white">
              {metrics.profitFactor === Number.POSITIVE_INFINITY ? "∞" : metrics.profitFactor.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-2">P&L Chart</h3>
        <div className="h-64">
          {metrics.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="date"
                  stroke="#666"
                  tick={{ fill: "#999", fontSize: 10 }}
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return `${date.getMonth() + 1}/${date.getDate()}`
                  }}
                />
                <YAxis stroke="#666" tick={{ fill: "#999", fontSize: 10 }} tickFormatter={(value) => `$${value}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "#fff" }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "P&L"]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="pnl"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#3b82f6" }}
                  activeDot={{ r: 5, fill: "#3b82f6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <motion.div
              className="h-full flex items-center justify-center text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              No trade data available for the selected period
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
