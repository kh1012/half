import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface PageProps {
  params: Promise<{ id: string }>
}

// Generate dynamic metadata for each question
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://half.vercel.app'
  
  const { data: question } = await supabase
    .from('questions')
    .select('*')
    .eq('id', id)
    .single()

  if (!question) {
    return {
      title: '질문을 찾을 수 없습니다',
      description: 'HALF - 50:50 균형의 논쟁 엔진',
    }
  }

  const title = question.title
  const description = `${question.option_a} vs ${question.option_b} - 당신의 선택은?`

  return {
    title,
    description,
    openGraph: {
      title: `${title} | HALF`,
      description,
      url: `${siteUrl}/questions/${id}`,
      siteName: 'HALF',
      type: 'article',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | HALF`,
      description,
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: `${siteUrl}/questions/${id}`,
    },
  }
}

// Question detail page - redirects to home for now
// In the future, this could show a specific question with its results
export default async function QuestionPage({ params }: PageProps) {
  const { id } = await params
  
  // Verify the question exists
  const { data: question } = await supabase
    .from('questions')
    .select('id')
    .eq('id', id)
    .single()

  if (!question) {
    notFound()
  }

  // For now, redirect to home page
  // The main page will handle showing the question in context
  redirect('/')
}
