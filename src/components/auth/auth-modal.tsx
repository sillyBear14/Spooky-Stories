'use client'

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultView?: 'login' | 'signup'
}

export function AuthModal({ isOpen, onClose, defaultView = 'login' }: AuthModalProps) {
  const [view, setView] = useState(defaultView)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const getUsername = (email: string) => {
    return email.split('@')[0]
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (view === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        toast.success('Welcome back to the realm of spooky stories! 🎃')
      } else {
        // First, sign up the user
        const username = getUsername(email)
        const finalDisplayName = displayName.trim() || username // Use display name if provided, otherwise use username

        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: finalDisplayName // Set in auth.users metadata
            }
          }
        })
        if (signUpError) throw signUpError

        // Then, update the profile table
        if (authData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ 
              username: username,
              display_name: finalDisplayName
            })
            .eq('id', authData.user.id)

          if (profileError) {
            console.error('Error updating profile:', profileError)
            // Don't throw here as the user is already created
          }
        }

        toast.success('Welcome to our haunted community! Check your email to confirm your account. 👻')
      }

      onClose()
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[400px] glass-card border-none"
        title={view === 'login' ? 'Welcome Back' : 'Create Account'}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 p-4"
        >
          <div className="text-center">
            <h2 className="text-2xl font-creepy spooky-text mb-2">
              {view === 'login' ? '🔮 Welcome Back' : '👻 Join Us'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {view === 'login'
                ? 'Enter the realm of spooky stories...'
                : 'Begin your journey into the supernatural...'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-secondary/50 border border-white/10 text-foreground"
                required
              />
              {view === 'signup' && email && (
                <p className="text-xs text-muted-foreground">
                  Your username will be: {getUsername(email)}
                </p>
              )}
            </div>

            {view === 'signup' && (
              <div className="space-y-2">
                <label htmlFor="displayName" className="text-sm font-medium">
                  Display Name (optional)
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-secondary/50 border border-white/10 text-foreground"
                  minLength={2}
                  maxLength={30}
                  pattern="[A-Za-z0-9_-]+" // Only allow letters, numbers, underscores, and hyphens
                  title="Display name can only contain letters, numbers, underscores, and hyphens"
                  placeholder="Leave empty to use username"
                />
                <p className="text-xs text-muted-foreground">
                  This is how you'll appear to other users
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-secondary/50 border border-white/10 text-foreground"
                required
                minLength={6}
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-primary/80 hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors backdrop-blur-sm disabled:opacity-50"
            >
              {loading ? 'Loading...' : view === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div className="text-center text-sm">
            <p className="text-muted-foreground">
              {view === 'login' ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={() => {
                  setView(view === 'login' ? 'signup' : 'login')
                  setError(null)
                }}
                className="ml-1 text-primary hover:underline"
              >
                {view === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
} 