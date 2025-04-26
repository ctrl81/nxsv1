"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useVideoModal } from "@/contexts/video-modal-context"

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { openVideoModal } = useVideoModal()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const menuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    closed: {
      opacity: 0,
      x: -20,
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  }

  return (
    <div className="md:hidden">
      <motion.button
        onClick={toggleMenu}
        className="text-white p-2"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="absolute top-16 left-0 right-0 bg-dark z-50 shadow-lg overflow-hidden"
          >
            <nav className="flex flex-col space-y-4 p-4">
              <motion.div variants={itemVariants}>
                <Link
                  href="/"
                  className="text-white border-l-2 border-primary pl-2 py-2 block"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Link
                  href="/about"
                  className="text-white hover:text-primary pl-2 py-2 block"
                  onClick={() => setIsOpen(false)}
                >
                  About
                </Link>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Link
                  href="/get-connected"
                  className="text-white hover:text-primary pl-2 py-2 block"
                  onClick={() => setIsOpen(false)}
                >
                  Get connected
                </Link>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Button
                  variant="outline"
                  className="text-white border-white bg-gray-800/50 hover:bg-primary hover:text-dark hover:border-primary w-full justify-start"
                  onClick={() => {
                    openVideoModal()
                    setIsOpen(false)
                  }}
                >
                  Watch Demo
                </Button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
