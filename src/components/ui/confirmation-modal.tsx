'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { motion } from 'framer-motion'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
}

export function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }: ConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] glass-card border-none" title={title}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 p-4"
        >
          <h2 className="text-xl font-medium text-center">{title}</h2>
          <p className="text-sm text-muted-foreground text-center">{message}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-500/80 hover:bg-red-500/90 text-white rounded-lg font-medium transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-secondary/80 hover:bg-secondary/90 text-secondary-foreground rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
} 