"use client"

import { useState } from "react"
import { useTrading } from "@/contexts/trading-context"
import { cn } from "@/lib/utils"
import { ArrowUpDown, ChevronDown, ChevronUp, Info } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"

interface TrailingStopLossProps {
  className?: string
}

export function TrailingStopLoss({ className }: TrailingStopLossProps) {
  const { currentPair, pairPrices, positionType, positionSize, leverage } = useTrading()

  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [trailingDistance, setTrailingDistance] = useState(100) // Points
  const [activationPrice, setActivationPrice] = useState<number | null>(null)

  const currentPrice = pairPrices[currentPair]?.price || 0

  const toggleTrailingStop = () => {
    if (!positionSize) {
      toast({
        title: "No position size",
        description: "Please set a position size before activating trailing stop loss",
        variant: "destructive",
      })
      return
    }

    if (isActive) {
      setIsActive(false)
      setActivationPrice(null)
      toast({
        title: "Trailing Stop Deactivated",
        description: "Your trailing stop loss has been deactivated",
      })
    } else {
      setIsActive(true)
      setActivationPrice(currentPrice)
      toast({
        title: "Trailing Stop Activated",
        description: `Trailing stop loss activated at ${trailingDistance} points from price movements`,
      })
    }
  }

  // Calculate the current stop loss price based on trailing distance
  const calculateCurrentStop = () => {
    if (!isActive || !activationPrice) return null

    if (positionType === "long") {
      // For long positions, trailing stop follows price up
      const trailingPrice = currentPrice - (trailingDistance / 100) * currentPrice
      // Return the higher of the initial activation trailing stop or the current trailing stop
      const initialTrailingStop = activationPrice - (trailingDistance / 100) * activationPrice
      return Math.max(trailingPrice, initialTrailingStop)
    } else {
      // For short positions, trailing stop follows price down
      const trailingPrice = currentPrice + (trailingDistance / 100) * currentPrice
      // Return the lower of the initial activation trailing stop or the current trailing stop
      const initialTrailingStop = activationPrice + (trailingDistance / 100) * activationPrice
      return Math.min(trailingPrice, initialTrailingStop)
    }
  }

  const currentStop = calculateCurrentStop()

  return (
    <div className={cn("bg-background border rounded-lg overflow-hidden", className)}>
      <div className="p-3 border-b flex items-center justify-between cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-primary" />
          Trailing Stop Loss
          {isActive && <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">Active</span>}
        </h3>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-3 space-y-3">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Trailing Distance (points)</label>
                  <Input
                    type="number"
                    value={trailingDistance}
                    onChange={(e) => setTrailingDistance(Number.parseInt(e.target.value) || 0)}
                    min={1}
                    disabled={isActive}
                    className="text-sm"
                  />
                </div>
                <div className="pt-5">
                  <Button variant={isActive ? "destructive" : "default"} size="sm" onClick={toggleTrailingStop}>
                    {isActive ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Distance (% of price)</label>
                <Slider
                  value={[trailingDistance]}
                  min={10}
                  max={500}
                  step={10}
                  disabled={isActive}
                  onValueChange={(values) => setTrailingDistance(values[0])}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.1%</span>
                  <span>5%</span>
                </div>
              </div>

              {isActive && activationPrice && (
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Activation Price:</span>
                    <span className="text-xs font-mono">${activationPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Current Price:</span>
                    <span className="text-xs font-mono">${currentPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Current Stop Price:</span>
                    <span className="text-xs font-mono font-bold">${currentStop?.toFixed(2) || "0.00"}</span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-1 pt-2 border-t">
                <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  A trailing stop loss automatically follows the price in your favor, maintaining the specified
                  distance. It helps lock in profits while allowing the position to remain open as long as the trend
                  continues.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
