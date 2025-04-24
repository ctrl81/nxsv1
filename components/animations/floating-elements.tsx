"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface FloatingElementsProps {
  className?: string
  count?: number
  shapes?: Array<"circle" | "square" | "triangle" | "hexagon">
  colors?: string[]
  minSize?: number
  maxSize?: number
}

export function FloatingElements({
  className = "",
  count = 10,
  shapes = ["circle", "square", "triangle"],
  colors = ["primary", "blue-400", "blue-300"],
  minSize = 10,
  maxSize = 40,
}: FloatingElementsProps) {
  const [elements, setElements] = useState<
    Array<{
      x: number
      y: number
      size: number
      shape: string
      color: string
      rotation: number
      duration: number
      delay: number
    }>
  >([])

  useEffect(() => {
    const newElements = Array.from({ length: count }).map(() => {
      const shape = shapes[Math.floor(Math.random() * shapes.length)]
      const color = colors[Math.floor(Math.random() * colors.length)]
      const size = Math.random() * (maxSize - minSize) + minSize

      return {
        x: Math.random() * 100,
        y: Math.random() * 100,
        size,
        shape,
        color,
        rotation: Math.random() * 360,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 5,
      }
    })

    setElements(newElements)
    // Only regenerate elements when these props change
  }, [count, shapes.toString(), colors.toString(), minSize, maxSize])

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {elements.map((element, index) => (
        <motion.div
          key={index}
          className={`absolute bg-${element.color} opacity-10`}
          style={{
            width: `${element.size}px`,
            height: `${element.size}px`,
            left: `${element.x}%`,
            top: `${element.y}%`,
            borderRadius: element.shape === "circle" ? "50%" : element.shape === "square" ? "0" : "0",
            clipPath:
              element.shape === "triangle"
                ? "polygon(50% 0%, 0% 100%, 100% 100%)"
                : element.shape === "hexagon"
                  ? "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
                  : "none",
            transform: `rotate(${element.rotation}deg)`,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            rotate: [element.rotation, element.rotation + 360],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: element.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
            delay: element.delay,
          }}
        />
      ))}
    </div>
  )
}
