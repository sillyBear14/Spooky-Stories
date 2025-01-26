import { MetadataRoute } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { siteConfig } from '@/config/site'

type StoryForSitemap = {
  slug: string;
  updated_at: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerClient()

  // Fetch all public stories
  const { data: stories } = await supabase
    .from('stories')
    .select('slug, updated_at')
    .eq('visibility', 'public')

  // Static routes
  const routes = [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${siteConfig.url}/write`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ] as MetadataRoute.Sitemap

  // Add dynamic story routes
  if (stories) {
    const storyRoutes = stories.map((story: StoryForSitemap) => ({
      url: `${siteConfig.url}/story/${story.slug}`,
      lastModified: new Date(story.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })) as MetadataRoute.Sitemap

    routes.push(...storyRoutes)
  }

  return routes
} 