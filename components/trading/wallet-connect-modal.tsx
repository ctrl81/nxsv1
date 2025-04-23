"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AnimatedButton } from "@/components/animations/animated-button"
import type { WalletType } from "@/lib/types"
import { motion } from "framer-motion"

interface WalletConnectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConnect: (walletType: WalletType) => void
}

export function WalletConnectModal({ open, onOpenChange, onConnect }: WalletConnectModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Connect Wallet</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <AnimatedButton
              className="w-full py-3 bg-cta-blue text-dark hover:bg-primary"
              onClick={() => onConnect("sui")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Connect SUI Wallet
            </AnimatedButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <AnimatedButton
              className="w-full py-3 bg-gray-800 text-white hover:bg-gray-700"
              onClick={() => onConnect("stashed")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Connect Stashed
            </AnimatedButton>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
