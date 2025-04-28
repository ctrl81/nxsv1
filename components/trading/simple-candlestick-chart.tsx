"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import type { CandleData } from "@/lib/types"
import { motion } from "framer-motion"
import { ZoomIn, ZoomOut, RefreshCw } from "lucide-react"

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
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [offsetX, setOffsetX] = useState(0)
  const [scale, setScale] = useState(1)
  const [showControls, setShowControls] = useState(false)

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
    const minPrice = Math.min(...prices) * 0.998 // Add a little padding
    const maxPrice = Math.max(...prices) * 1.002
    const priceRange = maxPrice - minPrice

    // Calculate scaling factors
    const xScale = dimensions.width / (data.length / scale)
    const yScale = (dimensions.height - 40) / priceRange

    // Apply offset for panning
    const effectiveOffsetX = offsetX * scale

    // Draw background
    ctx.fillStyle = "#121212"
    ctx.fillRect(0, 0, dimensions.width, dimensions.height)

    // Draw volume bars at the bottom
    const volumeHeight = 40 // Height for volume section
    const volumeMaxVal = Math.max(...data.map((candle) => candle.volume)) * 1.1 // Add some padding
    const volYScale = volumeHeight / volumeMaxVal

    ctx.globalAlpha = 0.5 // Make volumes slightly transparent

    // First calculate visible data index range
    const startIdx = Math.max(0, Math.floor(-effectiveOffsetX / xScale))
    const endIdx = Math.min(data.length - 1, Math.ceil((dimensions.width - effectiveOffsetX) / xScale))

    for (let i = startIdx; i <= endIdx; i++) {
      const candle = data[i]
      const x = i * xScale + effectiveOffsetX
      const candleWidth = Math.max(xScale * 0.8, 1)

      const volumeHeight = candle.volume * volYScale
      const volumeY = dimensions.height - volumeHeight

      // Define color based on candle direction
      ctx.fillStyle = candle.close >= candle.open ? "rgba(38, 166, 154, 0.5)" : "rgba(239, 83, 80, 0.5)"

      // Draw volume bar
      ctx.fillRect(x, volumeY, candleWidth, volumeHeight)
    }

    ctx.globalAlpha = 1.0 // Reset transparency

    // Draw grid
    ctx.strokeStyle = "rgba(42, 46, 57, 0.3)"
    ctx.lineWidth = 0.5

    // Horizontal grid lines
    const gridLines = 5
    for (let i = 0; i <= gridLines; i++) {
      const y = 20 + (dimensions.height - 40 - volumeHeight) * (i / gridLines)
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
      ctx.lineTo(x, dimensions.height - volumeHeight)
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
        ctx.fillText(`${hours}:${minutes}`, x, dimensions.height - volumeHeight - 5)
      }
    }

    // Draw candlesticks
    for (let i = startIdx; i <= endIdx; i++) {
      const candle = data[i]
      const x = i * xScale + effectiveOffsetX
      const candleWidth = Math.max(xScale * 0.8, 1)

      // Calculate y positions
      const openY = dimensions.height - volumeHeight - 20 - (candle.open - minPrice) * yScale
      const closeY = dimensions.height - volumeHeight - 20 - (candle.close - minPrice) * yScale
      const highY = dimensions.height - volumeHeight - 20 - (candle.high - minPrice) * yScale
      const lowY = dimensions.height - volumeHeight - 20 - (candle.low - minPrice) * yScale

      // Determine if candle is up or down
      const isUp = candle.close >= candle.open
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
    }

    // Draw current price line and label
    if (data.length > 0) {
      const lastCandle = data[data.length - 1]
      const priceY = dimensions.height - volumeHeight - 20 - (lastCandle.close - minPrice) * yScale

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

    // Draw crosshair if hovering
    if (hoveredCandle && mousePosition.x >= 0 && mousePosition.y >= 0) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
      ctx.lineWidth = 0.5
      ctx.setLineDash([5, 5])

      // Vertical line
      ctx.beginPath()
      ctx.moveTo(mousePosition.x, 0)
      ctx.lineTo(mousePosition.x, dimensions.height - volumeHeight)
      ctx.stroke()

      // Horizontal line
      ctx.beginPath()
      ctx.moveTo(0, mousePosition.y)
      ctx.lineTo(dimensions.width, mousePosition.y)
      ctx.stroke()

      ctx.setLineDash([])
    }
  }, [data, dimensions, hoveredCandle, mousePosition, offsetX, scale])

  // Handle mouse events
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || data.length === 0) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setMousePosition({ x, y })

    // Calculate which candle is being hovered
    const xScale = dimensions.width / (data.length / scale)
    const effectiveOffsetX = offsetX * scale
    const index = Math.floor((x - effectiveOffsetX) / xScale)
    const adjustedIndex = Math.min(Math.max(0, index), data.length - 1)
    setHoveredCandle(data[adjustedIndex])

    // Handle dragging
    if (isDragging) {
      const deltaX = x - dragStart.x
      setOffsetX((prev) => prev + deltaX / xScale)
      setDragStart({ x, y })
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setIsDragging(true)
    setDragStart({ x, y })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setHoveredCandle(null)
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setScale((prev) => Math.max(0.5, Math.min(3, prev + delta)))
  }

  return (
    <motion.div
      ref={containerRef}
      className={`w-full ${className} relative`}
      style={{ height }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        style={{ display: "block" }}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
      />

      {/* Hover info tooltip */}
      {hoveredCandle && (
        <div
          className="absolute bg-gray-900 border border-gray-700 p-2 rounded text-xs text-white"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y + 10,
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <div className="text-gray-400">Open:</div>
            <div>${hoveredCandle.open.toFixed(2)}</div>
            <div className="text-gray-400">High:</div>
            <div>${hoveredCandle.high.toFixed(2)}</div>
            <div className="text-gray-400">Low:</div>
            <div>${hoveredCandle.low.toFixed(2)}</div>
            <div className="text-gray-400">Close:</div>
            <div>${hoveredCandle.close.toFixed(2)}</div>
            <div className="text-gray-400">Volume:</div>
            <div>{hoveredCandle.volume.toFixed(2)}</div>
          </div>
        </div>
      )}

      {/* Chart controls */}
      <div
        className={`absolute top-2 right-2 flex space-x-2 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
      >
        <button
          className="bg-gray-800 hover:bg-gray-700 text-white p-1 rounded text-xs"
          onClick={() => setScale((prev) => Math.min(3, prev + 0.2))}
          aria-label="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
        <button
          className="bg-gray-800 hover:bg-gray-700 text-white p-1 rounded text-xs"
          onClick={() => setScale((prev) => Math.max(0.5, prev - 0.2))}
          aria-label="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>
        <button
          className="bg-gray-800 hover:bg-gray-700 text-white p-1 rounded text-xs"
          onClick={() => {
            setScale(1)
            setOffsetX(0)
          }}
          aria-label="Reset Zoom"
        >
          <RefreshCw size={16} />
        </button>
      </div>
    </motion.div>
  )
}
