'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { AuthModal } from '../auth/auth-modal'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export function Header() {
  const { user } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const supabase = createClient()

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success('Farewell, brave soul! Until we meet again... 👋')
    } catch (error) {
      toast.error('Failed to sign out. The spirits are restless...')
    }
  }

  return (
    <header className="border-b border-white/10 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-creepy spooky-text">
          🏚️ Spooky Stories
        </Link>

        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link href="/write" className="text-sm hover:text-primary transition-colors">
                Write Story
              </Link>
              <div className="flex items-center gap-4">
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-muted-foreground"
                >
                  Welcome, {user.user_metadata.display_name || 'Ghost Writer'} 👻
                </motion.span>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-red-500 hover:text-red-400 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAuthModal(true)}
                className="text-sm hover:text-primary transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setShowAuthModal(true)
                }}
                className="px-4 py-2 bg-primary/80 hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors backdrop-blur-sm"
              >
                Start Writing
              </button>
            </div>
          )}
        </nav>

        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
          defaultView={user ? 'login' : 'signup'} 
        />
      </div>
    </header>
  )
} 