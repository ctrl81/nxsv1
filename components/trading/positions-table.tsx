"use client"
import { motion } from "framer-motion"
import type { Position } from "@/lib/types"
import { formatPrice, formatPercentage } from "@/lib/utils"

interface PositionsTableProps {
  positions: Position[]
  onClosePosition?: (id: string) => void
  currentPrice: number
  className?: string
}

export function PositionsTable({ positions, onClosePosition, currentPrice, className = "" }: PositionsTableProps) {
  return (
    <motion.div
      className={`bg-black rounded-lg overflow-hidden ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {positions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-800">
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-right">Size</th>
                <th className="px-4 py-2 text-right">Entry Price</th>
                <th className="px-4 py-2 text-right">Mark Price</th>
                <th className="px-4 py-2 text-right">SL/TP</th>
                <th className="px-4 py-2 text-right">Liq. Price</th>
                <th className="px-4 py-2 text-right">PnL</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((position) => {
                // Calculate real-time PnL based on current price
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

                return (
                  <motion.tr
                    key={position.id}
                    className={`border-b border-gray-800 hover:bg-gray-900 ${
                      isStopLossTriggered ? "bg-red-900/20" : isTakeProfitTriggered ? "bg-green-900/20" : ""
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          position.type === "long" ? "bg-blue-900 text-blue-300" : "bg-red-900 text-red-300"
                        }`}
                      >
                        {position.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-white">${formatPrice(position.size)}</td>
                    <td className="px-4 py-3 text-right text-white">${formatPrice(position.entryPrice)}</td>
                    <td className="px-4 py-3 text-right text-white">${formatPrice(currentPrice)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-col">
                        {position.stopLoss && (
                          <span className="text-red-400 text-xs">SL: ${formatPrice(position.stopLoss)}</span>
                        )}
                        {position.takeProfit && (
                          <span className="text-green-400 text-xs">TP: ${formatPrice(position.takeProfit)}</span>
                        )}
                        {!position.stopLoss && !position.takeProfit && <span className="text-gray-500">-</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-white">${formatPrice(position.liquidationPrice)}</td>
                    <td className={`px-4 py-3 text-right font-medium ${pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                      ${formatPrice(pnl)} ({formatPercentage(pnlPercentage)})
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded-md text-xs"
                        onClick={() => onClosePosition && onClosePosition(position.id)}
                      >
                        Close
                      </button>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500">No positions yet</div>
      )}
    </motion.div>
  )
}
