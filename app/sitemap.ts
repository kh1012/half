import type { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://half.vercel.app'
  
  // Base URLs
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]

  // Fetch all active questions for dynamic routes
  try {
    const { data: questions } = await supabase
      .from('questions')
      .select('id, created_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (questions) {
      const questionRoutes: MetadataRoute.Sitemap = questions.map((question) => ({
        url: `${siteUrl}/questions/${question.id}`,
        lastModified: new Date(question.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))

      return [...staticRoutes, ...questionRoutes]
    }
  } catch (error) {
    console.error('Failed to fetch questions for sitemap:', error)
  }

  return staticRoutes
}
