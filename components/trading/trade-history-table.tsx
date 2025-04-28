"use client"
import { motion } from "framer-motion"
import type { TradeHistory } from "@/lib/types"
import { formatPrice, formatDate } from "@/lib/utils"

interface TradeHistoryTableProps {
  history: TradeHistory[]
  className?: string
}

export function TradeHistoryTable({ history, className = "" }: TradeHistoryTableProps) {
  // Sort history by timestamp (newest first)
  const sortedHistory = [...history].sort((a, b) => b.timestamp - a.timestamp)

  return (
    <motion.div
      className={`bg-black rounded-lg overflow-hidden ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {sortedHistory.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-800">
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-right">Action</th>
                <th className="px-4 py-2 text-right">Size</th>
                <th className="px-4 py-2 text-right">Price</th>
                <th className="px-4 py-2 text-right">Fee</th>
                <th className="px-4 py-2 text-right">PnL</th>
                <th className="px-4 py-2 text-right">Reason</th>
                <th className="px-4 py-2 text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {sortedHistory.map((trade) => (
                <motion.tr
                  key={trade.id}
                  className="border-b border-gray-800 hover:bg-gray-900"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        trade.type === "long" ? "bg-blue-900 text-blue-300" : "bg-red-900 text-red-300"
                      }`}
                    >
                      {trade.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        trade.action === "open" ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"
                      }`}
                    >
                      {trade.action?.toUpperCase() || "TRADE"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-white">${formatPrice(trade.size)}</td>
                  <td className="px-4 py-3 text-right text-white">${formatPrice(trade.price)}</td>
                  <td className="px-4 py-3 text-right text-gray-400">${formatPrice(trade.fee)}</td>
                  <td
                    className={`px-4 py-3 text-right font-medium ${
                      trade.pnl ? (trade.pnl >= 0 ? "text-green-500" : "text-red-500") : "text-gray-400"
                    }`}
                  >
                    {trade.pnl ? `$${formatPrice(trade.pnl)}` : "-"}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400">{trade.reason || "-"}</td>
                  <td className="px-4 py-3 text-right text-gray-400">{formatDate(trade.timestamp)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500">No trade history</div>
      )}
    </motion.div>
  )
}
