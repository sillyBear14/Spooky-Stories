'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { PostgrestError } from '@supabase/supabase-js'

// Reuse the DraftStory and Category interfaces from WritePage
interface DraftStory {
  title: string
  content: string
  category: string
  visibility: 'public' | 'private'
  lastSaved: string
}

interface Category {
  id: string
  name: string
  description: string
}

export default function EditStoryPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [visibility, setVisibility] = useState<'public' | 'private'>('public')
  const supabase = createClient()

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name')

        if (error) throw error

        if (data) {
          setCategories(data)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        toast.error('Failed to load categories')
      }
    }

    fetchCategories()
  }, [])

  // Fetch story data when component mounts
  useEffect(() => {
    const fetchStory = async () => {
      if (!user || !id) return

      try {
        const { data, error } = await supabase
          .from('stories')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error

        if (data) {
          setTitle(data.title)
          setContent(data.content)
          setCategory(data.category_id)
          setVisibility(data.visibility)
        }
      } catch (error) {
        console.error('Error fetching story:', error)
        toast.error('Failed to load story data')
      }
    }

    fetchStory()
  }, [user, id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('You must be logged in to edit a story')
      return
    }

    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()
    if (!trimmedTitle || !trimmedContent || !category) {
      toast.error('Please fill in all required fields')
      return
    }

    // Validate content length
    if (trimmedContent.length < 100) { // Assuming 100 is the minimum required length
      toast.error('Story content must be at least 100 characters long')
      return
    }

    try {
      setLoading(true)

      const { error } = await supabase
        .from('stories')
        .update({
          title: trimmedTitle,
          content: trimmedContent,
          category_id: category,
          visibility
        })
        .eq('id', id)

      if (error) throw error

      toast.success('Your spooky tale has been updated! 👻')
      router.push('/my-stories')
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to update your story. The spirits are restless...'

      console.error('Error updating story:', {
        error,
        title,
        category,
        userId: user?.id,
        visibility
      })

      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-creepy spooky-text mb-2">
            ✍️ Edit Your Tale of Terror
          </h1>
          <p className="text-muted-foreground">
            Update your spine-chilling story for fellow horror enthusiasts
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your story title..."
              className="w-full px-4 py-2 rounded-lg bg-secondary/50 border border-white/10 text-foreground"
              required
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground text-right">
              {title.length}/100 characters
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-secondary/50 border border-white/10 text-foreground"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Loading categories...
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              Story Content <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Begin your terrifying tale here..."
              className="w-full px-4 py-2 rounded-lg bg-secondary/50 border border-white/10 text-foreground min-h-[400px] resize-y"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Visibility</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={visibility === 'public'}
                  onChange={(e) => setVisibility(e.target.value as 'public')}
                  className="text-primary"
                />
                Public
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={visibility === 'private'}
                  onChange={(e) => setVisibility(e.target.value as 'private')}
                  className="text-primary"
                />
                Private
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              {visibility === 'public' 
                ? 'Your story will be visible to all users'
                : 'Only you can see this story'}
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary/80 hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Story'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 bg-secondary/80 hover:bg-secondary/90 text-secondary-foreground rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 