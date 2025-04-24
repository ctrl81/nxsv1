"use client"

import { useState, useEffect } from "react"
import type { OrderBook as OrderBookType } from "@/lib/types"
import { generateMockOrderBook } from "@/lib/mock-data"
import { motion } from "framer-motion"

interface OrderBookProps {
  className?: string
}

export function OrderBook({ className = "" }: OrderBookProps) {
  const [orderBook, setOrderBook] = useState<OrderBookType>({ bids: [], asks: [] })

  useEffect(() => {
    // Initialize with mock data
    setOrderBook(generateMockOrderBook())

    // Simulate order book updates
    const interval = setInterval(() => {
      setOrderBook((prev) => {
        const newOrderBook = { ...prev }

        // Randomly update some bids
        newOrderBook.bids = newOrderBook.bids.map((bid) => {
          if (Math.random() > 0.7) {
            return {
              ...bid,
              total: Number.parseFloat((bid.total + (Math.random() - 0.5) * 2).toFixed(2)),
            }
          }
          return bid
        })

        // Randomly update some asks
        newOrderBook.asks = newOrderBook.asks.map((ask) => {
          if (Math.random() > 0.7) {
            return {
              ...ask,
              total: Number.parseFloat((ask.total + (Math.random() - 0.5) * 2).toFixed(2)),
            }
          }
          return ask
        })

        return newOrderBook
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      className={`bg-black rounded-lg overflow-hidden ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid grid-cols-2 gap-4 p-4">
        {/* Bids (Buy Orders) */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-0 text-sm font-medium text-gray-400 pb-2 border-b border-gray-800">
            <div>Total (HYPE)</div>
            <div className="text-right">Price</div>
          </div>
          <div className="max-h-[400px] overflow-y-auto space-y-1">
            {orderBook.bids.map((bid, index) => (
              <motion.div
                key={`bid-${index}`}
                className="grid grid-cols-2 gap-0 text-sm p-2 hover:bg-gray-900 rounded-md relative overflow-hidden"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
              >
                <div className="z-10">{bid.total.toFixed(2)}</div>
                <div className="text-right text-green-500 z-10">{bid.price.toFixed(2)}</div>
                <div
                  className="absolute inset-0 bg-green-500/10"
                  style={{ width: `${Math.min(bid.total * 3, 100)}%` }}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Asks (Sell Orders) */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-0 text-sm font-medium text-gray-400 pb-2 border-b border-gray-800">
            <div>Price</div>
            <div className="text-right">Total (HYPE)</div>
          </div>
          <div className="max-h-[400px] overflow-y-auto space-y-1">
            {orderBook.asks.map((ask, index) => (
              <motion.div
                key={`ask-${index}`}
                className="grid grid-cols-2 gap-0 text-sm p-2 hover:bg-gray-900 rounded-md relative overflow-hidden"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
              >
                <div className="text-red-500 z-10">{ask.price.toFixed(2)}</div>
                <div className="text-right z-10">{ask.total.toFixed(2)}</div>
                <div
                  className="absolute inset-0 bg-red-500/10"
                  style={{ width: `${Math.min(ask.total * 3, 100)}%`, right: 0, left: "auto" }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Spread indicator */}
      <div className="p-2 text-center text-sm text-gray-500 border-t border-gray-800">
        Spread:{" "}
        {orderBook.asks[0] && orderBook.bids[0]
          ? (orderBook.asks[0].price - orderBook.bids[0].price).toFixed(2)
          : "0.00"}
        (
        {orderBook.asks[0] && orderBook.bids[0]
          ? (((orderBook.asks[0].price - orderBook.bids[0].price) / orderBook.bids[0].price) * 100).toFixed(2)
          : "0.00"}
        %)
      </div>
    </motion.div>
  )
}
