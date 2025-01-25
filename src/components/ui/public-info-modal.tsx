'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { motion } from 'framer-motion'

interface PublicInfoModalProps {
  isOpen: boolean
  onClose: () => void
  author: {
    username: string
    avatar_url: string | null
    bio: string | null
  }
}

export function PublicInfoModal({ isOpen, onClose, author }: PublicInfoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] glass-card border-none" title="Author Information">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 p-4"
        >
          <div className="flex flex-col items-center">
            <img
              src={author.avatar_url || '/default-avatar.png'}
              alt="Author avatar"
              className="w-16 h-16 rounded-full mb-2"
            />
            <h2 className="text-xl font-medium">{author.username}</h2>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            {author.bio || 'No bio available yet.'}
          </p>
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary/80 hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
} 