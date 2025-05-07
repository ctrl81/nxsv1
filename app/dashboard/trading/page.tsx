'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChangeEvent, useState } from 'react';

interface TradingPair {
  id: string;
  name: string;
  price: number;
}

const tradingPairs: TradingPair[] = [
  { id: 'BTC/USDC', name: 'Bitcoin/USDC', price: 50000 },
  { id: 'ETH/USDC', name: 'Ethereum/USDC', price: 3000 },
  { id: 'SOL/USDC', name: 'Solana/USDC', price: 100 },
];

export default function TradingPage() {
  const [selectedPair, setSelectedPair] = useState<string>('');
  const [leverage, setLeverage] = useState<string>('1');
  const [margin, setMargin] = useState<string>('');
  const [orderType, setOrderType] = useState<'long' | 'short'>('long');
  const [isLoading, setIsLoading] = useState(false);

  const handleTrade = async () => {
    setIsLoading(true);
    try {
      // Implement trading logic here
      console.log('Trading:', {
        pair: selectedPair,
        leverage: Number(leverage),
        margin: Number(margin),
        type: orderType,
      });
    } catch (error) {
      console.error('Trading failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Place Order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Trading Pair</Label>
            <Select value={selectedPair} onValueChange={setSelectedPair}>
              <SelectTrigger>
                <SelectValue placeholder="Select trading pair" />
              </SelectTrigger>
              <SelectContent>
                {tradingPairs.map((pair) => (
                  <SelectItem key={pair.id} value={pair.id}>
                    {pair.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Leverage</Label>
            <Select value={leverage} onValueChange={setLeverage}>
              <SelectTrigger>
                <SelectValue placeholder="Select leverage" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 5, 10, 20, 50].map((value) => (
                  <SelectItem key={value} value={value.toString()}>
                    {value}x
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Margin Amount (USDC)</Label>
            <Input
              type="number"
              value={margin}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setMargin(e.target.value)}
              placeholder="Enter margin amount"
            />
          </div>

          <div className="flex gap-4">
            <Button
              className="flex-1"
              variant={orderType === 'long' ? 'default' : 'outline'}
              onClick={() => setOrderType('long')}
            >
              Long
            </Button>
            <Button
              className="flex-1"
              variant={orderType === 'short' ? 'default' : 'outline'}
              onClick={() => setOrderType('short')}
            >
              Short
            </Button>
          </div>

          <Button
            className="w-full"
            onClick={handleTrade}
            disabled={!selectedPair || !margin || isLoading}
          >
            {isLoading ? 'Processing...' : 'Place Order'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Position Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Entry Price</Label>
              <div className="text-lg font-semibold">
                {selectedPair
                  ? tradingPairs.find((p) => p.id === selectedPair)?.price
                  : '-'}
              </div>
            </div>
            <div>
              <Label>Liquidation Price</Label>
              <div className="text-lg font-semibold">
                {selectedPair && margin && leverage
                  ? calculateLiquidationPrice(
                      Number(margin),
                      Number(leverage),
                      orderType
                    )
                  : '-'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Position Size</Label>
              <div className="text-lg font-semibold">
                {margin && leverage
                  ? `${Number(margin) * Number(leverage)} USDC`
                  : '-'}
              </div>
            </div>
            <div>
              <Label>Fees</Label>
              <div className="text-lg font-semibold">
                {margin ? `${Number(margin) * 0.001} USDC` : '-'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function calculateLiquidationPrice(
  margin: number,
  leverage: number,
  type: 'long' | 'short'
): string {
  // This is a simplified calculation
  const positionSize = margin * leverage;
  const liquidationThreshold = 0.5; // 50% of margin
  const liquidationPrice =
    type === 'long'
      ? positionSize * (1 - liquidationThreshold)
      : positionSize * (1 + liquidationThreshold);
  return `${liquidationPrice.toFixed(2)} USDC`;
} 