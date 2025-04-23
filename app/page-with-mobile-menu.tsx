import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MobileMenu } from "@/components/mobile-menu"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="bg-dark py-4 px-4 md:px-12">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="Nexus Trade Logo"
              width={40}
              height={40}
              className="h-8 w-auto md:h-10"
            />
          </Link>

          {/* Mobile Menu */}
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <Button size="sm" className="bg-cta-blue text-dark hover:bg-primary text-xs">
                Connect Wallet
              </Button>
            </div>
            <MobileMenu />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-white border-b-2 border-primary pb-1">
              Home
            </Link>
            <Link href="/about" className="text-white hover:text-primary">
              About
            </Link>
            <Link href="/get-connected" className="text-white hover:text-primary">
              Get connected
            </Link>
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden md:flex space-x-4">
            <Button className="bg-cta-blue text-dark hover:bg-primary">Connect SUI Wallet</Button>
            <Button variant="outline" className="text-white border-white hover:bg-secondary">
              Watch Demo
            </Button>
          </div>
        </div>
      </header>

      {/* Rest of the content remains the same as in the updated page.tsx */}
      {/* ... */}
    </main>
  )
}
