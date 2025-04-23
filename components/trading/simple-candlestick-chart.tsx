"use client"

import { useEffect, useRef, useState } from "react"
import type { CandleData } from "@/lib/types"
import { motion } from "framer-motion"

interface SimpleCandlestickChartProps {
  data: CandleData[]
  width?: number
  height?: number
  className?: string
}

export function SimpleCandlestickChart({
  data,
  width = 600,
  height = 300,
  className = "",
}: SimpleCandlestickChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height })

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height,
        })
      }
    }

    // Initial size
    handleResize()

    // Add event listener
    window.addEventListener("resize", handleResize)

    // Clean up
    return () => window.removeEventListener("resize", handleResize)
  }, [height])

  useEffect(() => {
    if (!canvasRef.current || data.length === 0 || dimensions.width === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions with device pixel ratio for sharper rendering
    const pixelRatio = window.devicePixelRatio || 1
    canvas.width = dimensions.width * pixelRatio
    canvas.height = dimensions.height * pixelRatio
    canvas.style.width = `${dimensions.width}px`
    canvas.style.height = `${dimensions.height}px`
    ctx.scale(pixelRatio, pixelRatio)

    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height)

    // Find min and max values for scaling
    const prices = data.flatMap((candle) => [candle.high, candle.low])
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice

    // Calculate scaling factors
    const xScale = dimensions.width / data.length
    const yScale = (dimensions.height - 40) / priceRange

    // Draw grid
    ctx.strokeStyle = "rgba(42, 46, 57, 0.3)"
    ctx.lineWidth = 0.5

    // Horizontal grid lines
    const gridLines = 5
    for (let i = 0; i <= gridLines; i++) {
      const y = 20 + (dimensions.height - 40) * (i / gridLines)
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(dimensions.width, y)
      ctx.stroke()

      // Price labels
      const price = maxPrice - (i / gridLines) * priceRange
      ctx.fillStyle = "#d1d4dc"
      ctx.font = "10px Arial"
      ctx.textAlign = "left"
      ctx.fillText(price.toFixed(2), 5, y - 5)
    }

    // Vertical grid lines
    const timeGridLines = Math.min(data.length, 6)
    for (let i = 0; i <= timeGridLines; i++) {
      const x = (dimensions.width * i) / timeGridLines
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, dimensions.height)
      ctx.stroke()

      // Time labels
      if (i < timeGridLines) {
        const dataIndex = Math.floor((i / timeGridLines) * data.length)
        const date = new Date(data[dataIndex].time)
        const hours = date.getHours().toString().padStart(2, "0")
        const minutes = date.getMinutes().toString().padStart(2, "0")
        ctx.fillStyle = "#d1d4dc"
        ctx.font = "10px Arial"
        ctx.textAlign = "center"
        ctx.fillText(`${hours}:${minutes}`, x, dimensions.height - 5)
      }
    }

    // Draw candlesticks
    data.forEach((candle, i) => {
      const x = i * xScale
      const candleWidth = Math.max(xScale * 0.8, 1)

      // Calculate y positions
      const openY = dimensions.height - 20 - (candle.open - minPrice) * yScale
      const closeY = dimensions.height - 20 - (candle.close - minPrice) * yScale
      const highY = dimensions.height - 20 - (candle.high - minPrice) * yScale
      const lowY = dimensions.height - 20 - (candle.low - minPrice) * yScale

      // Determine if candle is up or down
      const isUp = candle.close > candle.open
      ctx.strokeStyle = isUp ? "#26a69a" : "#ef5350"
      ctx.fillStyle = isUp ? "#26a69a" : "#ef5350"

      // Draw wick
      ctx.beginPath()
      ctx.moveTo(x + candleWidth / 2, highY)
      ctx.lineTo(x + candleWidth / 2, lowY)
      ctx.stroke()

      // Draw body
      const bodyHeight = Math.abs(closeY - openY)
      const bodyY = Math.min(openY, closeY)

      ctx.fillRect(x, bodyY, candleWidth, bodyHeight || 1) // Ensure at least 1px height
    })

    // Draw current price line and label
    if (data.length > 0) {
      const lastCandle = data[data.length - 1]
      const priceY = dimensions.height - 20 - (lastCandle.close - minPrice) * yScale

      ctx.strokeStyle = "#0096FF"
      ctx.lineWidth = 1
      ctx.setLineDash([5, 3])
      ctx.beginPath()
      ctx.moveTo(0, priceY)
      ctx.lineTo(dimensions.width, priceY)
      ctx.stroke()
      ctx.setLineDash([])

      // Price label
      ctx.fillStyle = "#0096FF"
      ctx.font = "bold 12px Arial"
      ctx.textAlign = "right"
      ctx.fillText(lastCandle.close.toFixed(2), dimensions.width - 5, priceY - 5)
    }
  }, [data, dimensions])

  return (
    <motion.div
      ref={containerRef}
      className={`w-full ${className}`}
      style={{ height }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <canvas ref={canvasRef} className="w-full h-full" style={{ display: "block" }} />
    </motion.div>
  )
}
