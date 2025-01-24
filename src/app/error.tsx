'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <h1 className="font-creepy text-8xl spooky-text mb-4">
          ⚰️ 500
        </h1>
        <h2 className="text-2xl font-creepy spooky-text">
          A Dark Force Has Emerged
        </h2>
        <p className="text-lg text-muted-foreground max-w-[500px] mb-8">
          Something wicked this way came... Our servers have encountered a supernatural disturbance.
        </p>
        <div className="space-x-4">
          <button
            onClick={reset}
            className="inline-block px-6 py-3 bg-primary/80 hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors backdrop-blur-sm"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-muted/80 hover:bg-muted/90 text-muted-foreground rounded-lg font-medium transition-colors backdrop-blur-sm"
          >
            Return Home
          </Link>
        </div>
      </motion.div>

      {/* Animated cobwebs */}
      <motion.div
        animate={{
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="fixed top-0 left-0 w-32 h-32 opacity-20 cobweb"
      />
      <motion.div
        animate={{
          rotate: [0, -5, 5, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="fixed top-0 right-0 w-32 h-32 opacity-20 cobweb"
      />
      
      {/* Fog overlay */}
      <div className="fixed inset-0 fog-overlay pointer-events-none" />
    </div>
  )
} 