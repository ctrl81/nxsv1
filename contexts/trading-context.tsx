'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type {
  CandleData,
  OrderBook,
  Position,
  Order,
  TradeHistory,
  PositionType,
  OrderType,
  Token,
  TradeFormData,
} from '@/lib/types';
import { apiClient } from '@/lib/api-client';
import { useWallet } from '@/contexts/wallet-context';
import { toast } from '@/components/ui/use-toast';

interface TradingContextType {
  candleData: CandleData[];
  orderBook: OrderBook;
  positions: Position[];
  orders: Order[];
  tradeHistory: TradeHistory[];
  currentPrice: number;
  executeTrade: (data: TradeFormData) => Promise<boolean>;
  closePosition: (id: string) => Promise<boolean>;
  cancelOrder: (id: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

const TradingContext = createContext<TradingContextType>({
  candleData: [],
  orderBook: { bids: [], asks: [] },
  positions: [],
  orders: [],
  tradeHistory: [],
  currentPrice: 0,
  executeTrade: async () => false,
  closePosition: async () => false,
  cancelOrder: async () => false,
  isLoading: false,
  error: null,
});

export const useTrading = () => useContext(TradingContext);

interface TradingProviderProps {
  children: ReactNode;
}

export function TradingProvider({ children }: TradingProviderProps) {
  const { wallet } = useWallet();
  const [candleData, setCandleData] = useState<CandleData[]>([]);
  const [orderBook, setOrderBook] = useState<OrderBook>({ bids: [], asks: [] });
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize data on mount
  useEffect(() => {
    const initData = async () => {
      if (!wallet?.connected) {
        setError('Wallet not connected');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        // Fetch initial data
        const [candles, orderBookData] = await Promise.all([
          apiClient.getCandleData('SUI/USDC', '1m'),
          apiClient.getOrderBook('SUI/USDC'),
        ]);

        setCandleData(candles);
        setOrderBook(orderBookData);

        // Set current price from the latest candle
        if (candles.length > 0) {
          setCurrentPrice(candles[candles.length - 1].close);
        }

        // Set up WebSocket listeners
        apiClient.onCandleUpdate(candle => {
          setCandleData(prev => {
            const newCandles = [...prev];
            if (newCandles.length >= 100) {
              newCandles.shift(); // Remove oldest candle if we have more than 100
            }
            newCandles.push(candle);
            return newCandles;
          });
          setCurrentPrice(candle.close);
        });

        apiClient.onOrderBookUpdate(book => {
          setOrderBook(book);
        });

        apiClient.onTradeUpdate(trade => {
          setTradeHistory(prev => [trade, ...prev]);
        });

        toast({
          title: 'Connected',
          description: 'Successfully connected to trading service',
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to initialize trading data';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    initData();

    return () => {
      apiClient.disconnect();
    };
  }, [wallet?.connected]);

  // Execute a trade
  const executeTrade = async (data: TradeFormData): Promise<boolean> => {
    if (!wallet?.connected) {
      setError('Wallet not connected');
      toast({
        title: 'Error',
        description: 'Please connect your wallet to trade',
        variant: 'destructive',
      });
      return false;
    }

    setIsLoading(true);
    setError(null);
    try {
      const position = await apiClient.executeTrade(data);
      setPositions(prev => [...prev, position]);

      toast({
        title: 'Success',
        description: `${data.type.toUpperCase()} position opened successfully`,
      });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to execute trade';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Close a position
  const closePosition = async (id: string): Promise<boolean> => {
    if (!wallet?.connected) {
      setError('Wallet not connected');
      toast({
        title: 'Error',
        description: 'Please connect your wallet to trade',
        variant: 'destructive',
      });
      return false;
    }

    setIsLoading(true);
    setError(null);
    try {
      await apiClient.closePosition(id);
      setPositions(prev => prev.filter(p => p.id !== id));

      toast({
        title: 'Success',
        description: 'Position closed successfully',
      });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to close position';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel an order
  const cancelOrder = async (id: string): Promise<boolean> => {
    if (!wallet?.connected) {
      setError('Wallet not connected');
      toast({
        title: 'Error',
        description: 'Please connect your wallet to trade',
        variant: 'destructive',
      });
      return false;
    }

    setIsLoading(true);
    setError(null);
    try {
      await apiClient.cancelOrder(id);
      setOrders(prev => prev.filter(o => o.id !== id));

      toast({
        title: 'Success',
        description: 'Order cancelled successfully',
      });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel order';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TradingContext.Provider
      value={{
        candleData,
        orderBook,
        positions,
        orders,
        tradeHistory,
        currentPrice,
        executeTrade,
        closePosition,
        cancelOrder,
        isLoading,
        error,
      }}
    >
      {children}
    </TradingContext.Provider>
  );
}
