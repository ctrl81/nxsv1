"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import type { ButtonProps } from "@/components/ui/button"
import type { ReactNode } from "react"

interface AnimatedButtonProps extends ButtonProps {
  children: ReactNode
  whileHover?: any
  whileTap?: any
}

export function AnimatedButton({
  children,
  className,
  whileHover = { scale: 1.05 },
  whileTap = { scale: 0.95 },
  ...props
}: AnimatedButtonProps) {
  return (
    <motion.div whileHover={whileHover} whileTap={whileTap} className="inline-block">
      <Button className={className} {...props}>
        {children}
      </Button>
    </motion.div>
  )
}
