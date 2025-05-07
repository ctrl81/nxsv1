'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from 'react';

interface Trade {
  id: string;
  pair: string;
  type: 'long' | 'short';
  entryPrice: number;
  exitPrice: number;
  size: number;
  pnl: number;
  timestamp: string;
}

const mockTrades: Trade[] = [
  {
    id: '1',
    pair: 'BTC/USDC',
    type: 'long',
    entryPrice: 50000,
    exitPrice: 51000,
    size: 1000,
    pnl: 100,
    timestamp: '2024-03-20 10:00:00',
  },
  {
    id: '2',
    pair: 'ETH/USDC',
    type: 'short',
    entryPrice: 3000,
    exitPrice: 2900,
    size: 500,
    pnl: 50,
    timestamp: '2024-03-20 11:00:00',
  },
];

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    setIsLoading(true);
    try {
      // Implement export logic here
      console.log('Exporting trade history...');
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPnl = mockTrades.reduce((sum, trade) => sum + trade.pnl, 0);
  const winRate = mockTrades.filter((trade) => trade.pnl > 0).length / mockTrades.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalPnl > 0 ? '+' : ''}
              {totalPnl.toFixed(2)} USDC
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(winRate * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTrades.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Trade History</CardTitle>
          <Button onClick={handleExport} disabled={isLoading}>
            {isLoading ? 'Exporting...' : 'Export'}
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Pair</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Entry Price</TableHead>
                <TableHead>Exit Price</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>P&L</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTrades.map((trade) => (
                <TableRow key={trade.id}>
                  <TableCell>{trade.timestamp}</TableCell>
                  <TableCell>{trade.pair}</TableCell>
                  <TableCell
                    className={
                      trade.type === 'long' ? 'text-green-600' : 'text-red-600'
                    }
                  >
                    {trade.type.toUpperCase()}
                  </TableCell>
                  <TableCell>{trade.entryPrice}</TableCell>
                  <TableCell>{trade.exitPrice}</TableCell>
                  <TableCell>{trade.size} USDC</TableCell>
                  <TableCell
                    className={
                      trade.pnl > 0 ? 'text-green-600' : 'text-red-600'
                    }
                  >
                    {trade.pnl > 0 ? '+' : ''}
                    {trade.pnl.toFixed(2)} USDC
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 