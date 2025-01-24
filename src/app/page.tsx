'use client'

import { useState } from 'react'
import { AuthModal } from '@/components/auth/auth-modal'

export default function Home() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authView, setAuthView] = useState<'login' | 'signup'>('signup')

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="relative">
        <div className="ghost-float">
          <h1 className="font-creepy text-6xl spooky-text mb-8">
            Spooky Stories
          </h1>
        </div>
        <p className="text-lg text-muted-foreground text-center max-w-[500px] mb-8">
          Welcome to the darkest corner of the internet, where your nightmares come alive through words...
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              setAuthView('signup')
              setShowAuthModal(true)
            }}
            className="bg-primary/80 hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors backdrop-blur-sm"
          >
            Start Writing
          </button>
          <button
            onClick={() => {
              setAuthView('login')
              setShowAuthModal(true)
            }}
            className="bg-secondary/80 hover:bg-secondary/90 text-secondary-foreground px-6 py-3 rounded-lg font-medium transition-colors backdrop-blur-sm"
          >
            Sign In
          </button>
        </div>
      </div>
      <div className="fixed inset-0 fog-overlay pointer-events-none" />
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultView={authView}
      />
    </main>
  )
}
