'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <h1 className="font-creepy text-8xl spooky-text mb-4">
          👻 404
        </h1>
        <h2 className="text-2xl font-creepy spooky-text">
          Lost in the Shadows
        </h2>
        <p className="text-lg text-muted-foreground max-w-[500px] mb-8">
          The page you seek has vanished into the ethereal void... 
          Perhaps it was merely a figment of your imagination?
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-primary/80 hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors backdrop-blur-sm"
        >
          Escape to Safety
        </Link>
      </motion.div>
      <div className="fixed inset-0 fog-overlay pointer-events-none" />
      
      {/* Floating ghosts */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="fixed top-1/4 left-1/4 text-6xl opacity-30"
      >
        👻
      </motion.div>
      <motion.div
        animate={{
          y: [0, 20, 0],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="fixed bottom-1/4 right-1/3 text-7xl opacity-20"
      >
        👻
      </motion.div>
    </div>
  )
} 