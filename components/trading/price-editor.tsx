"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { ChevronUp, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"

interface PriceEditorProps {
  initialPrice: number
  onChange: (price: number) => void
  precision?: number
  step?: number
  minValue?: number
  maxValue?: number
  label?: string
  className?: string
}

export function PriceEditor({
  initialPrice,
  onChange,
  precision = 2,
  step = 0.01,
  minValue,
  maxValue,
  label = "Price",
  className = "",
}: PriceEditorProps) {
  const [price, setPrice] = useState<string>(initialPrice.toFixed(precision))
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartY, setDragStartY] = useState(0)
  const [dragStartValue, setDragStartValue] = useState(0)

  // Update local state when initialPrice changes
  useEffect(() => {
    if (!isDragging) {
      setPrice(initialPrice.toFixed(precision))
    }
  }, [initialPrice, precision, isDragging])

  // Handle manual input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(e.target.value)
    const numValue = Number.parseFloat(e.target.value)
    if (!isNaN(numValue)) {
      handleValueChange(numValue)
    }
  }

  // Handle blur event to format value
  const handleBlur = () => {
    const numValue = Number.parseFloat(price)
    if (isNaN(numValue)) {
      setPrice(initialPrice.toFixed(precision))
    } else {
      const validValue = constrainValue(numValue)
      setPrice(validValue.toFixed(precision))
      onChange(validValue)
    }
  }

  // Constrain value within min/max bounds
  const constrainValue = (value: number): number => {
    let newValue = value
    if (minValue !== undefined && newValue < minValue) {
      newValue = minValue
    }
    if (maxValue !== undefined && newValue > maxValue) {
      newValue = maxValue
    }
    return newValue
  }

  // Handle value change and notify parent
  const handleValueChange = useCallback(
    (newValue: number) => {
      const validValue = constrainValue(newValue)
      onChange(validValue)
    },
    [onChange],
  )

  // Handle increment/decrement
  const increment = () => {
    const numValue = Number.parseFloat(price)
    if (!isNaN(numValue)) {
      const newValue = Number.parseFloat((numValue + step).toFixed(precision))
      setPrice(newValue.toFixed(precision))
      handleValueChange(newValue)
    }
  }

  const decrement = () => {
    const numValue = Number.parseFloat(price)
    if (!isNaN(numValue)) {
      const newValue = Number.parseFloat((numValue - step).toFixed(precision))
      setPrice(newValue.toFixed(precision))
      handleValueChange(newValue)
    }
  }

  // Mouse events for draggable behavior
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStartY(e.clientY)
    setDragStartValue(Number.parseFloat(price))
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault()
      // Move up to increase, down to decrease (inverted Y)
      const delta = dragStartY - e.clientY
      // Sensitivity factor - adjust as needed
      const sensitivity = 0.5
      const newValue = dragStartValue + delta * step * sensitivity
      const rounded = Number.parseFloat(newValue.toFixed(precision))
      setPrice(rounded.toFixed(precision))
      handleValueChange(rounded)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    // Handle mouse events outside the component
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        const delta = dragStartY - e.clientY
        const sensitivity = 0.5
        const newValue = dragStartValue + delta * step * sensitivity
        const rounded = Number.parseFloat(newValue.toFixed(precision))
        setPrice(rounded.toFixed(precision))
        handleValueChange(rounded)
      }

      const handleGlobalMouseUp = () => {
        setIsDragging(false)
      }

      window.addEventListener("mousemove", handleGlobalMouseMove)
      window.addEventListener("mouseup", handleGlobalMouseUp)

      return () => {
        window.removeEventListener("mousemove", handleGlobalMouseMove)
        window.removeEventListener("mouseup", handleGlobalMouseUp)
      }
    }
  }, [isDragging, dragStartY, dragStartValue, step, precision, handleValueChange])

  return (
    <div className={`${className}`}>
      <label className="block text-sm text-gray-400 mb-1">{label}</label>
      <div className="relative">
        <div
          className={`flex items-stretch ${
            isDragging ? "cursor-ns-resize bg-blue-900/20" : "cursor-ns-resize hover:bg-gray-800"
          } rounded-md transition-colors`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <Input
            type="text"
            value={price}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className="border-0 bg-transparent focus:ring-0 text-right pr-12"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-center px-2 gap-0.5">
            <motion.button
              type="button"
              className="h-6 w-6 flex items-center justify-center text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-sm"
              onClick={(e) => {
                e.stopPropagation()
                increment()
              }}
              whileHover={{ backgroundColor: "rgba(75, 85, 99, 0.8)" }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronUp className="h-4 w-4" />
            </motion.button>
            <motion.button
              type="button"
              className="h-6 w-6 flex items-center justify-center text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-sm"
              onClick={(e) => {
                e.stopPropagation()
                decrement()
              }}
              whileHover={{ backgroundColor: "rgba(75, 85, 99, 0.8)" }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronDown className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
        {isDragging && <div className="fixed inset-0 z-50 cursor-ns-resize" onMouseUp={handleMouseUp}></div>}
        <p className="mt-1 text-xs text-gray-500">Drag up/down to adjust or use arrows</p>
      </div>
    </div>
  )
}
