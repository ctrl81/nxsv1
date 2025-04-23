"use client"
import { motion } from "framer-motion"
import type { Position } from "@/lib/types"
import { formatPrice, formatPercentage } from "@/lib/utils"

interface PositionsTableProps {
  positions: Position[]
  onClosePosition?: (id: string) => void
  className?: string
}

export function PositionsTable({ positions, onClosePosition, className = "" }: PositionsTableProps) {
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
                <th className="px-4 py-2 text-right">Liq. Price</th>
                <th className="px-4 py-2 text-right">PnL</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((position) => (
                <motion.tr
                  key={position.id}
                  className="border-b border-gray-800 hover:bg-gray-900"
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
                  <td className="px-4 py-3 text-right text-white">
                    ${formatPrice(position.entryPrice * (1 + position.pnlPercentage / 100))}
                  </td>
                  <td className="px-4 py-3 text-right text-white">${formatPrice(position.liquidationPrice)}</td>
                  <td
                    className={`px-4 py-3 text-right font-medium ${
                      position.pnl >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    ${formatPrice(position.pnl)} ({formatPercentage(position.pnlPercentage)})
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
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500">No positions yet</div>
      )}
    </motion.div>
  )
}
