"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { VideoModal } from "@/components/video-modal"

interface VideoModalContextType {
  openVideoModal: (videoUrl?: string) => void
  closeVideoModal: () => void
}

const VideoModalContext = createContext<VideoModalContextType>({
  openVideoModal: () => {},
  closeVideoModal: () => {},
})

export const useVideoModal = () => useContext(VideoModalContext)

interface VideoModalProviderProps {
  children: ReactNode
}

export function VideoModalProvider({ children }: VideoModalProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined)

  const openVideoModal = (url?: string) => {
    setVideoUrl(url)
    setIsOpen(true)
  }

  const closeVideoModal = () => {
    setIsOpen(false)
  }

  return (
    <VideoModalContext.Provider value={{ openVideoModal, closeVideoModal }}>
      {children}
      <VideoModal isOpen={isOpen} onClose={closeVideoModal} videoUrl={videoUrl} />
    </VideoModalContext.Provider>
  )
}
