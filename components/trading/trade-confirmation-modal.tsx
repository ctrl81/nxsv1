"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { AnimatedButton } from "@/components/animations/animated-button"
import { ArrowUpRight, ArrowDownRight, AlertTriangle, CheckCircle2, X } from "lucide-react"
import type { PositionType, OrderType } from "@/lib/types"

interface TradeConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  tradeDetails: {
    type: PositionType
    orderType: OrderType
    asset: string
    quoteAsset: string
    price: number
    amount: number
    leverage: number
    stopLoss?: number
    takeProfit?: number
    liquidationPrice: number
    fee: number
  }
}

export function TradeConfirmationModal({ open, onOpenChange, onConfirm, tradeDetails }: TradeConfirmationModalProps) {
  const isLongPosition = tradeDetails.type === "long"
  const isMarketOrder = tradeDetails.orderType === "market"

  // Calculate potential profit and loss
  const potentialProfit = tradeDetails.takeProfit
    ? (
        (Math.abs(tradeDetails.takeProfit - tradeDetails.price) / tradeDetails.price) *
        tradeDetails.amount *
        tradeDetails.leverage
      ).toFixed(2)
    : "N/A"

  const potentialLoss = tradeDetails.stopLoss
    ? (
        (Math.abs(tradeDetails.stopLoss - tradeDetails.price) / tradeDetails.price) *
        tradeDetails.amount *
        tradeDetails.leverage
      ).toFixed(2)
    : "N/A"

  // Risk to reward ratio calculation
  const riskToReward =
    tradeDetails.takeProfit && tradeDetails.stopLoss
      ? (
          Math.abs(tradeDetails.takeProfit - tradeDetails.price) / Math.abs(tradeDetails.stopLoss - tradeDetails.price)
        ).toFixed(2)
      : "N/A"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gray-900 border border-gray-800 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-bold text-white flex items-center">
            {isLongPosition ? (
              <ArrowUpRight className="text-blue-500 mr-2 h-5 w-5" />
            ) : (
              <ArrowDownRight className="text-red-500 mr-2 h-5 w-5" />
            )}
            Confirm {isLongPosition ? "Long" : "Short"} {isMarketOrder ? "Market" : "Limit"} Order
          </DialogTitle>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>

        <div className="p-6 pt-2 space-y-6">
          {/* Order Details */}
          <div className="space-y-4">
            <div className="bg-gray-800/50 p-3 rounded-md">
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-gray-400">Asset:</div>
                <div className="text-white font-medium">
                  {tradeDetails.asset}/{tradeDetails.quoteAsset}
                </div>

                <div className="text-gray-400">Order Type:</div>
                <div className="text-white font-medium">
                  {tradeDetails.orderType.charAt(0).toUpperCase() + tradeDetails.orderType.slice(1)}
                </div>

                <div className="text-gray-400">Position:</div>
                <div className="text-white font-medium">
                  {tradeDetails.type.charAt(0).toUpperCase() + tradeDetails.type.slice(1)}
                </div>

                <div className="text-gray-400">Entry Price:</div>
                <div className="text-white font-medium">${tradeDetails.price.toFixed(2)}</div>

                <div className="text-gray-400">Amount:</div>
                <div className="text-white font-medium">${tradeDetails.amount.toFixed(2)}</div>

                <div className="text-gray-400">Leverage:</div>
                <div className="text-white font-medium">{tradeDetails.leverage}x</div>

                <div className="text-gray-400">Liquidation Price:</div>
                <div className="text-white font-medium">${tradeDetails.liquidationPrice.toFixed(2)}</div>

                <div className="text-gray-400">Stop Loss:</div>
                <div className="text-white font-medium">
                  {tradeDetails.stopLoss ? `$${tradeDetails.stopLoss.toFixed(2)}` : "Not set"}
                </div>

                <div className="text-gray-400">Take Profit:</div>
                <div className="text-white font-medium">
                  {tradeDetails.takeProfit ? `$${tradeDetails.takeProfit.toFixed(2)}` : "Not set"}
                </div>

                <div className="text-gray-400">Trading Fee:</div>
                <div className="text-white font-medium">${tradeDetails.fee.toFixed(2)}</div>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="bg-gray-800/50 p-3 rounded-md">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-500">Risk Assessment</span>
              </div>

              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-gray-400">Potential Profit:</div>
                <div className="text-green-500">${potentialProfit}</div>

                <div className="text-gray-400">Potential Loss:</div>
                <div className="text-red-500">${potentialLoss}</div>

                <div className="text-gray-400">Risk/Reward Ratio:</div>
                <div
                  className={`${
                    riskToReward !== "N/A" && Number(riskToReward) >= 1 ? "text-green-500" : "text-yellow-500"
                  }`}
                >
                  {riskToReward}:1
                </div>

                <div className="text-gray-400">Leverage Risk:</div>
                <div
                  className={`${
                    tradeDetails.leverage <= 3
                      ? "text-green-500"
                      : tradeDetails.leverage <= 5
                        ? "text-yellow-500"
                        : "text-red-500"
                  }`}
                >
                  {tradeDetails.leverage <= 3 ? "Low" : tradeDetails.leverage <= 5 ? "Medium" : "High"}
                </div>
              </div>
            </div>
          </div>

          {/* Confirmation */}
          <div className="flex flex-col space-y-2">
            <AnimatedButton
              className={`w-full py-3 text-white font-medium ${
                isLongPosition ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"
              }`}
              onClick={onConfirm}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Confirm Order
            </AnimatedButton>

            <AnimatedButton
              variant="outline"
              className="w-full py-3 text-white font-medium border-gray-700 hover:bg-gray-800"
              onClick={() => onOpenChange(false)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </AnimatedButton>
          </div>

          <p className="text-xs text-gray-500 text-center">
            By confirming this order, you agree to our trading terms and conditions.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
