"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { useInView } from "react-intersection-observer"

interface StaggerChildrenProps {
  children: ReactNode
  delay?: number
  staggerDelay?: number
  className?: string
  once?: boolean
  threshold?: number
}

export function StaggerChildren({
  children,
  delay = 0,
  staggerDelay = 0.1,
  className = "",
  once = false,
  threshold = 0.1,
}: StaggerChildrenProps) {
  const { ref, inView } = useInView({
    triggerOnce: once,
    threshold,
    // Add rootMargin to prevent edge cases
    rootMargin: "0px 0px -50px 0px",
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: delay,
        staggerChildren: staggerDelay,
      },
    },
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={containerVariants}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className = "" }: { children: ReactNode; className?: string }) {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  )
}
