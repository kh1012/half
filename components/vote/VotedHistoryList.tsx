'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Question } from '@/lib/types'
import { VotingCard } from '@/components/VotingCard'

interface VotedHistoryListProps {
  votedQuestions: Question[]
}

export function VotedHistoryList({ votedQuestions }: VotedHistoryListProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (votedQuestions.length === 0) {
    return null
  }

  // Show only first 3 when collapsed
  const displayQuestions = isExpanded ? votedQuestions : votedQuestions.slice(0, 3)
  const hasMore = votedQuestions.length > 3

  return (

    <div className="mt-12 w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
        <h2 className="text-[clamp(1.125rem,3vw,1.5rem)] font-semibold text-gray-900 m-0">
          투표한 질문 ({votedQuestions.length})
        </h2>
      </div>

      {/* Voted Cards List */}
      <div className="flex flex-col gap-6">
        <AnimatePresence mode="popLayout">
          {displayQuestions.map((question, index) => (
            <motion.div
              key={question.id}
              layoutId={`question-${question.id}`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.4, 0, 0.2, 1]
              }}
            >
              <VotingCard question={question} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* More/Less Button at Bottom */}
      {hasMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-center"
        >
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1 px-6 py-3 text-sm text-gray-500 bg-transparent border border-gray-200 rounded-lg cursor-pointer transition-all hover:bg-gray-50"
          >
            {isExpanded ? (
              <>
                접기 <ChevronUp size={16} />
              </>
            ) : (
              <>
                더보기 ({votedQuestions.length - 3}개 더) <ChevronDown size={16} />
              </>
            )}
          </button>
        </motion.div>
      )}
    </div>
  )
}
