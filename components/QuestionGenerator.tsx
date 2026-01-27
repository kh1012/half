'use client'

import { useState, useEffect } from 'react'
import { generateQuestion } from '@/app/actions/generate-question'
import { Sparkles, Clock } from 'lucide-react'
import { Question } from '@/lib/types'
import { useAnonymousUser } from '@/hooks/useAnonymousUser'

interface QuestionGeneratorProps {
  onQuestionGenerated?: (question: Question) => void
}

export function QuestionGenerator({ onQuestionGenerated }: QuestionGeneratorProps) {
  const { canGenerateQuestion, recordQuestionGeneration, isInitialized } = useAnonymousUser()
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState('')

  const { canGenerate, remainingMs } = canGenerateQuestion()

  useEffect(() => {
    if (!canGenerate && remainingMs > 0) {
      const updateCountdown = () => {
        const { remainingMs: current } = canGenerateQuestion()
        if (current <= 0) {
          setCountdown('')
          return
        }

        const hours = Math.floor(current / (1000 * 60 * 60))
        const minutes = Math.floor((current % (1000 * 60 * 60)) / (1000 * 60))
        setCountdown(`${hours}시간 ${minutes}분`)
      }

      updateCountdown()
      const interval = setInterval(updateCountdown, 60000) // Update every minute
      return () => clearInterval(interval)
    } else {
      setCountdown('')
    }
  }, [canGenerate, remainingMs])

  const handleGenerate = async () => {
    if (!canGenerate || !isInitialized) return

    setIsGenerating(true)
    setError(null)

    try {
      const result = await generateQuestion()

      if (result.success && result.question) {
        await recordQuestionGeneration()
        onQuestionGenerated?.(result.question)
      } else {
        setError(result.error || '질문 생성에 실패했습니다')
      }
    } catch (e) {
      setError('질문 생성 중 오류가 발생했습니다')
      console.error(e)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !canGenerate || !isInitialized}
        className="flex items-center gap-2 border border-gray-300 bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Sparkles size={20} />
        {isGenerating ? '생성 중...' : '새 질문 생성'}
      </button>
      
      {!canGenerate && countdown && (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Clock size={14} />
          <span>다음 생성까지 {countdown}</span>
        </div>
      )}
      
      {error && (
        <div className="text-sm text-red-600 border border-red-300 bg-red-50 px-3 py-2 rounded-md">
          {error}
        </div>
      )}
    </div>
  )
}
