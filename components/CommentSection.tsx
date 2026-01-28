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
      <div className="bg-gray-50 border border-gray-200 rounded-md p-6 px-5">
        <div className="flex items-center gap-2 text-gray-500 text-[clamp(0.875rem,2vw,1rem)]">
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
        className="w-full hover:bg-gray-50 transition-colors rounded-md p-5 flex items-center justify-between"
      >
        <div className="flex items-center gap-2 text-gray-700">
          <MessageCircle size={20} />
          <span className="font-medium text-[clamp(0.875rem,2vw,1rem)]">댓글 {comments.length}</span>
        </div>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-5 pb-6 border-t border-gray-100">
          <form onSubmit={handleSubmit} className="mt-6 mb-8">
            <div className="flex gap-2 mb-3 flex-wrap">
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="닉네임"
                className="border border-gray-300 text-black bg-white focus:outline-none focus:ring-2 focus:ring-black rounded-md px-4 py-2.5 w-[clamp(120px,30%,160px)] text-[clamp(0.875rem,2vw,1rem)]"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="댓글을 입력하세요"
                className="border border-gray-300 text-black bg-white focus:outline-none focus:ring-2 focus:ring-black rounded-md flex-[1_1_200px] px-4 py-2.5 text-[clamp(0.875rem,2vw,1rem)]"
                disabled={commentMutation.isPending}
                ref={inputRef}
              />
              <button
                type="submit"
                disabled={commentMutation.isPending || !content.trim()}
                className="border-2 border-black bg-black text-white rounded-md hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium py-2.5 px-[clamp(24px,6vw,32px)] text-[clamp(0.875rem,2vw,1rem)]"
              >
                작성
              </button>
            </div>
          </form>

          {loading ? (
            <div className="text-gray-500 py-4">로딩 중...</div>
          ) : comments.length === 0 ? (
            <div className="text-gray-500 py-4">첫 댓글을 작성해보세요!</div>
          ) : (
            <div className="flex flex-col gap-5">
              {comments.map((comment) => (
                <div 
                  key={comment.id} 
                  className="first:border-0 first:pt-0 border-t border-gray-100 pt-5 relative"
                >
                  {/* Admin Delete Button */}
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      disabled={deletingCommentId === comment.id}
                      className="hover:bg-red-100 transition-colors rounded-md disabled:opacity-50 absolute top-5 right-0 p-1 text-red-600"
                      title="댓글 삭제"
                    >
                      <X size={16} />
                    </button>
                  )}
                  <div className={`flex items-center gap-2 mb-2 flex-wrap ${isAdmin ? 'pr-8' : ''}`}>
                    <span className="font-semibold text-black text-[clamp(0.875rem,2vw,1rem)]">
                      {comment.author_name}
                    </span>
                    <span className="text-[clamp(10px,1.5vw,12px)] px-2 py-1 bg-gray-100 text-gray-700 rounded font-medium">
                      {comment.chosen_option.toUpperCase()}
                    </span>
                    <span className="text-[clamp(10px,1.5vw,12px)] text-gray-400">
                      {new Date(comment.created_at).toLocaleString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className={`text-black leading-relaxed text-[clamp(0.875rem,2vw,1rem)] break-words ${isAdmin ? 'pr-8' : ''}`}>
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
