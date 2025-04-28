import type { CandleData, OrderBook, Position, Order, TradeHistory } from "./types"

// Generate mock candlestick data
export const generateMockCandleData = (days = 3, interval = 60 * 60 * 1000): CandleData[] => {
  const now = new Date().getTime()
  const data: CandleData[] = []
  let lastClose = 128 + Math.random() * 4

  for (let i = days * 24 * 60 * 60 * 1000; i > 0; i -= interval) {
    const time = now - i
    const open = lastClose
    const close = open * (1 + (Math.random() - 0.5) * 0.05)
    const high = Math.max(open, close) * (1 + Math.random() * 0.03)
    const low = Math.min(open, close) * (1 - Math.random() * 0.03)
    const volume = Math.random() * 100 + 50

    data.push({
      time,
      open,
      high,
      low,
      close,
      volume,
    })

    lastClose = close
  }

  return data
}

// Generate mock order book data
export const generateMockOrderBook = (): OrderBook => {
  const currentPrice = 150.99
  const bids: { price: number; total: number }[] = []
  const asks: { price: number; total: number }[] = []

  // Generate bids (buy orders)
  for (let i = 0; i < 12; i++) {
    const price = Number.parseFloat((currentPrice * (1 - 0.001 * (i + 1))).toFixed(2))
    const total = Number.parseFloat((Math.random() * 15 + 5).toFixed(2))
    bids.push({ price, total })
  }

  // Generate asks (sell orders)
  for (let i = 0; i < 12; i++) {
    const price = Number.parseFloat((currentPrice * (1 + 0.001 * (i + 1))).toFixed(2))
    const total = Number.parseFloat((Math.random() * 15 + 5).toFixed(2))
    asks.push({ price, total })
  }

  // Sort bids in descending order (highest price first)
  bids.sort((a, b) => b.price - a.price)

  // Sort asks in ascending order (lowest price first)
  asks.sort((a, b) => a.price - b.price)

  return { bids, asks }
}

// Sui blockchain trading pairs
export const suiTradingPairs = [
  {
    id: "sui-usdc",
    baseAsset: "SUI",
    quoteAsset: "USDC",
    price: 1.45,
    change24h: 3.2,
    volume24h: 125000000,
    baseAssetLogo: "/images/icons/sui.png",
  },
  {
    id: "weth-usdc",
    baseAsset: "WETH",
    quoteAsset: "USDC",
    price: 3120.75,
    change24h: 1.5,
    volume24h: 78000000,
  },
  {
    id: "wbtc-usdc",
    baseAsset: "WBTC",
    quoteAsset: "USDC",
    price: 64250.5,
    change24h: 2.3,
    volume24h: 125000000,
  },
  {
    id: "cetus-usdc",
    baseAsset: "CETUS",
    quoteAsset: "USDC",
    price: 0.085,
    change24h: 5.1,
    volume24h: 45000000,
  },
  {
    id: "turbos-usdc",
    baseAsset: "TURBOS",
    quoteAsset: "USDC",
    price: 0.12,
    change24h: -1.2,
    volume24h: 32000000,
  },
  {
    id: "aft-usdc",
    baseAsset: "AFT",
    quoteAsset: "USDC",
    price: 0.035,
    change24h: 7.5,
    volume24h: 18000000,
  },
  {
    id: "sui-usdt",
    baseAsset: "SUI",
    quoteAsset: "USDT",
    price: 1.46,
    change24h: 3.1,
    volume24h: 95000000,
    baseAssetLogo: "/images/icons/sui.png",
  },
  {
    id: "weth-sui",
    baseAsset: "WETH",
    quoteAsset: "SUI",
    price: 2150.25,
    change24h: -0.8,
    volume24h: 42000000,
  },
  {
    id: "cetus-sui",
    baseAsset: "CETUS",
    quoteAsset: "SUI",
    price: 0.058,
    change24h: 4.2,
    volume24h: 28000000,
  },
]

// Mock positions data
export const mockPositions: Position[] = []

// Mock open orders data
export const mockOrders: Order[] = []

// Mock trade history data
export const mockTradeHistory: TradeHistory[] = []
