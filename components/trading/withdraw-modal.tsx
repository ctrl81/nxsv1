"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { AnimatedButton } from "@/components/animations/animated-button"
import { motion } from "framer-motion"
import type { Token } from "@/lib/types"
import { X } from "lucide-react"

interface WithdrawModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onWithdraw: (amount: number, token: Token) => void
  balances: Record<Token, number>
}

export function WithdrawModal({ open, onOpenChange, onWithdraw, balances }: WithdrawModalProps) {
  const [amount, setAmount] = useState<string>("0.00")
  const [selectedToken, setSelectedToken] = useState<Token>("WBTC")

  const handleWithdraw = () => {
    onWithdraw(Number.parseFloat(amount), selectedToken)
    onOpenChange(false)
  }

  const setMaxAmount = () => {
    const maxAmount = balances[selectedToken] || 0
    setAmount(maxAmount.toString())
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-black border border-gray-800 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-bold text-white">Withdraw Funds</DialogTitle>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>

        <div className="p-6 pt-2 space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Amount to be withdrawn</label>
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-gray-900 border-gray-800 text-white text-right text-xl h-12"
                  placeholder="0.00"
                />
              </div>
              <motion.button
                className="text-sm text-primary font-medium"
                onClick={setMaxAmount}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                MAX
              </motion.button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(["WBTC", "ETH", "SUI"] as Token[]).map((token) => (
              <motion.button
                key={token}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedToken === token ? "bg-primary text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
                onClick={() => setSelectedToken(token)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {token}
              </motion.button>
            ))}
          </div>

          <AnimatedButton
            className="w-full py-3 bg-primary text-white hover:bg-primary/90"
            onClick={handleWithdraw}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Withdraw
          </AnimatedButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}
