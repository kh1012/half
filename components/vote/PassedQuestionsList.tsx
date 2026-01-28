'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, SkipForward } from 'lucide-react'
import { Question } from '@/lib/types'
import { VotingCard } from '@/components/VotingCard'

interface PassedQuestionsListProps {
  passedQuestions: Question[]
  onVoteComplete: (questionId: string) => void
}

export function PassedQuestionsList({ passedQuestions, onVoteComplete }: PassedQuestionsListProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (passedQuestions.length === 0) {
    return null
  }

  return (
    <div className="mt-8 w-full">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm text-gray-400 bg-transparent border border-dashed border-gray-300 rounded-lg cursor-pointer transition-all hover:border-gray-400 hover:text-gray-600"
      >
        <SkipForward size={16} />
        건너뛴 질문 ({passedQuestions.length}개)
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Passed Cards List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-4 mt-4">
              {passedQuestions.map((question) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <VotingCard 
                    question={question} 
                    onVoteComplete={() => onVoteComplete(question.id)}
                    forceUnvoted={true}
                    hideComments={true}
                    passedCard={true}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
