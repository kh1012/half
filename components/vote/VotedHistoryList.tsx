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
    <div style={{ marginTop: '48px', width: '100%' }}>
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          paddingBottom: '12px',
          borderBottom: '1px solid #e5e7eb'
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(1.125rem, 3vw, 1.5rem)',
            fontWeight: 600,
            color: '#111827',
            margin: 0
          }}
        >
          투표한 질문 ({votedQuestions.length})
        </h2>

        {hasMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 16px',
              fontSize: '14px',
              color: '#6b7280',
              background: 'transparent',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            className="hover:bg-gray-50"
          >
            {isExpanded ? (
              <>
                접기 <ChevronUp size={16} />
              </>
            ) : (
              <>
                더보기 <ChevronDown size={16} />
              </>
            )}
          </button>
        )}
      </div>

      {/* Voted Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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

      {/* Show count when collapsed */}
      {!isExpanded && hasMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            marginTop: '16px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#9ca3af'
          }}
        >
          총 {votedQuestions.length}개의 투표 기록이 있습니다
        </motion.div>
      )}
    </div>
  )
}
