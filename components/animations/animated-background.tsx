"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface AnimatedBackgroundProps {
  className?: string
  variant?: "particles" | "gradient" | "waves"
  color?: string
  density?: number
}

export function AnimatedBackground({
  className = "",
  variant = "particles",
  color = "primary",
  density = 20,
}: AnimatedBackgroundProps) {
  const [particles, setParticles] = useState<Array<{ x: number; y: number; size: number; speed: number }>>([])

  useEffect(() => {
    if (variant === "particles") {
      // Generate random particles
      const newParticles = Array.from({ length: density }).map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 2 + 0.5,
      }))
      setParticles(newParticles)
    }
  }, [variant, density])

  if (variant === "particles") {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
        {particles.map((particle, index) => (
          <motion.div
            key={index}
            className={`absolute rounded-full bg-${color}`}
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: particle.speed * 5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
    )
  }

  if (variant === "gradient") {
    return (
      <motion.div
        className={`absolute inset-0 pointer-events-none ${className}`}
        animate={{
          background: [
            `radial-gradient(circle at 20% 20%, var(--${color}) 0%, transparent 70%)`,
            `radial-gradient(circle at 80% 80%, var(--${color}) 0%, transparent 70%)`,
            `radial-gradient(circle at 80% 20%, var(--${color}) 0%, transparent 70%)`,
            `radial-gradient(circle at 20% 80%, var(--${color}) 0%, transparent 70%)`,
            `radial-gradient(circle at 20% 20%, var(--${color}) 0%, transparent 70%)`,
          ],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />
    )
  }

  if (variant === "waves") {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
        <motion.div
          className={`absolute inset-0 bg-${color}/10`}
          style={{
            maskImage:
              "url(\"data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='wave' width='100' height='20' patternUnits='userSpaceOnUse'%3E%3Cpath d='M0 10 Q 25 0, 50 10 Q 75 20, 100 10' stroke='%23fff' fill='none'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23wave)'/%3E%3C/svg%3E\")",
            maskSize: "100px 20px",
          }}
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className={`absolute inset-0 bg-${color}/10`}
          style={{
            maskImage:
              "url(\"data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='wave' width='120' height='30' patternUnits='userSpaceOnUse'%3E%3Cpath d='M0 15 Q 30 0, 60 15 Q 90 30, 120 15' stroke='%23fff' fill='none'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23wave)'/%3E%3C/svg%3E\")",
            maskSize: "120px 30px",
          }}
          animate={{
            y: [0, -30, 0],
          }}
          transition={{
            duration: 7,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
            delay: 0.5,
          }}
        />
      </div>
    )
  }

  return null
}
