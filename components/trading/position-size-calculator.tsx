"use client"

import { useState } from "react"
import { useTrading } from "@/contexts/trading-context"
import { cn } from "@/lib/utils"
import { Calculator, ChevronDown, ChevronUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface PositionSizeCalculatorProps {
  className?: string
}

export function PositionSizeCalculator({ className }: PositionSizeCalculatorProps) {
  const { balance, setPositionSize, leverage, currentPair, pairPrices } = useTrading()

  const [isOpen, setIsOpen] = useState(false)
  const [riskPercentage, setRiskPercentage] = useState(1) // Default 1% risk
  const [stopLossPoints, setStopLossPoints] = useState(100) // Default 100 points

  const calculatePositionSize = () => {
    const currentPrice = pairPrices[currentPair]?.price || 0
    if (!currentPrice) return 0

    // Calculate risk amount based on account balance and risk percentage
    const riskAmount = (balance * riskPercentage) / 100

    // Calculate stop loss in price terms
    const stopLossPrice = (stopLossPoints / currentPrice) * 100

    // Calculate position size based on risk, leverage, and stop loss
    const positionSize = riskAmount / (stopLossPrice / 100) / leverage

    return positionSize
  }

  const handleApply = () => {
    const calculatedSize = calculatePositionSize()
    setPositionSize(calculatedSize)
    setIsOpen(false)
  }

  const presetRiskPercentages = [0.5, 1, 2, 3, 5]

  return (
    <div className={cn("bg-background border rounded-lg overflow-hidden", className)}>
      <div className="p-3 border-b flex items-center justify-between cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Calculator className="h-4 w-4 text-primary" />
          Position Size Calculator
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
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Risk Percentage (% of balance)</label>
                <div className="flex gap-2 mb-2">
                  {presetRiskPercentages.map((percent) => (
                    <Button
                      key={percent}
                      type="button"
                      size="sm"
                      variant={riskPercentage === percent ? "default" : "outline"}
                      className="h-7 text-xs flex-1"
                      onClick={() => setRiskPercentage(percent)}
                    >
                      {percent}%
                    </Button>
                  ))}
                </div>
                <Input
                  type="number"
                  value={riskPercentage}
                  onChange={(e) => setRiskPercentage(Number.parseFloat(e.target.value) || 0)}
                  min={0.1}
                  max={100}
                  step={0.1}
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Risk amount: ${((balance * riskPercentage) / 100).toFixed(2)}
                </p>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Stop Loss (in points)</label>
                <Input
                  type="number"
                  value={stopLossPoints}
                  onChange={(e) => setStopLossPoints(Number.parseInt(e.target.value) || 0)}
                  min={1}
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Current price: ${pairPrices[currentPair]?.price.toFixed(2) || "0.00"}
                </p>
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Calculated Position Size:</span>
                  <span className="text-sm font-mono font-bold">${calculatePositionSize().toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  With {leverage}x leverage and {riskPercentage}% risk
                </p>
                <Button onClick={handleApply} className="w-full" size="sm">
                  Apply Size
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
