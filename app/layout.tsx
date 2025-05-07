import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { VideoModalProvider } from '@/contexts/video-modal-context';
import { WalletProvider } from '@/contexts/wallet-context';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/auth/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nexus Trade | Decentralized Perpetual Exchange',
  description:
    'Trade on the fastest decentralized perpetual exchange with low fees and high leverage.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/images/logo.png', type: 'image/png' },
    ],
    apple: { url: '/images/logo.png', type: 'image/png' },
  },
  generator: 'v0.dev',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <WalletProvider>
            <VideoModalProvider>
              {children}
              <Toaster />
            </VideoModalProvider>
          </WalletProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
