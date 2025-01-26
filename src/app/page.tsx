/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { PublicInfoModal } from '@/components/ui/public-info-modal'
import { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type Story = Database['public']['Tables']['stories']['Row']

type StoryWithAuthor = Omit<Story, 'author_id'> & {
  author: Pick<Profile, 'username' | 'avatar_url' | 'bio'>
}

// Type that exactly matches our query structure
type StoryPreview = {
  id: string
  title: string
  content: string
  created_at: string
  author: {
    username: string
    avatar_url: string | null
    bio: string | null
  }
}

function isValidStoryPreview(story: unknown): story is StoryWithAuthor {
  if (!story || typeof story !== 'object') return false
  
  const s = story as any
  return (
    typeof s.id === 'string' &&
    typeof s.title === 'string' &&
    typeof s.content === 'string' &&
    typeof s.created_at === 'string' &&
    typeof s.author === 'object' &&
    s.author !== null &&
    typeof s.author.username === 'string' &&
    (s.author.avatar_url === null || typeof s.author.avatar_url === 'string') &&
    (s.author.bio === null || typeof s.author.bio === 'string')
  )
}

export default function HomePage() {
  const [stories, setStories] = useState<StoryPreview[]>([])
  const [loading, setLoading] = useState(true)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [selectedAuthor, setSelectedAuthor] = useState<StoryPreview['author'] | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const { data, error } = await supabase
          .from('stories')
          .select(`
            id,
            title,
            content,
            created_at,
            author:profiles (
              username,
              avatar_url,
              bio
            )
          `)
          .eq('visibility', 'public')
          .order('created_at', { ascending: false })
          .limit(5)

        if (error) throw error

        // @ts-ignore -- Type assertion is safe because we're selecting exactly these fields
        setStories(data as StoryPreview[] || [])
      } catch (error) {
        console.error('Error fetching stories:', error)
        toast.error('Failed to load stories')
      } finally {
        setLoading(false)
      }
    }

    fetchStories()
  }, [supabase])

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-creepy spooky-text mb-4">🏚️ Recent Spooky Stories</h1>
      {loading ? (
        <p>Loading stories...</p>
      ) : stories.length === 0 ? (
        <p>No stories available. Check back later!</p>
      ) : (
        <div className="space-y-4">
          {stories.map((story) => (
            <div key={story.id} className="p-4 bg-secondary/50 border border-white/10 rounded-lg story-card">
              <h2 className="text-xl font-medium mb-2 haunted-text">{story.title}</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {new Date(story.created_at).toLocaleDateString()} by {story.author.username}
              </p>
              <p className="text-base mb-4">{story.content}</p>
              <div className="flex items-center gap-2">
                <img
                  src={story.author.avatar_url || '/default-avatar.png'}
                  alt="Author avatar"
                  className="w-8 h-8 rounded-full cursor-pointer spectral-image"
                  onClick={() => {
                    setSelectedAuthor(story.author)
                    setShowInfoModal(true)
                  }}
                />
                <span className="text-sm text-muted-foreground">{story.author.username}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedAuthor && (
        <PublicInfoModal
          isOpen={showInfoModal}
          onClose={() => setShowInfoModal(false)}
          author={selectedAuthor}
        />
      )}
    </div>
  )
}
