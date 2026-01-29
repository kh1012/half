'use client'

import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { QuestionCreateForm } from './QuestionCreateForm'
import { Question } from '@/lib/types'

interface AllClearProps {
  onQuestionCreated: (question: Question) => void
}

export function AllClear({ onQuestionCreated }: AllClearProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="flex flex-col items-center justify-center p-[clamp(48px,8vw,80px)] bg-white border border-gray-200 rounded-xl text-center min-h-[400px]"
    >
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 20,
          delay: 0.2
        }}
      >
        <CheckCircle2
          size={64}
          color="#10b981"
          strokeWidth={1.5}
          className="mb-6"
        />
      </motion.div>

      {/* Title */}
      <h2 className="text-[clamp(1.5rem,4vw,2rem)] font-semibold text-gray-900 mb-4 leading-tight">
        모든 질문에 투표했습니다!
      </h2>

      {/* Description */}
      <p className="text-[clamp(0.875rem,2.5vw,1.125rem)] text-gray-500 leading-relaxed max-w-[500px] mb-8">
        새로운 질문을 직접 만들거나 AI가 자동으로 생성해드립니다
      </p>

      {/* Question Create Button */}
      <QuestionCreateForm onQuestionCreated={onQuestionCreated} />

      {/* Helper Text */}
      <p className="text-xs text-gray-400 mt-6 max-w-[400px]">
        버튼을 눌러 직접 질문을 작성하거나, AI 자동완성 기능을 사용해보세요
      </p>
    </motion.div>
  )
}
