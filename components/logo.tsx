"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  withLink?: boolean
  className?: string
}

export function Logo({ size = "md", withLink = true, className = "" }: LogoProps) {
  const dimensions = {
    sm: { width: 30, height: 30, className: "h-6 w-auto" },
    md: { width: 40, height: 40, className: "h-8 w-auto md:h-10" },
    lg: { width: 50, height: 50, className: "h-12 w-auto" },
  }

  const { width, height, className: sizeClassName } = dimensions[size]

  const logoImage = (
    <Image
      src="/images/logo.png"
      alt="Nexus Trade Logo"
      width={width}
      height={height}
      className={`${sizeClassName} ${className}`}
      priority
      onError={(e) => {
        console.error("Error loading logo image")
        e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 24 24' fill='none' stroke='%230096FF' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'%3E%3Cpath d='M12 2L2 7l10 5 10-5-10-5z'/%3E%3Cpath d='M2 17l10 5 10-5'/%3E%3Cpath d='M2 12l10 5 10-5'/%3E%3C/svg%3E`
      }}
    />
  )

  if (!withLink) return logoImage

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Link href="/" className="flex items-center">
        {logoImage}
      </Link>
    </motion.div>
  )
}
