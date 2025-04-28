"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useTrading } from "@/contexts/trading-context"
import { cn } from "@/lib/utils"
import { Star, StarOff, TrendingUp, TrendingDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface WatchlistProps {
  className?: string
}

export function Watchlist({ className }: WatchlistProps) {
  const { availablePairs, currentPair, setCurrentPair, pairPrices } = useTrading()

  const [favorites, setFavorites] = useState<string[]>([])
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false)

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem("watchlist-favorites")
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem("watchlist-favorites", JSON.stringify(favorites))
  }, [favorites])

  const toggleFavorite = (pair: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites((prev) => {
      if (prev.includes(pair)) {
        return prev.filter((p) => p !== pair)
      } else {
        return [...prev, pair]
      }
    })
  }

  const displayPairs = showOnlyFavorites ? availablePairs.filter((pair) => favorites.includes(pair)) : availablePairs

  return (
    <div className={cn("flex flex-col h-full bg-background border rounded-lg overflow-hidden", className)}>
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold text-sm">Watchlist</h3>
        <button
          onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
          className={cn(
            "text-xs px-2 py-1 rounded transition-colors",
            showOnlyFavorites ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground hover:bg-muted/80",
          )}
        >
          {showOnlyFavorites ? "Favorites" : "All Pairs"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {displayPairs.map((pair) => {
            const price = pairPrices[pair] || { price: 0, change24h: 0 }
            const isPositive = price.change24h >= 0
            const isFavorite = favorites.includes(pair)
            const isActive = pair === currentPair

            return (
              <motion.div
                key={pair}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setCurrentPair(pair)}
                className={cn(
                  "flex items-center justify-between p-3 cursor-pointer transition-colors",
                  isActive ? "bg-primary/5" : "hover:bg-muted/50",
                  "border-b border-border/50",
                )}
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => toggleFavorite(pair, e)}
                    className="text-yellow-500 hover:text-yellow-400 transition-colors"
                  >
                    {isFavorite ? <Star className="h-4 w-4 fill-yellow-500" /> : <StarOff className="h-4 w-4" />}
                  </button>
                  <span className={cn("font-medium", isActive ? "text-primary" : "")}>{pair}</span>
                </div>

                <div className="flex flex-col items-end">
                  <span className="font-mono font-medium">
                    ${price.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <div
                    className={cn("flex items-center text-xs gap-1", isPositive ? "text-green-500" : "text-red-500")}
                  >
                    {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    <span>
                      {isPositive ? "+" : ""}
                      {price.change24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
