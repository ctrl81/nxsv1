"use client"

import { useState, useEffect } from "react"
import { useTrading } from "@/contexts/trading-context"
import { cn } from "@/lib/utils"
import { AlertTriangle, Info } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

interface RiskCalculatorProps {
  className?: string
}

export function RiskCalculator({ className }: RiskCalculatorProps) {
  const { currentPair, pairPrices, balance, positionSize, leverage, positionType, stopLoss } = useTrading()

  const [riskAmount, setRiskAmount] = useState(0)
  const [riskPercentage, setRiskPercentage] = useState(0)
  const [riskLevel, setRiskLevel] = useState<"low" | "medium" | "high" | "extreme">("low")
  const [showDetails, setShowDetails] = useState(false)

  // Calculate risk whenever relevant values change
  useEffect(() => {
    if (!stopLoss || !positionSize) {
      setRiskAmount(0)
      setRiskPercentage(0)
      setRiskLevel("low")
      return
    }

    const currentPrice = pairPrices[currentPair]?.price || 0
    if (!currentPrice) return

    // Calculate potential loss based on position type and stop loss
    let potentialLoss = 0

    if (positionType === "long") {
      // For long positions, we lose if price goes down to stop loss
      const priceDifference = currentPrice - stopLoss
      const percentageDifference = (priceDifference / currentPrice) * 100
      potentialLoss = (positionSize * percentageDifference * leverage) / 100
    } else {
      // For short positions, we lose if price goes up to stop loss
      const priceDifference = stopLoss - currentPrice
      const percentageDifference = (priceDifference / currentPrice) * 100
      potentialLoss = (positionSize * percentageDifference * leverage) / 100
    }

    // Ensure loss is positive for calculation purposes
    potentialLoss = Math.abs(potentialLoss)
    setRiskAmount(potentialLoss)

    // Calculate risk as percentage of account balance
    const riskPercent = (potentialLoss / balance) * 100
    setRiskPercentage(riskPercent)

    // Determine risk level
    if (riskPercent < 1) {
      setRiskLevel("low")
    } else if (riskPercent < 3) {
      setRiskLevel("medium")
    } else if (riskPercent < 5) {
      setRiskLevel("high")
    } else {
      setRiskLevel("extreme")
    }
  }, [currentPair, pairPrices, balance, positionSize, leverage, positionType, stopLoss])

  const riskColors = {
    low: "bg-green-500",
    medium: "bg-yellow-500",
    high: "bg-orange-500",
    extreme: "bg-red-500",
  }

  const riskMessages = {
    low: "Low risk trade (<1% of balance)",
    medium: "Medium risk trade (1-3% of balance)",
    high: "High risk trade (3-5% of balance)",
    extreme: "Extreme risk trade (>5% of balance)",
  }

  return (
    <div className={cn("bg-background border rounded-lg overflow-hidden", className)}>
      <div className="p-3 border-b flex items-center justify-between">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          Risk Assessment
        </h3>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowDetails(!showDetails)}>
          <Info className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={cn("h-full rounded-full", riskColors[riskLevel])}
                initial={{ width: "0%" }}
                animate={{ width: `${Math.min(riskPercentage * 5, 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          <span className="text-xs font-medium">{riskPercentage.toFixed(2)}%</span>
        </div>

        <div className="flex items-center justify-between">
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              riskLevel === "low" && "bg-green-100 text-green-800",
              riskLevel === "medium" && "bg-yellow-100 text-yellow-800",
              riskLevel === "high" && "bg-orange-100 text-orange-800",
              riskLevel === "extreme" && "bg-red-100 text-red-800",
            )}
          >
            {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
          </span>
          <span className="text-xs text-muted-foreground">Potential loss: ${riskAmount.toFixed(2)}</span>
        </div>

        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-3 pt-3 border-t text-xs text-muted-foreground"
          >
            <p className="mb-2">{riskMessages[riskLevel]}</p>
            <p>
              Professional traders typically risk 1-2% of their account balance per trade to ensure long-term
              sustainability.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
