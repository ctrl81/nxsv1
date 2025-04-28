"use client"
import { motion } from "framer-motion"
import type { Order } from "@/lib/types"
import { formatPrice, formatDate } from "@/lib/utils"

interface OrdersTableProps {
  orders: Order[]
  onCancelOrder?: (id: string) => void
  className?: string
}

export function OrdersTable({ orders, onCancelOrder, className = "" }: OrdersTableProps) {
  return (
    <motion.div
      className={`bg-black rounded-lg overflow-hidden ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {orders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-800">
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-right">Size</th>
                <th className="px-4 py-2 text-right">Price</th>
                <th className="px-4 py-2 text-right">Leverage</th>
                <th className="px-4 py-2 text-right">SL/TP</th>
                <th className="px-4 py-2 text-right">Date</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <motion.tr
                  key={order.id}
                  className="border-b border-gray-800 hover:bg-gray-900"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        order.positionType === "long" ? "bg-blue-900 text-blue-300" : "bg-red-900 text-red-300"
                      }`}
                    >
                      {order.type.toUpperCase()} {order.positionType.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-white">${formatPrice(order.size)}</td>
                  <td className="px-4 py-3 text-right text-white">${formatPrice(order.price)}</td>
                  <td className="px-4 py-3 text-right text-white">{order.leverage || 1}x</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-col">
                      {order.stopLoss && (
                        <span className="text-red-400 text-xs">SL: ${formatPrice(order.stopLoss)}</span>
                      )}
                      {order.takeProfit && (
                        <span className="text-green-400 text-xs">TP: ${formatPrice(order.takeProfit)}</span>
                      )}
                      {!order.stopLoss && !order.takeProfit && <span className="text-gray-500">-</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400">{formatDate(order.timestamp)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded-md text-xs"
                      onClick={() => onCancelOrder && onCancelOrder(order.id)}
                    >
                      Cancel
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500">No open orders</div>
      )}
    </motion.div>
  )
}
