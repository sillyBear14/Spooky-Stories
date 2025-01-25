'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Link from 'next/link'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'

export default function MyStoriesPage() {
  const { user } = useAuth()
  const [stories, setStories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [storyToDelete, setStoryToDelete] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchStories = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('stories')
          .select('id, title, content, created_at')
          .eq('author_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        if (error) throw error

        setStories(data || [])
      } catch (error) {
        console.error('Error fetching stories:', error)
        toast.error('Failed to load your stories')
      } finally {
        setLoading(false)
      }
    }

    fetchStories()
  }, [user])

  const handleDelete = async () => {
    if (!storyToDelete) return

    try {
      setDeleting(storyToDelete)
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyToDelete)

      if (error) throw error

      toast.success('Story deleted successfully!')
      setStories((prevStories) => prevStories.filter((story) => story.id !== storyToDelete))
    } catch (error) {
      console.error('Error deleting story:', error)
      toast.error('Failed to delete the story')
    } finally {
      setDeleting(null)
      setShowConfirmModal(false)
      setStoryToDelete(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-creepy spooky-text mb-4">📚 My Stories</h1>
      {loading ? (
        <p>Loading your stories...</p>
      ) : stories.length === 0 ? (
        <p>You haven't written any stories yet. Start writing your spooky tales!</p>
      ) : (
        <div className="space-y-4">
          {stories.map((story) => (
            <div key={story.id} className="p-4 bg-secondary/50 border border-white/10 rounded-lg">
              <h2 className="text-xl font-medium mb-2">{story.title}</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {story.content.slice(0, 100)}... {/* Show first 100 characters */}
              </p>
              <div className="flex gap-2">
                <Link href={`/edit-story/${story.id}`} passHref>
                  <button className="px-3 py-1.5 bg-primary/80 hover:bg-primary/90 text-primary-foreground rounded-md text-sm transition-colors">
                    Edit
                  </button>
                </Link>
                <button
                  onClick={() => {
                    setStoryToDelete(story.id)
                    setShowConfirmModal(true)
                  }}
                  disabled={deleting === story.id}
                  className="px-3 py-1.5 bg-red-500/80 hover:bg-red-500/90 text-white rounded-md text-sm transition-colors disabled:opacity-50"
                >
                  {deleting === story.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
          <button className="w-full px-4 py-2 bg-secondary/80 hover:bg-secondary/90 text-secondary-foreground rounded-lg font-medium transition-colors">
            Load More
          </button>
        </div>
      )}

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this story? This action cannot be undone."
      />
    </div>
  )
} 