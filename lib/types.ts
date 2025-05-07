// Trading types
export type TimeFrame = "1m" | "5m" | "15m" | "1h" | "4h" | "1d" | "1w"

export type OrderType = "market" | "limit"

export type PositionType = "long" | "short"

export type OrderStatus = "open" | "filled" | "canceled"

export type Token = "WBTC" | "ETH" | "SUI"

export type CandleData = {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export type OrderBookEntry = {
  price: number
  total: number
}

export type OrderBook = {
  bids: Array<[number, number]> // [price, size]
  asks: Array<[number, number]> // [price, size]
}

export interface Position {
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

export interface Order {
  id: string
  type: PositionType
  orderType: OrderType
  price: number
  size: number
  status: OrderStatus
  timestamp: number
}

export interface TradeHistory {
  id: string
  type: PositionType
  price: number
  size: number
  fee: number
  timestamp: number
}

// Sui blockchain specific tokens
export type WalletType = "sui" | "stashed"

export interface WalletInfo {
  address: string
  balance: Record<Token, number>
  connected: boolean
  type: string
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

export interface TradeFormData {
  type: PositionType
  orderType: OrderType
  amount: number
  leverage: number
  price?: number
  stopLoss?: number
  takeProfit?: number
}
