'use client'

import { useState, useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useRealtimeComments } from '@/hooks/useRealtimeComments'
import { useAnonymousUser } from '@/hooks/useAnonymousUser'
import { useCommentMutation } from '@/hooks/useCommentMutation'
import { MessageCircle, ChevronDown, ChevronUp, X } from 'lucide-react'
import { deleteComment } from '@/app/actions/delete'
import { queryKeys } from '@/lib/queryKeys'

interface CommentSectionProps {
  questionId: string
  voted: boolean // Pass voted status from parent
  isAdmin?: boolean // Admin mode for delete functionality
}

export function CommentSection({ questionId, voted, isAdmin = false }: CommentSectionProps) {
  const queryClient = useQueryClient()
  const { comments, loading } = useRealtimeComments(questionId)
  const { browserId, nickname, updateNickname, isInitialized } = useAnonymousUser()
  const commentMutation = useCommentMutation(questionId)
  const [content, setContent] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync nickname from hook - always keep in sync unless user manually edits
  useEffect(() => {
    if (nickname) {
      setAuthorName(nickname)
    }
  }, [nickname])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim() || !browserId || !isInitialized || !voted) return

    try {
      // Get user's vote to record chosen_option
      const { data: voteData } = await supabase
        .from('votes')
        .select('chosen_option')
        .eq('question_id', questionId)
        .eq('browser_id', browserId)
        .single()

      await commentMutation.mutateAsync({
        questionId,
        browserId,
        authorName: authorName.trim() || '익명',
        content: content.trim(),
        chosenOption: voteData?.chosen_option || 'a',
      })

      // Update nickname if changed
      if (authorName.trim() && authorName !== nickname) {
        updateNickname(authorName.trim())
      }
      
      setContent('')
      // Keep focus on input for continuous conversation
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    } catch (e) {
      console.error('Failed to post comment:', e)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!isAdmin || deletingCommentId) return
    
    if (!confirm('이 댓글을 삭제하시겠습니까?')) return

    setDeletingCommentId(commentId)
    try {
      const result = await deleteComment(commentId)
      if (result.success) {
        // Invalidate queries to force refetch
        queryClient.invalidateQueries({ queryKey: queryKeys.comments(questionId) })
      } else {
        alert('삭제 실패: ' + result.error)
      }
    } catch (e) {
      console.error('Failed to delete comment:', e)
      alert('삭제 중 오류가 발생했습니다')
    } finally {
      setDeletingCommentId(null)
    }
  }

  if (!voted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-md" style={{ padding: '24px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>
          <MessageCircle size={20} />
          <span>투표 후 댓글을 작성할 수 있습니다</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-md">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full hover:bg-gray-50 transition-colors rounded-md"
        style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>
          <MessageCircle size={20} />
          <span style={{ fontWeight: 500, fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>댓글 {comments.length}</span>
        </div>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div style={{ padding: '0 20px 24px', borderTop: '1px solid #f3f4f6' }}>
          <form onSubmit={handleSubmit} style={{ marginTop: '24px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="닉네임"
                className="border border-gray-300 text-black bg-white focus:outline-none focus:ring-2 focus:ring-black rounded-md"
                style={{ padding: '10px 16px', width: 'clamp(120px, 30%, 160px)', fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="댓글을 입력하세요"
                className="border border-gray-300 text-black bg-white focus:outline-none focus:ring-2 focus:ring-black rounded-md"
                style={{ flex: '1 1 200px', padding: '10px 16px', fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}
                disabled={commentMutation.isPending}
                ref={inputRef}
              />
              <button
                type="submit"
                disabled={commentMutation.isPending || !content.trim()}
                className="border-2 border-black bg-black text-white rounded-md hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                style={{ padding: '10px clamp(24px, 6vw, 32px)', fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}
              >
                작성
              </button>
            </div>
          </form>

          {loading ? (
            <div style={{ color: '#6b7280', padding: '16px 0' }}>로딩 중...</div>
          ) : comments.length === 0 ? (
            <div style={{ color: '#6b7280', padding: '16px 0' }}>첫 댓글을 작성해보세요!</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {comments.map((comment) => (
                <div 
                  key={comment.id} 
                  style={{ 
                    borderTop: '1px solid #f3f4f6', 
                    paddingTop: '20px',
                    position: 'relative',
                  }}
                  className="first:border-0 first:pt-0"
                >
                  {/* Admin Delete Button */}
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      disabled={deletingCommentId === comment.id}
                      className="hover:bg-red-100 transition-colors rounded-md disabled:opacity-50"
                      style={{ position: 'absolute', top: '20px', right: '0', padding: '4px', color: '#dc2626' }}
                      title="댓글 삭제"
                    >
                      <X size={16} />
                    </button>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap', paddingRight: isAdmin ? '32px' : '0' }}>
                    <span style={{ fontWeight: 600, color: 'black', fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>
                      {comment.author_name}
                    </span>
                    <span style={{ fontSize: 'clamp(10px, 1.5vw, 12px)', padding: '4px 8px', backgroundColor: '#f3f4f6', color: '#374151', borderRadius: '4px', fontWeight: 500 }}>
                      {comment.chosen_option.toUpperCase()}
                    </span>
                    <span style={{ fontSize: 'clamp(10px, 1.5vw, 12px)', color: '#9ca3af' }}>
                      {new Date(comment.created_at).toLocaleString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p style={{ color: 'black', lineHeight: '1.6', fontSize: 'clamp(0.875rem, 2vw, 1rem)', wordBreak: 'break-word', paddingRight: isAdmin ? '32px' : '0' }}>
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
