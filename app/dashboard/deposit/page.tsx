'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChangeEvent, useState } from 'react';

export default function DepositPage() {
  const [amount, setAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeposit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Implement deposit logic here
      console.log('Depositing:', {
        amount: Number(amount),
      });
    } catch (error) {
      setError('Deposit failed. Please try again.');
      console.error('Deposit failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Deposit USDC</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Amount (USDC)</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
              placeholder="Enter amount to deposit"
            />
          </div>

          <div className="space-y-2">
            <Label>Estimated Fees</Label>
            <div className="text-sm text-muted-foreground">
              Network fee: ~0.001 USDC
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleDeposit}
            disabled={!amount || isLoading}
          >
            {isLoading ? 'Processing...' : 'Deposit'}
          </Button>

          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <p>Note: Deposits are processed on the Sui network.</p>
            <p>Make sure you have sufficient USDC in your wallet.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 