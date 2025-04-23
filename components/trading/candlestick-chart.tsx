"use client"

import { useEffect, useRef, useState } from "react"
import { createChart, type IChartApi } from "lightweight-charts"
import type { CandleData } from "@/lib/types"
import { motion } from "framer-motion"

interface CandlestickChartProps {
  data: CandleData[]
  width?: number
  height?: number
  className?: string
}

export function CandlestickChart({ data, width = 600, height = 300, className = "" }: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chart, setChart] = useState<IChartApi | null>(null)
  const [series, setSeries] = useState<any | null>(null)

  useEffect(() => {
    if (!chartContainerRef.current) return

    const handleResize = () => {
      if (chart) {
        chart.applyOptions({
          width: chartContainerRef.current?.clientWidth || width,
          height: chartContainerRef.current?.clientHeight || height,
        })
      }
    }

    const newChart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height,
      layout: {
        background: { type: "solid", color: "transparent" },
        textColor: "#d1d4dc",
      },
      grid: {
        vertLines: {
          color: "rgba(42, 46, 57, 0.5)",
        },
        horzLines: {
          color: "rgba(42, 46, 57, 0.5)",
        },
      },
      timeScale: {
        borderColor: "rgba(42, 46, 57, 0.8)",
        timeVisible: true,
      },
      crosshair: {
        mode: 0,
      },
      rightPriceScale: {
        borderColor: "rgba(42, 46, 57, 0.8)",
      },
    })

    const newSeries = newChart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    })

    const formattedData = data.map((candle) => ({
      time: Math.floor(candle.time / 1000),
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }))

    newSeries.setData(formattedData)
    newChart.timeScale().fitContent()

    setChart(newChart)
    setSeries(newSeries)

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (newChart) {
        newChart.remove()
      }
    }
  }, [data, height, width])

  useEffect(() => {
    if (series && data.length > 0) {
      const formattedData = data.map((candle) => ({
        time: Math.floor(candle.time / 1000),
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      }))

      series.setData(formattedData)
      if (chart) {
        chart.timeScale().fitContent()
      }
    }
  }, [data, series, chart])

  return (
    <motion.div
      ref={chartContainerRef}
      className={`w-full ${className}`}
      style={{ height }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    />
  )
}
