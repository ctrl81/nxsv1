'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

export default function LoginPage() {
  const { loginWithGoogle, connectWallet, recoverAccount } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletConnect = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await connectWallet();
    } catch (err) {
      setError('Wallet connection failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecovery = async (method: 'email' | 'social') => {
    setIsLoading(true);
    setError(null);
    try {
      await recoverAccount(method);
    } catch (err) {
      setError('Account recovery failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to Nexus Trade</CardTitle>
          <CardDescription>Choose your preferred sign-in method</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
              <TabsTrigger value="recovery">Recovery</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <div className="space-y-4">
                <Button
                  className="w-full"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  Sign in with Google
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="wallet">
              <div className="space-y-4">
                <Button
                  className="w-full"
                  onClick={handleWalletConnect}
                  disabled={isLoading}
                >
                  Connect Wallet
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="recovery">
              <div className="space-y-4">
                <Button
                  className="w-full"
                  onClick={() => handleRecovery('email')}
                  disabled={isLoading}
                >
                  Recover with Email
                </Button>
                <Button
                  className="w-full"
                  onClick={() => handleRecovery('social')}
                  disabled={isLoading}
                >
                  Recover with Social
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 