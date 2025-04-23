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
      <div className="grid grid-cols-4 gap-0 text-sm font-medium text-gray-400 p-2 border-b border-gray-800">
        <div className="col-span-2">Total (HYPE)</div>
        <div className="col-span-2 text-right">Price</div>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {/* Asks (Sell Orders) - displayed in reverse order (highest to lowest) */}
        <div className="asks">
          {orderBook.asks.map((ask, index) => (
            <motion.div
              key={`ask-${index}`}
              className="grid grid-cols-4 gap-0 text-sm p-2 hover:bg-gray-900"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.02 }}
            >
              <div className="col-span-2">{ask.total.toFixed(2)}</div>
              <div className="col-span-2 text-right text-red-500">{ask.price.toFixed(2)}</div>
              <div className="col-span-4 h-1 bg-red-500/10" style={{ width: `${Math.min(ask.total * 3, 100)}%` }} />
            </motion.div>
          ))}
        </div>

        {/* Spread indicator */}
        <div className="p-2 text-center text-sm text-gray-500 border-y border-gray-800">
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

        {/* Bids (Buy Orders) */}
        <div className="bids">
          {orderBook.bids.map((bid, index) => (
            <motion.div
              key={`bid-${index}`}
              className="grid grid-cols-4 gap-0 text-sm p-2 hover:bg-gray-900"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.02 }}
            >
              <div className="col-span-2">{bid.total.toFixed(2)}</div>
              <div className="col-span-2 text-right text-green-500">{bid.price.toFixed(2)}</div>
              <div className="col-span-4 h-1 bg-green-500/10" style={{ width: `${Math.min(bid.total * 3, 100)}%` }} />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
