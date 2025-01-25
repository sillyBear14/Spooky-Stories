'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { AuthModal } from '../auth/auth-modal'
import { ProfileModal } from '../profile/profile-modal'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Database } from '@/types/database'
import { cn } from '@/lib/utils'

type Profile = Database['public']['Tables']['profiles']['Row']

export function Header() {
  const { user } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [authView, setAuthView] = useState<'login' | 'signup'>('login')
  const [profile, setProfile] = useState<Profile | null>(null)
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

  // Fetch profile data when user changes
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (!error && data) {
          setProfile(data)
        }
      }

      fetchProfile()

      // Subscribe to realtime profile changes
      const channel = supabase
        .channel('profile-changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'profiles',
            filter: `id=eq.${user.id}`
          }, 
          (payload) => {
            setProfile(payload.new as Profile)
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [user])

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
                <motion.button 
                  onClick={() => setShowProfileModal(true)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 bg-secondary/50 group-hover:border-primary/50 transition-colors">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Profile avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-lg">👻</span>
                      </div>
                    )}
                  </div>
                  <span>
                    {profile?.display_name || profile?.username || 'Ghost Writer'}
                  </span>
                </motion.button>
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
                onClick={() => {
                  setAuthView('login')
                  setShowAuthModal(true)
                }}
                className="text-sm hover:text-primary transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthView('signup')
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
          defaultView={authView} 
        />

        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
        />
      </div>
    </header>
  )
} 