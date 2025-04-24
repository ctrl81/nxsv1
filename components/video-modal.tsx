"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  videoUrl?: string
}

export function VideoModal({
  isOpen,
  onClose,
  videoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ",
}: VideoModalProps) {
  const [isMounted, setIsMounted] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Handle mounting on client side only
  useEffect(() => {
    setIsMounted(true)

    // Add event listener to close modal on ESC key
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEsc)
      // Prevent scrolling when modal is open
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = "auto"
    }
  }, [isOpen, onClose])

  // Handle click outside to close
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose()
    }
  }

  if (!isMounted) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleOverlayClick}
        >
          <motion.div
            className="relative w-full max-w-4xl bg-dark rounded-lg overflow-hidden border border-gray-800"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
              onClick={onClose}
              aria-label="Close video"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="aspect-video w-full">
              <iframe
                src={videoUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Nexus Trade Demo Video"
              ></iframe>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
