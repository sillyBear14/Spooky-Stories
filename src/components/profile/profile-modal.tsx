'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Database } from '@/types/database'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type Profile = Database['public']['Tables']['profiles']['Row']

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isChangingEmail, setIsChangingEmail] = useState(false)
  const [showEmailSteps, setShowEmailSteps] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [editingField, setEditingField] = useState<'username' | 'bio' | null>(null)
  const [newUsername, setNewUsername] = useState('')
  const [newBio, setNewBio] = useState('')
  const supabase = createClient()

  const fetchProfile = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailChange = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase.auth.updateUser({ email: newEmail })
      
      if (error) throw error
      
      toast.success('Check your new email for a confirmation link! 📧')
      setShowEmailSteps(true)
      setIsChangingEmail(false)
      setNewEmail('')
    } catch (error) {
      console.error('Error updating email:', error)
      toast.error('Failed to update email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleUsernameChange = async () => {
    if (!user || !newUsername || newUsername.length < 3) {
      toast.error('Username must be at least 3 characters long')
      return
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(newUsername)) {
      toast.error('Username can only contain letters, numbers, underscores, and hyphens')
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase
        .from('profiles')
        .update({ username: newUsername })
        .eq('id', user.id)

      if (error) {
        if (error.code === '23505') { // Unique constraint error
          throw new Error('This username is already taken')
        }
        throw error
      }

      toast.success('Username updated successfully! 👻')
      setEditingField(null)
      fetchProfile() // Refresh profile data
    } catch (error) {
      console.error('Error updating username:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update username')
    } finally {
      setLoading(false)
    }
  }

  const handleBioChange = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { error } = await supabase
        .from('profiles')
        .update({ bio: newBio.trim() })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Bio updated successfully! 📝')
      setEditingField(null)
      fetchProfile() // Refresh profile data
    } catch (error) {
      console.error('Error updating bio:', error)
      toast.error('Failed to update bio')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      toast.error('Please select a JPG, PNG, or WebP image')
      return
    }

    // Validate file size
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error(`File size must be less than 5MB (your file: ${(file.size / 1024 / 1024).toFixed(1)}MB)`)
      return
    }

    try {
      setLoading(true)
      const { uploadAvatar } = await import('@/lib/upload-avatar')
      await uploadAvatar(supabase, user.id, file)
      
      toast.success('Avatar updated successfully! 🖼️')
      fetchProfile() // Refresh profile data
    } catch (error) {
      console.error('Error updating avatar:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update avatar')
    } finally {
      setLoading(false)
    }
  }

  // Start editing with current value
  const startEditing = (field: 'username' | 'bio') => {
    setEditingField(field)
    if (field === 'username') {
      setNewUsername(profile?.username || '')
    } else if (field === 'bio') {
      setNewBio(profile?.bio || '')
    }
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingField(null)
    setNewUsername('')
    setNewBio('')
  }

  // Fetch profile data when modal opens and user exists
  useEffect(() => {
    if (isOpen && user) {
      fetchProfile()
    }
  }, [isOpen, user])

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[425px] glass-card border-none"
        title="Your Profile"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 p-4"
        >
          <div className="text-center">
            <h2 className="text-2xl font-creepy spooky-text mb-2">
              👻 Your Haunted Profile
            </h2>
            <p className="text-sm text-muted-foreground">
              View your spectral presence in our realm
            </p>
          </div>

          <div className="space-y-4">
            {/* Avatar upload */}
            <div className="relative w-24 h-24 mx-auto">
              <div className={cn(
                "w-full h-full rounded-full bg-secondary/50 border border-white/10 overflow-hidden group",
                loading && "opacity-50"
              )}>
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Profile avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-3xl">👻</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <label
                    htmlFor="avatar-upload"
                    className="cursor-pointer text-xs text-center px-2"
                  >
                    Click to change
                  </label>
                </div>
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 p-1 rounded-full bg-primary/80 hover:bg-primary/90 cursor-pointer transition-colors"
              >
                📷
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  disabled={loading}
                  className="hidden"
                />
              </label>
              <div className="text-xs text-muted-foreground text-center mt-2 space-y-1">
                <p>Accepted formats: JPG, PNG, WebP</p>
                <p>Maximum size: 5MB</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Username</label>
                {!editingField && (
                  <button
                    onClick={() => startEditing('username')}
                    className="text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    Change
                  </button>
                )}
              </div>
              {editingField === 'username' ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Enter new username"
                    className="w-full px-3 py-2 rounded-md bg-secondary/50 border border-white/10 text-foreground"
                    minLength={3}
                    pattern="[A-Za-z0-9_-]+"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleUsernameChange}
                      disabled={loading}
                      className="flex-1 px-3 py-2 bg-primary/80 hover:bg-primary/90 text-primary-foreground rounded-md font-medium transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update'}
                    </button>
                    <button
                      onClick={cancelEditing}
                      disabled={loading}
                      className="px-3 py-2 bg-secondary/80 hover:bg-secondary/90 text-secondary-foreground rounded-md font-medium transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Username must be at least 3 characters and can only contain letters, numbers, underscores, and hyphens.
                  </p>
                </div>
              ) : (
                <p className="px-3 py-2 rounded-md bg-secondary/50 border border-white/10">
                  {loading ? 'Loading...' : profile?.username}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Display Name</label>
              <p className="px-3 py-2 rounded-md bg-secondary/50 border border-white/10">
                {loading ? 'Loading...' : (profile?.display_name || profile?.username)}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Email</label>
                {!showEmailSteps && !editingField && (
                  <button
                    onClick={() => setIsChangingEmail(!isChangingEmail)}
                    className="text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    {isChangingEmail ? 'Cancel' : 'Change'}
                  </button>
                )}
              </div>
              {isChangingEmail ? (
                <div className="space-y-2">
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter new email"
                    className="w-full px-3 py-2 rounded-md bg-secondary/50 border border-white/10 text-foreground"
                  />
                  <button
                    onClick={handleEmailChange}
                    disabled={loading}
                    className="w-full px-3 py-2 bg-primary/80 hover:bg-primary/90 text-primary-foreground rounded-md font-medium transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Email'}
                  </button>
                  <p className="text-xs text-muted-foreground">
                    You'll receive confirmation emails at both addresses.
                  </p>
                </div>
              ) : showEmailSteps ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4 p-4 rounded-md bg-secondary/50 border border-white/10"
                >
                  <h3 className="font-medium text-sm">📧 Email Change Process:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Check your <strong>new email</strong> for a confirmation link</li>
                    <li>Your <strong>current email</strong> will receive a notification</li>
                    <li>Click the confirmation link in the <strong>new email</strong></li>
                    <li>Sign in again with your new email</li>
                  </ol>
                  <p className="text-xs text-muted-foreground">
                    Note: Your email won't change until you confirm it through the link.
                  </p>
                  <button
                    onClick={() => setShowEmailSteps(false)}
                    className="w-full px-3 py-2 bg-primary/80 hover:bg-primary/90 text-primary-foreground rounded-md font-medium transition-colors"
                  >
                    Got it!
                  </button>
                </motion.div>
              ) : (
                <p className="px-3 py-2 rounded-md bg-secondary/50 border border-white/10">
                  {user.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Bio</label>
                {!editingField && (
                  <button
                    onClick={() => startEditing('bio')}
                    className="text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    {profile?.bio ? 'Edit' : 'Add'}
                  </button>
                )}
              </div>
              {editingField === 'bio' ? (
                <div className="space-y-2">
                  <textarea
                    value={newBio}
                    onChange={(e) => setNewBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="w-full px-3 py-2 rounded-md bg-secondary/50 border border-white/10 text-foreground min-h-[100px] resize-none"
                    maxLength={500}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleBioChange}
                      disabled={loading}
                      className="flex-1 px-3 py-2 bg-primary/80 hover:bg-primary/90 text-primary-foreground rounded-md font-medium transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update'}
                    </button>
                    <button
                      onClick={cancelEditing}
                      disabled={loading}
                      className="px-3 py-2 bg-secondary/80 hover:bg-secondary/90 text-secondary-foreground rounded-md font-medium transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    {newBio.length}/500 characters
                  </p>
                </div>
              ) : (
                <p className="px-3 py-2 rounded-md bg-secondary/50 border border-white/10 min-h-[60px]">
                  {loading ? 'Loading...' : (profile?.bio || 'No bio yet...')}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Link
                href="/write"
                className="w-full px-4 py-2 bg-green-500/80 hover:bg-green-500/90 text-white rounded-lg font-medium transition-colors backdrop-blur-sm flex items-center justify-center gap-2"
                onClick={onClose}
              >
                ✍️ Write a Story
              </Link>
              <Link
                href="/my-stories"
                className="w-full px-4 py-2 bg-blue-500/80 hover:bg-blue-500/90 text-white rounded-lg font-medium transition-colors backdrop-blur-sm flex items-center justify-center gap-2"
                onClick={onClose}
              >
                📚 My Stories
              </Link>
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-primary/80 hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors backdrop-blur-sm"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
} 