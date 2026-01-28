'use client'

import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Question } from '@/lib/types'
import { useAnonymousUser } from '@/hooks/useAnonymousUser'
import { useQuestionStats } from '@/hooks/useQuestions'
import { useVoteMutation } from '@/hooks/useVoteMutation'
import { CommentSection } from '@/components/CommentSection'
import { HexHeatmap } from '@/components/vote/HexHeatmap'
import { useRealtimeVotes } from '@/hooks/useRealtimeVotes'
import { Clock, Users, X } from 'lucide-react'
import { deleteQuestion } from '@/app/actions/delete'
import { queryKeys } from '@/lib/queryKeys'


interface VotingCardProps {
  question: Question
  onVoteComplete?: () => void
  onPassQuestion?: () => void
  forceUnvoted?: boolean // Force show unvoted UI even if already voted
  hideComments?: boolean // Hide comment section (for unvoted card stack)
  passedCard?: boolean // Whether this is a passed card
}

export function VotingCard({ question, onVoteComplete, onPassQuestion, forceUnvoted = false, hideComments = false, passedCard = false }: VotingCardProps) {
  const { browserId, hasVoted, recordVote, isInitialized } = useAnonymousUser()
  const { data: stats } = useQuestionStats(question.id)
  const realtimeVotes = useRealtimeVotes(question.id, stats?.count_a || 0, stats?.count_b || 0)
  const voteMutation = useVoteMutation()
  const queryClient = useQueryClient()
  const [voted, setVoted] = useState(hasVoted(question.id))
  const [elapsedTime, setElapsedTime] = useState('')
  const [isMounted, setIsMounted] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Update voted status when hasVoted changes
  useEffect(() => {
    setVoted(hasVoted(question.id))
  }, [hasVoted, question.id])

  // Check for admin mode from query string
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      setIsAdmin(params.get('admin') === 'true')
    }
  }, [])

  // Ensure client-side only rendering for time-based content
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Calculate elapsed time
  useEffect(() => {
    if (!isMounted) return

    const updateElapsed = () => {
      const now = new Date()
      const created = new Date(question.created_at)
      const diffMs = now.getTime() - created.getTime()
      
      const hours = Math.floor(diffMs / (1000 * 60 * 60))
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      
      if (hours > 0) {
        setElapsedTime(`${hours}시간 ${minutes}분 전`)
      } else if (minutes > 0) {
        setElapsedTime(`${minutes}분 전`)
      } else {
        setElapsedTime('방금 전')
      }
    }

    updateElapsed()
    const interval = setInterval(updateElapsed, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [question.created_at, isMounted])


  const handleVote = async (option: 'a' | 'b') => {
    if (!browserId || !isInitialized || voted || voteMutation.isPending) {
      return
    }

    try {
      await voteMutation.mutateAsync({
        questionId: question.id,
        browserId,
        chosenOption: option,
      })
      
      recordVote(question.id)
      
      setVoted(true)
      
      onVoteComplete?.()
    } catch (e) {
      console.error('❌ Failed to vote:', e)
    }
  }

  const handleDelete = async () => {
    if (!isAdmin || isDeleting) return
    
    if (!confirm('이 질문과 모든 댓글을 삭제하시겠습니까?')) return

    setIsDeleting(true)
    try {
      const result = await deleteQuestion(question.id)
      if (result.success) {
        // Remove from cache
        queryClient.setQueryData<Question[]>(queryKeys.questions, (old = []) => 
          old.filter(q => q.id !== question.id)
        )
      } else {
        alert('삭제 실패: ' + result.error)
      }
    } catch (e) {
      console.error('Failed to delete question:', e)
      alert('삭제 중 오류가 발생했습니다')
    } finally {
      setIsDeleting(false)
    }
  }

  // Format timestamp with seconds
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
  }

  // Override voted state if forceUnvoted is true (for card stack)
  const displayAsVoted = forceUnvoted ? false : voted

  if (!displayAsVoted) {
    return (
      <div className="mb-6">
        <div className={`bg-gray-50 border ${passedCard ? 'border-[#fbbf24]' : 'border-gray-300'} shadow-lg rounded-md relative p-8 px-5`}>
          {/* Admin Delete Button */}
          {isAdmin && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="hover:bg-red-100 transition-colors rounded-md disabled:opacity-50 absolute top-4 right-4 p-2 text-red-600"
              title="질문 삭제"
            >
              <X size={20} />
            </button>
          )}
          {/* Metadata */}
          <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-5">
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <span className="text-[clamp(10px,2vw,12px)]">{formatTimestamp(question.created_at)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={14} />
              <span className="text-[clamp(10px,2vw,12px)]">{stats?.total_votes || 0}명 참여 · {elapsedTime}</span>
            </div>
            {question.category && <span className="text-[clamp(10px,2vw,12px)]">#{question.category}</span>}
          </div>

          <h3 className="text-[clamp(1.1rem,4vw,1.5rem)] font-bold mb-7 text-black leading-relaxed">
            {question.title}
          </h3>
          
          <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
            <button
              onClick={() => handleVote('a')}
              disabled={voteMutation.isPending || !isInitialized}
              className="border border-gray-400 bg-white text-black rounded-md hover:bg-black hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium p-[clamp(16px,4vw,24px)_clamp(12px,3vw,20px)] text-[clamp(0.875rem,2.5vw,1.125rem)]"
            >
              {question.option_a}
            </button>
            <button
              onClick={() => handleVote('b')}
              disabled={voteMutation.isPending || !isInitialized}
              className="border border-gray-400 bg-white text-black rounded-md hover:bg-black hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium p-[clamp(16px,4vw,24px)_clamp(12px,3vw,20px)] text-[clamp(0.875rem,2.5vw,1.125rem)]"
            >
              {question.option_b}
            </button>
          </div>
          
          {/* Pass Button */}
          {onPassQuestion && (
            <button
              onClick={onPassQuestion}
              className="bg-white transition-colors border border-gray-400 mt-4 py-2 px-4 text-[13px] text-black cursor-pointer w-full text-center rounded"
            >
              이 질문 건너뛰기 (Pass)
            </button>
          )}
        </div>
        {!hideComments && (
          <CommentSection questionId={question.id} voted={voted} isAdmin={isAdmin} />
        )}
      </div>
    )
  }

  return (
    <div className="mb-6">
      <div className="bg-gradient-to-b from-gray-100 to-white rounded-md p-8 px-5 relative">
        {/* Admin Delete Button */}
        {isAdmin && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="hover:bg-red-100 transition-colors rounded-md disabled:opacity-50 absolute top-4 right-4 p-2 text-red-600"
            title="질문 삭제"
          >
            <X size={20} />
          </button>
        )}
        {/* Metadata */}
        <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-5">
          <div className="flex items-center gap-1.5">
            <Clock size={14} />
            <span className="text-[clamp(10px,2vw,12px)]">{formatTimestamp(question.created_at)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={14} />
            <span className="text-[clamp(10px,2vw,12px)]">{stats?.total_votes || 0}명 참여 · {elapsedTime}</span>
          </div>
          {question.category && <span className="text-[clamp(10px,2vw,12px)]">#{question.category}</span>}
        </div>

        <h3 className="text-[clamp(1.1rem,4vw,1.5rem)] font-bold mb-7 text-black leading-relaxed">
          {question.title}
        </h3>
        
        <HexHeatmap 
          countA={realtimeVotes.countA} 
          countB={realtimeVotes.countB} 
          optionA={question.option_a}
          optionB={question.option_b}
        />
      </div>

      {!hideComments && (
        <CommentSection questionId={question.id} voted={voted} isAdmin={isAdmin} />
      )}
    </div>
  )
}
