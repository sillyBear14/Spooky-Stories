'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface AIHelperProps {
  storySoFar: string
  onSuggestion: (suggestion: string) => void
  category?: string
}

export function AIHelper({ storySoFar, onSuggestion, category }: AIHelperProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleAIRequest = async () => {
    if (!storySoFar) {
      toast.error('Please start writing your story first! 📝')
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/deepseek', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: storySoFar,
          category: category
        })
      })

      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error)
      
      onSuggestion(data.suggestion)
      toast.success('💀 A spooky suggestion has materialized!')
      
    } catch (err) {
      console.error('Generation failed:', err)
      toast.error('The spirits are restless... Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div 
      className="ai-helper-section mt-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Button
        onClick={handleAIRequest}
        disabled={isLoading}
        className="w-full bg-purple-900/80 hover:bg-purple-800/90 text-white"
      >
        {isLoading ? '🧙‍♂️ Conjuring Dark Ideas...' : '🔮 Summon DeepSeek Help'}
      </Button>
    </motion.div>
  )
} 