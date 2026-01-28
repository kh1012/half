'use client'

import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Question } from '@/lib/types'
import { NicknameModal } from '@/components/NicknameModal'
import { VoteCardStack } from '@/components/vote/VoteCardStack'
import { VotedHistoryList } from '@/components/vote/VotedHistoryList'
import { PassedQuestionsList } from '@/components/vote/PassedQuestionsList'
import { AllClear } from '@/components/vote/AllClear'
import { useQuestions } from '@/hooks/useQuestions'
import { useAnonymousUser } from '@/hooks/useAnonymousUser'
import { queryKeys } from '@/lib/queryKeys'
import { generateQuestion } from '@/app/actions/generate-question'

export default function Home() {
  const { data: questions = [], isLoading } = useQuestions()
  const { 
    hasSetNickname, 
    isInitialized, 
    updateNickname, 
    votedQuestions, 
    passedQuestions,
    recordVote, 
    recordPass 
  } = useAnonymousUser()
  const queryClient = useQueryClient()
  const [isGenerating, setIsGenerating] = useState(false)

  const handleNicknameSubmit = async (nickname: string) => {
    await updateNickname(nickname)
    window.location.reload()
  }

  // Split questions into voted, unvoted (excluding passed), and passed
  const { unvotedQuestions, votedQuestionList, passedQuestionList } = useMemo(() => {
    const votedIds = new Set(votedQuestions)
    const passedIds = new Set(passedQuestions)
    
    const voted = questions.filter(q => votedIds.has(q.id))
    const unvoted = questions.filter(q => !votedIds.has(q.id) && !passedIds.has(q.id))
    const passed = questions.filter(q => passedIds.has(q.id) && !votedIds.has(q.id))
    
    // Sort voted questions by vote order (newest first)
    voted.sort((a, b) => {
      const indexA = votedQuestions.indexOf(a.id)
      const indexB = votedQuestions.indexOf(b.id)
      return indexB - indexA
    })
    
    return {
      unvotedQuestions: unvoted,
      votedQuestionList: voted,
      passedQuestionList: passed
    }
  }, [questions, votedQuestions, passedQuestions])

  // Handle vote completion
  const handleVoteComplete = (questionId: string) => {
    console.log('✅ Vote completed for:', questionId)
    // Update local state to trigger re-render
    recordVote(questionId)
    // Invalidate queries to ensure fresh data
    queryClient.invalidateQueries({ queryKey: queryKeys.questions })
  }

  // Handle pass
  const handlePassQuestion = (questionId: string) => {
    console.log('⏭️ Pass question:', questionId)
    recordPass(questionId)
  }

  // Subscribe to new questions for Realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('questions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'questions',
        },
        (payload) => {
          queryClient.setQueryData<Question[]>(queryKeys.questions, (old = []) => [
            payload.new as Question,
            ...old,
          ])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  const handleQuestionGenerated = (question: Question) => {
    queryClient.setQueryData<Question[]>(queryKeys.questions, (old = []) => [
      question,
      ...old,
    ])
  }

  const handleGenerateNew = async () => {
    setIsGenerating(true)
    try {
      const result = await generateQuestion()
      if (result.success && result.question) {
        handleQuestionGenerated(result.question)
      } else {
        alert(result.error || '질문 생성에 실패했습니다')
      }
    } catch (error) {
      console.error('Failed to generate question:', error)
      alert('질문 생성 중 오류가 발생했습니다')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-white" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Nickname Setup Modal */}
      <NicknameModal 
        isOpen={isInitialized && !hasSetNickname} 
        onSubmit={handleNicknameSubmit} 
      />

      {/* Header */}
      <header className="border-b border-gray-200 bg-white" style={{ width: '100%' }}>
        <div style={{ maxWidth: '672px', margin: '0 auto', width: '100%', padding: 'clamp(20px, 4vw, 32px) clamp(16px, 4vw, 24px)' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.75rem, 6vw, 2.25rem)', fontWeight: 'bold', color: 'black', marginBottom: '8px' }}>
              HALF
            </h1>
            <p style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)', color: '#6b7280' }}>
              50:50 균형의 논쟁 엔진
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1" style={{ width: '100%', maxWidth: '672px' }}>
        <div style={{ padding: 'clamp(32px, 6vw, 48px) clamp(16px, 4vw, 24px)' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: 'clamp(60px, 10vw, 96px) 0' }}>
              <div style={{ color: '#6b7280' }}>로딩 중...</div>
            </div>
          ) : questions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'clamp(60px, 10vw, 96px) 0' }}>
              <p style={{ color: '#374151', marginBottom: '12px', fontSize: 'clamp(1rem, 2.5vw, 1.125rem)' }}>
                아직 질문이 없습니다
              </p>
              <p style={{ fontSize: 'clamp(0.875rem, 2vw, 0.875rem)', color: '#6b7280' }}>
                새 질문 생성 버튼을 눌러 시작해보세요!
              </p>
            </div>
          ) : (
            <>
              {/* Section 1: Unvoted Cards Stack */}
              <div style={{ marginBottom: 'clamp(48px, 8vw, 72px)' }}>
                {unvotedQuestions.length > 0 ? (
                  <VoteCardStack 
                    unvotedQuestions={unvotedQuestions}
                    onVoteComplete={handleVoteComplete}
                    onPassQuestion={handlePassQuestion}
                    onQuestionCreated={handleQuestionGenerated}
                  />
                ) : (
                  <AllClear 
                    onGenerateNew={handleGenerateNew}
                    isGenerating={isGenerating}
                  />
                )}
              </div>

              {/* Section 2: Passed Questions (collapsible) */}
              {passedQuestionList.length > 0 && (
                <PassedQuestionsList 
                  passedQuestions={passedQuestionList}
                  onVoteComplete={handleVoteComplete}
                />
              )}

              {/* Section 3: Voted Questions History */}
              {votedQuestionList.length > 0 && (
                <VotedHistoryList votedQuestions={votedQuestionList} />
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white" style={{ width: '100%', marginTop: 'clamp(60px, 10vw, 96px)' }}>
        <div style={{ maxWidth: '672px', margin: '0 auto', width: '100%', padding: 'clamp(20px, 4vw, 32px) clamp(16px, 4vw, 24px)', textAlign: 'center', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', color: '#6b7280' }}>
          © 2026 HALF · 사소하지만 팽팽한 논쟁
        </div>
      </footer>
    </div>
  )
}

