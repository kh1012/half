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
    <div style={{ marginTop: '32px', width: '100%' }}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: '100%',
          padding: '12px 16px',
          fontSize: '14px',
          color: '#9ca3af',
          background: 'transparent',
          border: '1px dashed #d1d5db',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        className="hover:border-gray-400 hover:text-gray-600"
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
            style={{ overflow: 'hidden' }}
          >
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px',
              marginTop: '16px'
            }}>
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
