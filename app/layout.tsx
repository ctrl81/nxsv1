import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { WalletProvider } from "@/contexts/wallet-context"
import { TradingProvider } from "@/contexts/trading-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Nexus Trade - Onchain Derivatives Built Differently",
  description:
    "Nexus Trade combines decentralized perpetual trading with social dynamics, empowering traders to connect and thrive.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>
          <TradingProvider>{children}</TradingProvider>
        </WalletProvider>
      </body>
    </html>
  )
}
