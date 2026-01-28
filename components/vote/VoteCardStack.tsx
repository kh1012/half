'use client'

import { motion } from 'framer-motion'
import { Question } from '@/lib/types'
import { VotingCard } from '@/components/VotingCard'
import { QuestionCreateForm } from '@/components/vote/QuestionCreateForm'

interface VoteCardStackProps {
  unvotedQuestions: Question[]
  onVoteComplete: (questionId: string) => void
  onPassQuestion?: (questionId: string) => void
  onQuestionCreated: (question: Question) => void
}

const getStackTransform = (index: number) => ({
  y: index * 12, // 12px씩 아래로 (겹쳐 보이게)
  scale: 1 - (index * 0.05), // 5%씩 작아짐
  opacity: 1,
  zIndex: 40 - (index * 10)
})

export function VoteCardStack({ unvotedQuestions, onVoteComplete, onPassQuestion, onQuestionCreated }: VoteCardStackProps) {
  // Show max 5 cards in stack (current + 1 behind)
  const visibleCards = unvotedQuestions.slice(0, 2);

  if (visibleCards.length === 0) {
    return null
  }

  return (
    <div className="relative w-full mb-6">
      {/* Header with count and create button */}
      <div className="mb-16 flex items-center justify-center gap-4">
        <div className="text-sm text-gray-500 bg-white py-2 px-4 rounded-[20px] border border-gray-200">
          남은 질문: {unvotedQuestions.length}개
        </div>
        <QuestionCreateForm onQuestionCreated={onQuestionCreated} />
      </div>

      {/* Card Stack Container */}
      <div className="relative">
        {/* Render cards in reverse order so the first card is on top */}
        {[...visibleCards].reverse().map((question, reverseIndex) => {
          const index = visibleCards.length - 1 - reverseIndex
          const transform = getStackTransform(index)
          const isTopCard = index === 0

          return (
            <motion.div
              key={question.id}
              className={`left-0 right-0 ${isTopCard ? 'relative pointer-events-auto' : 'absolute pointer-events-none'}`}
              style={{
                top: index === 0 ? 0 : -index * 50,
                zIndex: transform.zIndex,
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
                onPassQuestion={onPassQuestion ? () => onPassQuestion(question.id) : undefined}
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


