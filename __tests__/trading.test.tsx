import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import { TradingProvider, useTrading } from '@/contexts/trading-context';
import { WalletProvider } from '@/contexts/wallet-context';
import { apiClient } from '@/lib/api-client';
import { vi } from 'vitest';
import type { Position, OrderBook, CandleData, TradeHistory } from '@/lib/types';

// Mock the API client
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    getCandleData: vi.fn().mockResolvedValue([]),
    getOrderBook: vi.fn().mockResolvedValue({ bids: [], asks: [] }),
    executeTrade: vi.fn(),
    closePosition: vi.fn(),
    cancelOrder: vi.fn(),
    onCandleUpdate: vi.fn(),
    onOrderBookUpdate: vi.fn(),
    onTradeUpdate: vi.fn(),
    disconnect: vi.fn(),
  },
}));

// Mock the toast component
vi.mock('@/components/ui/use-toast', () => ({
  toast: vi.fn(),
}));

// Mock the wallet context
vi.mock('@/contexts/wallet-context', () => ({
  useWallet: () => ({
    wallet: {
      connected: true,
    },
  }),
  WalletProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Test component that uses the trading context
function TestComponent() {
  const {
    executeTrade,
    closePosition,
    cancelOrder,
    isLoading,
    error,
    candleData,
    orderBook,
    currentPrice,
  } = useTrading();

  return (
    <div>
      <button
        onClick={() =>
          executeTrade({ type: 'long', orderType: 'market', amount: 100, leverage: 2 })
        }
      >
        Execute Trade
      </button>
      <button onClick={() => closePosition('test-position')}>Close Position</button>
      <button onClick={() => cancelOrder('test-order')}>Cancel Order</button>
      {isLoading && <div data-testid="loading">Loading...</div>}
      {error && <div data-testid="error-message">Error: {error}</div>}
      <div data-testid="candle-data">{JSON.stringify(candleData)}</div>
      <div data-testid="order-book">{JSON.stringify(orderBook)}</div>
      <div data-testid="current-price">{currentPrice}</div>
    </div>
  );
}

describe('Trading Context', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('should initialize with empty data', async () => {
    render(
      <WalletProvider>
        <TradingProvider>
          <TestComponent />
        </TradingProvider>
      </WalletProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });
  });

  it('should execute a trade successfully', async () => {
    const mockPosition: Position = {
      id: 'test-position',
      type: 'long',
      entryPrice: 100,
      leverage: 2,
      size: 100,
      margin: 50,
      liquidationPrice: 50,
      pnl: 0,
      pnlPercentage: 0,
      timestamp: Date.now(),
    };

    vi.mocked(apiClient.executeTrade).mockResolvedValueOnce(mockPosition);

    render(
      <WalletProvider>
        <TradingProvider>
          <TestComponent />
        </TradingProvider>
      </WalletProvider>
    );

    fireEvent.click(screen.getByText('Execute Trade'));

    await waitFor(() => {
      expect(apiClient.executeTrade).toHaveBeenCalledWith({
        type: 'long',
        orderType: 'market',
        amount: 100,
        leverage: 2,
      });
    });
  });

  it('should handle trade execution error', async () => {
    const error = new Error('Failed to execute trade');
    vi.mocked(apiClient.executeTrade).mockRejectedValueOnce(error);

    render(
      <WalletProvider>
        <TradingProvider>
          <TestComponent />
        </TradingProvider>
      </WalletProvider>
    );

    fireEvent.click(screen.getByText('Execute Trade'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Error: Failed to execute trade'
      );
    });
  });

  it('should close a position successfully', async () => {
    vi.mocked(apiClient.closePosition).mockResolvedValueOnce();

    render(
      <WalletProvider>
        <TradingProvider>
          <TestComponent />
        </TradingProvider>
      </WalletProvider>
    );

    fireEvent.click(screen.getByText('Close Position'));

    await waitFor(() => {
      expect(apiClient.closePosition).toHaveBeenCalledWith('test-position');
    });
  });

  it('should cancel an order successfully', async () => {
    vi.mocked(apiClient.cancelOrder).mockResolvedValueOnce();

    render(
      <WalletProvider>
        <TradingProvider>
          <TestComponent />
        </TradingProvider>
      </WalletProvider>
    );

    fireEvent.click(screen.getByText('Cancel Order'));

    await waitFor(() => {
      expect(apiClient.cancelOrder).toHaveBeenCalledWith('test-order');
    });
  });

  it('should handle WebSocket updates', async () => {
    const mockCandle: CandleData = {
      timestamp: Date.now(),
      open: 100,
      high: 110,
      low: 90,
      close: 105,
      volume: 1000,
    };

    const candleCallbacks: Array<(data: CandleData) => void> = [];
    vi.mocked(apiClient.onCandleUpdate).mockImplementation(callback => {
      candleCallbacks.push(callback);
      return () => {};
    });

    render(
      <WalletProvider>
        <TradingProvider>
          <TestComponent />
        </TradingProvider>
      </WalletProvider>
    );

    // Wait for initial setup to complete
    await waitFor(() => {
      expect(apiClient.onCandleUpdate).toHaveBeenCalled();
      expect(candleCallbacks.length).toBeGreaterThan(0);
    });

    // Simulate WebSocket update
    await act(async () => {
      candleCallbacks[0](mockCandle);
    });

    // Wait for and verify the update
    await waitFor(() => {
      const candleDataElement = screen.getByTestId('candle-data');
      const candleData = JSON.parse(candleDataElement.textContent || '[]');
      expect(candleData).toContainEqual(mockCandle);
      expect(screen.getByTestId('current-price')).toHaveTextContent('105');
    });
  });

  it('should initialize with market data', async () => {
    const mockCandles: CandleData[] = [
      {
        timestamp: Date.now(),
        open: 100,
        high: 110,
        low: 90,
        close: 105,
        volume: 1000,
      },
    ];

    const mockOrderBook: OrderBook = {
      bids: [[100, 10]],
      asks: [[101, 10]],
    };

    vi.mocked(apiClient.getCandleData).mockResolvedValueOnce(mockCandles);
    vi.mocked(apiClient.getOrderBook).mockResolvedValueOnce(mockOrderBook);

    render(
      <WalletProvider>
        <TradingProvider>
          <TestComponent />
        </TradingProvider>
      </WalletProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('candle-data')).toHaveTextContent(JSON.stringify(mockCandles));
      expect(screen.getByTestId('order-book')).toHaveTextContent(JSON.stringify(mockOrderBook));
      expect(screen.getByTestId('current-price')).toHaveTextContent('105');
    });
  });

  it('should handle order book updates', async () => {
    const mockOrderBook: OrderBook = {
      bids: [[100, 10]],
      asks: [[101, 10]],
    };

    const orderBookCallbacks: Array<(data: OrderBook) => void> = [];
    vi.mocked(apiClient.onOrderBookUpdate).mockImplementation(callback => {
      orderBookCallbacks.push(callback);
      return () => {};
    });

    render(
      <WalletProvider>
        <TradingProvider>
          <TestComponent />
        </TradingProvider>
      </WalletProvider>
    );

    // Wait for initial setup to complete
    await waitFor(() => {
      expect(apiClient.onOrderBookUpdate).toHaveBeenCalled();
      expect(orderBookCallbacks.length).toBeGreaterThan(0);
    });

    // Simulate WebSocket update
    await act(async () => {
      orderBookCallbacks[0](mockOrderBook);
    });

    // Wait for and verify the update
    await waitFor(() => {
      const orderBookElement = screen.getByTestId('order-book');
      const orderBookData = JSON.parse(orderBookElement.textContent || '{}');
      expect(orderBookData).toEqual(mockOrderBook);
    });
  });

  it('should handle trade history updates', async () => {
    const mockTrade: TradeHistory = {
      id: 'test-trade',
      type: 'long',
      price: 100,
      size: 10,
      timestamp: Date.now(),
      fee: 0.1,
    };

    let tradeCallback: ((data: TradeHistory) => void) | undefined;
    vi.mocked(apiClient.onTradeUpdate).mockImplementation(callback => {
      tradeCallback = callback;
      return () => {};
    });

    render(
      <WalletProvider>
        <TradingProvider>
          <TestComponent />
        </TradingProvider>
      </WalletProvider>
    );

    // Simulate WebSocket update
    if (tradeCallback) {
      tradeCallback(mockTrade);
    }

    await waitFor(() => {
      expect(apiClient.onTradeUpdate).toHaveBeenCalled();
    });
  });
});
