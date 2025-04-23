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
  pnl: number
  pnlPercentage: number
  timestamp: number
}

export type Order = {
  id: string
  type: OrderType
  positionType: PositionType
  price: number
  size: number
  filled: number
  status: "open" | "filled" | "canceled"
  timestamp: number
}

export type TradeHistory = {
  id: string
  type: PositionType
  price: number
  size: number
  fee: number
  timestamp: number
}

export type Token = "WBTC" | "ETH" | "SUI"

export type WalletType = "sui" | "stashed"

export type WalletInfo = {
  address: string
  balance: {
    [key in Token]?: number
  }
  connected: boolean
  type: WalletType
}
