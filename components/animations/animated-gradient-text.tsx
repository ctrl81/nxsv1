"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface AnimatedGradientTextProps {
  children: ReactNode
  className?: string
  from?: string
  via?: string
  to?: string
  animate?: boolean
  duration?: number
}

export function AnimatedGradientText({
  children,
  className = "",
  from = "from-primary",
  via = "via-blue-400",
  to = "to-blue-600",
  animate = true,
  duration = 3,
}: AnimatedGradientTextProps) {
  return (
    <motion.span
      className={`bg-gradient-to-r ${from} ${via} ${to} bg-clip-text text-transparent ${className}`}
      style={{
        backgroundSize: animate ? "200% 200%" : "100% 100%",
      }}
      animate={
        animate
          ? {
              backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
            }
          : undefined
      }
      transition={
        animate
          ? {
              duration,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }
          : undefined
      }
    >
      {children}
    </motion.span>
  )
}
