'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { PostgrestError } from '@supabase/supabase-js'

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

const DRAFT_KEY = 'spooky_story_draft'

// Function to generate a URL-friendly slug
const generateSlug = (title: string): string => {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens

  // If slug is empty or only contains invalid characters, generate a fallback
  if (!slug) {
    return `story-${Date.now()}`
  }

  return slug
}

// Function to ensure slug uniqueness
const ensureUniqueSlug = async (supabase: any, baseSlug: string): Promise<string> => {
  let slug = baseSlug
  let counter = 0
  let isUnique = false

  // Ensure the base slug is not empty
  if (!slug) {
    slug = `story-${Date.now()}`
  }

  while (!isUnique && counter < 100) { // Add a limit to prevent infinite loops
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('slug')
        .eq('slug', counter === 0 ? slug : `${slug}-${counter}`)
        .single()

      if (error?.code === 'PGRST116' || !data) { // No results found
        isUnique = true
        slug = counter === 0 ? slug : `${slug}-${counter}`
      } else {
        counter++
      }
    } catch (error) {
      console.error('Error checking slug uniqueness:', error)
      // If there's an error, append timestamp to make it unique
      return `${slug}-${Date.now()}`
    }
  }

  // If we hit the counter limit, append timestamp
  if (counter >= 100) {
    return `${slug}-${Date.now()}`
  }

  return slug
}

export default function WritePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [visibility, setVisibility] = useState<'public' | 'private'>('public')
  const [hasDraft, setHasDraft] = useState(false)
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

  // Load draft from local storage
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY)
    if (savedDraft) {
      try {
        const draft: DraftStory = JSON.parse(savedDraft)
        setHasDraft(true)
        // Don't auto-load the draft, wait for user confirmation
      } catch (error) {
        console.error('Error parsing draft:', error)
        localStorage.removeItem(DRAFT_KEY)
      }
    }
  }, [])

  // Auto-save draft every 30 seconds if there are changes
  useEffect(() => {
    if (!title && !content && !category) return // Don't save empty drafts

    const saveDraft = () => {
      const draft: DraftStory = {
        title,
        content,
        category,
        visibility,
        lastSaved: new Date().toISOString()
      }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
      setHasDraft(true)
    }

    const interval = setInterval(saveDraft, 30000) // Auto-save every 30 seconds
    return () => clearInterval(interval)
  }, [title, content, category, visibility])

  const loadDraft = () => {
    const savedDraft = localStorage.getItem(DRAFT_KEY)
    if (savedDraft) {
      try {
        const draft: DraftStory = JSON.parse(savedDraft)
        setTitle(draft.title)
        setContent(draft.content)
        setCategory(draft.category)
        setVisibility(draft.visibility)
        toast.success('Draft loaded successfully! 📝')
      } catch (error) {
        console.error('Error loading draft:', error)
        toast.error('Failed to load draft')
      }
    }
  }

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY)
    setHasDraft(false)
    setTitle('')
    setContent('')
    setCategory('')
    setVisibility('public')
    toast.success('Draft cleared! Start fresh ✨')
  }

  const saveDraft = () => {
    if (!title && !content && !category) {
      toast.error('Nothing to save! Add some content first')
      return
    }

    const draft: DraftStory = {
      title,
      content,
      category,
      visibility,
      lastSaved: new Date().toISOString()
    }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    setHasDraft(true)
    toast.success('Draft saved successfully! 📝')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('You must be logged in to write a story')
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
      
      // Generate and ensure unique slug
      const baseSlug = generateSlug(trimmedTitle)
      if (!baseSlug) {
        throw new Error('Failed to generate a valid slug for the story')
      }
      
      const uniqueSlug = await ensureUniqueSlug(supabase, baseSlug)
      if (!uniqueSlug) {
        throw new Error('Failed to generate a unique slug for the story')
      }

      const { data, error } = await supabase
        .from('stories')
        .insert([
          {
            title: trimmedTitle,
            content: trimmedContent,
            category_id: category,
            author_id: user.id,
            status: 'published',
            visibility,
            slug: uniqueSlug
          }
        ])
        .select()
        .single()

      if (error) {
        if (error.code === '23503') { // Foreign key violation
          throw new Error('Invalid category selected. Please try again.')
        }
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('A story with this title already exists.')
        }
        throw error
      }

      if (!data) {
        throw new Error('No data returned from the server')
      }

      // Clear draft after successful publish
      localStorage.removeItem(DRAFT_KEY)
      setHasDraft(false)

      toast.success('Your spooky tale has been published! 👻')
      router.push('/') // Redirect to homepage
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to publish your story. The spirits are restless...'
      
      console.error('Error publishing story:', {
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
            ✍️ Write Your Tale of Terror
          </h1>
          <p className="text-muted-foreground">
            Share your spine-chilling story with fellow horror enthusiasts
          </p>
        </div>

        {hasDraft && (
          <div className="bg-secondary/30 border border-white/10 rounded-lg p-4 flex items-center justify-between">
            <div>
              <h3 className="font-medium mb-1">You have a saved draft</h3>
              <p className="text-sm text-muted-foreground">
                Would you like to continue where you left off?
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={loadDraft}
                className="px-3 py-1.5 bg-primary/80 hover:bg-primary/90 text-primary-foreground rounded-md text-sm transition-colors"
              >
                Load Draft
              </button>
              <button
                onClick={clearDraft}
                className="px-3 py-1.5 bg-red-500/80 hover:bg-red-500/90 text-white rounded-md text-sm transition-colors"
              >
                Clear Draft
              </button>
            </div>
          </div>
        )}

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

          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={saveDraft}
                className="flex-1 px-4 py-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-lg font-medium transition-colors"
              >
                Save Draft
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-primary/80 hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Publishing...' : 'Publish Story'}
              </button>
            </div>
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