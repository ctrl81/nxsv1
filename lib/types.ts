// Trading types
export type TimeFrame = "1m" | "5m" | "15m" | "1h" | "4h" | "1d" | "1w"

export type OrderType = "market" | "limit"

export type PositionType = "long" | "short"

export type CandleData = {
  time: number
  open: number
  high: number
  close: number
  low: number
  volume: number
}

export type OrderBookEntry = {
  price: number
  total: number
}

export type OrderBook = {
  bids: OrderBookEntry[]
  asks: OrderBookEntry[]
}

export type Position = {
  id: string
  type: PositionType
  entryPrice: number
  leverage: number
  size: number
  margin: number
  liquidationPrice: number
  stopLoss?: number
  takeProfit?: number
  pnl: number
  pnlPercentage: number
  timestamp: number
  _shouldClose?: boolean
  _closeReason?: string | null
}

export type Order = {
  id: string
  type: OrderType
  positionType: PositionType
  price: number
  size: number
  leverage?: number
  stopLoss?: number
  takeProfit?: number
  filled: number
  status: "open" | "filled" | "canceled"
  timestamp: number
  filledAt?: number
}

export type TradeHistory = {
  id: string
  type: PositionType
  price: number
  size: number
  fee: number
  timestamp: number
  action?: "open" | "close"
  pnl?: number
  reason?: string
}

// Sui blockchain specific tokens
export type Token = "SUI" | "USDC" | "USDT" | "WETH" | "WBTC" | "CETUS" | "TURBOS" | "AFT"

export type WalletType = "sui" | "stashed"

export type WalletInfo = {
  address: string
  balance: {
    [key in Token]?: number
  }
  connected: boolean
  type: WalletType
}

export type TradingViewTimeFrame = "1" | "5" | "15" | "60" | "240" | "D" | "W"

export type TradingPair = {
  id: string
  baseAsset: string
  quoteAsset: string
  price: number
  change24h: number
  volume24h: number
  baseAssetLogo?: string
}

export type PriceAlertCondition = "above" | "below"

export type PriceAlert = {
  id: string
  pair: string
  price: number
  condition: PriceAlertCondition
  createdAt: Date
  isActive: boolean
}
