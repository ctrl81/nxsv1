import axios, { AxiosInstance, AxiosError } from 'axios'
import { toast } from '@/components/ui/use-toast'
import type { CandleData, OrderBook, Position, Order, TradeHistory, TradeFormData } from '@/lib/types'

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 100,
  perMinute: 1,
}

class RateLimiter {
  private timestamps: number[] = []

  canMakeRequest(): boolean {
    const now = Date.now()
    const minuteAgo = now - 60 * 1000

    // Remove timestamps older than 1 minute
    this.timestamps = this.timestamps.filter((timestamp) => timestamp > minuteAgo)

    if (this.timestamps.length >= RATE_LIMIT.maxRequests) {
      return false
    }

    this.timestamps.push(now)
    return true
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ApiClient {
  private client: AxiosInstance
  private rateLimiter: RateLimiter
  private ws: WebSocket | null = null
  private wsReconnectAttempts = 0
  private maxReconnectAttempts = 5

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.rateLimiter = new RateLimiter()

    // Add request interceptor for rate limiting
    this.client.interceptors.request.use((config) => {
      if (!this.rateLimiter.canMakeRequest()) {
        throw new ApiError('Rate limit exceeded. Please try again later.', 429, 'RATE_LIMIT_EXCEEDED')
      }
      return config
    })

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          const status = error.response.status
          const data = error.response.data as any

          switch (status) {
            case 400:
              throw new ApiError(data.message || 'Invalid request', status, 'BAD_REQUEST')
            case 401:
              throw new ApiError('Authentication required', status, 'UNAUTHORIZED')
            case 403:
              throw new ApiError('Access denied', status, 'FORBIDDEN')
            case 429:
              throw new ApiError('Rate limit exceeded', status, 'RATE_LIMIT_EXCEEDED')
            case 500:
              throw new ApiError('Internal server error', status, 'SERVER_ERROR')
            default:
              throw new ApiError(data.message || 'An error occurred', status)
          }
        }
        throw new ApiError('Network error', 0, 'NETWORK_ERROR')
      }
    )
  }

  // WebSocket connection management
  private connectWebSocket() {
    if (this.ws) {
      this.ws.close()
    }

    this.ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080')

    this.ws.onopen = () => {
      console.log('WebSocket connected')
      this.wsReconnectAttempts = 0
    }

    this.ws.onclose = () => {
      console.log('WebSocket disconnected')
      if (this.wsReconnectAttempts < this.maxReconnectAttempts) {
        this.wsReconnectAttempts++
        setTimeout(() => this.connectWebSocket(), 1000 * Math.pow(2, this.wsReconnectAttempts))
      }
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }

  // Trading API methods
  async getCandleData(symbol: string, timeframe: string): Promise<CandleData[]> {
    try {
      const response = await this.client.get(`/api/v1/market/candles/${symbol}/${timeframe}`)
      return response.data
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  async getOrderBook(symbol: string): Promise<OrderBook> {
    try {
      const response = await this.client.get(`/api/v1/market/orderbook/${symbol}`)
      return response.data
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  async executeTrade(data: TradeFormData): Promise<Position> {
    try {
      const response = await this.client.post('/api/v1/trade/execute', data)
      return response.data
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  async closePosition(positionId: string): Promise<void> {
    try {
      await this.client.post(`/api/v1/trade/close/${positionId}`)
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  async cancelOrder(orderId: string): Promise<void> {
    try {
      await this.client.post(`/api/v1/trade/cancel/${orderId}`)
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  // Error handling
  private handleError(error: unknown) {
    if (error instanceof ApiError) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    }
  }

  // WebSocket event handlers
  onCandleUpdate(callback: (data: CandleData) => void) {
    if (!this.ws) return

    this.ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'candle') {
        callback(data.payload)
      }
    })
  }

  onOrderBookUpdate(callback: (data: OrderBook) => void) {
    if (!this.ws) return

    this.ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'orderbook') {
        callback(data.payload)
      }
    })
  }

  onTradeUpdate(callback: (data: TradeHistory) => void) {
    if (!this.ws) return

    this.ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'trade') {
        callback(data.payload)
      }
    })
  }

  // Cleanup
  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080') 