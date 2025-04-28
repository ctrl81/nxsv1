import type { CandleData, Position, Order, TradeHistory, TradingPair } from "./types"

// Generate mock candle data
export function generateMockCandleData(count = 100): CandleData[] {
  const data: CandleData[] = []
  let time = Date.now() - count * 60 * 1000 // Start 'count' minutes ago
  let price = 150 + Math.random() * 10 // Start around $150

  for (let i = 0; i < count; i++) {
    const open = price
    const close = open * (1 + (Math.random() - 0.5) * 0.02) // +/- 1% change
    const high = Math.max(open, close) * (1 + Math.random() * 0.01) // Up to 0.5% higher
    const low = Math.min(open, close) * (1 - Math.random() * 0.01) // Up to 0.5% lower
    const volume = Math.random() * 100 + 50 // Random volume between 50 and 150

    data.push({
      time,
      open,
      high,
      low,
      close,
      volume,
    })

    time += 60 * 1000 // Add 1 minute
    price = close // Next candle starts at previous close
  }

  return data
}

// Sui blockchain trading pairs
export const suiTradingPairs: TradingPair[] = [
  {
    id: "sui-usdc",
    baseAsset: "SUI",
    quoteAsset: "USDC",
    price: 1.45,
    change24h: 3.2,
    volume24h: 125000000,
  },
  {
    id: "sui-usdt",
    baseAsset: "SUI",
    quoteAsset: "USDT",
    price: 1.46,
    change24h: 3.5,
    volume24h: 115000000,
  },
  {
    id: "cetus-usdc",
    baseAsset: "CETUS",
    quoteAsset: "USDC",
    price: 0.12,
    change24h: 1.8,
    volume24h: 45000000,
  },
  {
    id: "turbos-usdc",
    baseAsset: "TURBOS",
    quoteAsset: "USDC",
    price: 0.35,
    change24h: -2.1,
    volume24h: 28000000,
  },
  {
    id: "weth-usdc",
    baseAsset: "WETH",
    quoteAsset: "USDC",
    price: 3120.75,
    change24h: 1.5,
    volume24h: 780000000,
  },
  {
    id: "wbtc-usdc",
    baseAsset: "WBTC",
    quoteAsset: "USDC",
    price: 64250.5,
    change24h: 2.3,
    volume24h: 1250000000,
  },
  {
    id: "aft-usdc",
    baseAsset: "AFT",
    quoteAsset: "USDC",
    price: 0.08,
    change24h: 5.7,
    volume24h: 18000000,
  },
]

// Generate mock order book data
export function generateMockOrderBook(currentPrice: number, depth = 20) {
  const asks = []
  const bids = []

  // Generate asks (sell orders) - higher than current price
  let askPrice = currentPrice * 1.001 // Start 0.1% above current price
  for (let i = 0; i < depth; i++) {
    const size = Math.random() * 10 + 0.5 // Random size between 0.5 and 10.5
    asks.push({
      price: askPrice,
      size,
      total: size * askPrice,
    })
    askPrice *= 1.001 // Increase by 0.1% for each level
  }

  // Generate bids (buy orders) - lower than current price
  let bidPrice = currentPrice * 0.999 // Start 0.1% below current price
  for (let i = 0; i < depth; i++) {
    const size = Math.random() * 10 + 0.5 // Random size between 0.5 and 10.5
    bids.push({
      price: bidPrice,
      size,
      total: size * bidPrice,
    })
    bidPrice *= 0.999 // Decrease by 0.1% for each level
  }

  // Sort asks ascending, bids descending
  asks.sort((a, b) => a.price - b.price)
  bids.sort((a, b) => b.price - a.price)

  return { asks, bids }
}

// Mock positions data
export const mockPositions: Position[] = []

// Mock open orders data
export const mockOrders: Order[] = []

// Mock trade history data
export const mockTradeHistory: TradeHistory[] = []
