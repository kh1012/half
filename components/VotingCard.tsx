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
  forceUnvoted?: boolean // Force show unvoted UI even if already voted
  hideComments?: boolean // Hide comment section (for unvoted card stack)
}

export function VotingCard({ question, onVoteComplete, forceUnvoted = false, hideComments = false }: VotingCardProps) {
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
      console.log('❌ Vote blocked:', { browserId, isInitialized, voted, isPending: voteMutation.isPending })
      return
    }

    console.log('🎯 Starting vote for:', question.id, 'option:', option)

    try {
      await voteMutation.mutateAsync({
        questionId: question.id,
        browserId,
        chosenOption: option,
      })
      console.log('✅ Vote mutation successful')
      
      recordVote(question.id)
      console.log('📝 Vote recorded in localStorage')
      
      setVoted(true)
      console.log('🔄 Local voted state updated')
      
      onVoteComplete?.()
      console.log('🚀 onVoteComplete callback triggered')
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
      <div style={{ marginBottom: '24px' }}>
        <div className="bg-gray-50 border border-gray-300 shadow-lg rounded-md" style={{ padding: '32px 20px', position: 'relative' }}>
          {/* Admin Delete Button */}
          {isAdmin && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="hover:bg-red-100 transition-colors rounded-md disabled:opacity-50"
              style={{ position: 'absolute', top: '16px', right: '16px', padding: '8px', color: '#dc2626' }}
              title="질문 삭제"
            >
              <X size={20} />
            </button>
          )}
          {/* Metadata */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#6b7280', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} />
              <span style={{ fontSize: 'clamp(10px, 2vw, 12px)' }}>{formatTimestamp(question.created_at)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={14} />
              <span style={{ fontSize: 'clamp(10px, 2vw, 12px)' }}>{stats?.total_votes || 0}명 참여 · {elapsedTime}</span>
            </div>
            {question.category && <span style={{ fontSize: 'clamp(10px, 2vw, 12px)' }}>#{question.category}</span>}
          </div>

          <h3 style={{ fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', fontWeight: 'bold', marginBottom: '28px', color: 'black', lineHeight: '1.6' }}>
            {question.title}
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            <button
              onClick={() => handleVote('a')}
              disabled={voteMutation.isPending || !isInitialized}
              className="border border-gray-400 bg-white text-black rounded-md hover:bg-black hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              style={{ padding: 'clamp(16px, 4vw, 24px) clamp(12px, 3vw, 20px)', fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)' }}
            >
              {question.option_a}
            </button>
            <button
              onClick={() => handleVote('b')}
              disabled={voteMutation.isPending || !isInitialized}
              className="border border-gray-400 bg-white text-black rounded-md hover:bg-black hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              style={{ padding: 'clamp(16px, 4vw, 24px) clamp(12px, 3vw, 20px)', fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)' }}
            >
              {question.option_b}
            </button>
          </div>
        </div>
        {!hideComments && (
          <CommentSection questionId={question.id} voted={voted} isAdmin={isAdmin} />
        )}
      </div>
    )
  }

  return (
    <div style={{ marginBottom: '24px' }}>
      <div className="bg-gradient-to-b from-gray-100 to-white rounded-md" style={{ padding: '32px 20px', position: 'relative' }}>
        {/* Admin Delete Button */}
        {isAdmin && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="hover:bg-red-100 transition-colors rounded-md disabled:opacity-50"
            style={{ position: 'absolute', top: '16px', right: '16px', padding: '8px', color: '#dc2626' }}
            title="질문 삭제"
          >
            <X size={20} />
          </button>
        )}
        {/* Metadata */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#6b7280', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} />
            <span style={{ fontSize: 'clamp(10px, 2vw, 12px)' }}>{formatTimestamp(question.created_at)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={14} />
            <span style={{ fontSize: 'clamp(10px, 2vw, 12px)' }}>{stats?.total_votes || 0}명 참여 · {elapsedTime}</span>
          </div>
          {question.category && <span style={{ fontSize: 'clamp(10px, 2vw, 12px)' }}>#{question.category}</span>}
        </div>

        <h3 style={{ fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', fontWeight: 'bold', marginBottom: '28px', color: 'black', lineHeight: '1.6' }}>
          {question.title}
        </h3>
        
        
        {/* Responsive layout: stacked on mobile, horizontal on desktop */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', alignItems: 'center' }}>
          {/* Hexagon Heatmap */}
          <HexHeatmap 
            countA={realtimeVotes.countA}
            countB={realtimeVotes.countB}
            optionA={question.option_a}
            optionB={question.option_b}
          />
        </div>
      </div>
      <CommentSection questionId={question.id} voted={voted} isAdmin={isAdmin} />
    </div>
  )
}
