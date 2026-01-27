'use client'

import { motion } from 'framer-motion'
import { Question } from '@/lib/types'
import { VotingCard } from '@/components/VotingCard'

interface VoteCardStackProps {
  unvotedQuestions: Question[]
  onVoteComplete: (questionId: string) => void
}

const getStackTransform = (index: number) => ({
  y: index * 12, // 12px씩 아래로 (겹쳐 보이게)
  scale: 1 - (index * 0.05), // 5%씩 작아짐
  opacity: 1,
  zIndex: 40 - (index * 10)
})

export function VoteCardStack({ unvotedQuestions, onVoteComplete }: VoteCardStackProps) {
  // Show max 5 cards in stack (current + 1 behind)
  const visibleCards = unvotedQuestions.slice(0, 2);

  if (visibleCards.length === 0) {
    return null
  }

  return (
    <div style={{ position: 'relative', width: '100%', marginBottom: '24px' }}>
      {/* Stack depth indicator */}
      {unvotedQuestions.length > 0 && (
        <div
          className='mb-16'
          style={{
            textAlign: 'center',
            fontSize: '14px',
            color: '#6b7280',
            backgroundColor: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            border: '1px solid #e5e7eb',
            display: 'inline-block',
            marginLeft: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          남은 질문: {unvotedQuestions.length}개
        </div>
      )}

      {/* Card Stack Container */}
      <div style={{ position: 'relative' }}>
        {/* Render cards in reverse order so the first card is on top */}
        {[...visibleCards].reverse().map((question, reverseIndex) => {
          const index = visibleCards.length - 1 - reverseIndex
          const transform = getStackTransform(index)
          const isTopCard = index === 0

          return (
            <motion.div
              key={question.id}
              style={{
                position: index === 0 ? 'relative' : 'absolute',
                top: index === 0 ? 0 : -index * 50,
                left: 0,
                right: 0,
                zIndex: transform.zIndex,
                pointerEvents: isTopCard ? 'auto' : 'none',
                opacity: index === 0 ? 1 : 0.5,
              }}
              initial={false}
              animate={{
                y: transform.y,
                scale: transform.scale,
                opacity: transform.opacity
              }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 30
              }}
            >
              <VotingCard 
                question={question} 
                onVoteComplete={() => onVoteComplete(question.id)}
                forceUnvoted={true}
                hideComments={true}
              />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
