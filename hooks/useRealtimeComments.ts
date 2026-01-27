'use client'

import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Comment } from '@/lib/types'
import { queryKeys } from '@/lib/queryKeys'

export function useRealtimeComments(questionId: string) {
  const queryClient = useQueryClient()
  const queryKey = queryKeys.comments(questionId)

  // Initial query with 5-minute refetch
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('question_id', questionId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching comments:', error)
        return []
      }
      return (data as Comment[]) || []
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })

  // Realtime subscription for instant updates
  useEffect(() => {
    const channel = supabase
      .channel(`comments:${questionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `question_id=eq.${questionId}`,
        },
        (payload) => {
          // Update cache when Realtime event received (from other users)
          queryClient.setQueryData<Comment[]>(queryKey, (old = []) => {
            // Avoid duplicates - check if comment already exists
            const exists = old.some(c => c.id === payload.new.id)
            if (exists) return old
            return [...old, payload.new as Comment]
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'comments',
          filter: `question_id=eq.${questionId}`,
        },
        (payload) => {
          // Remove deleted comment from cache
          queryClient.setQueryData<Comment[]>(queryKey, (old = []) => {
            return old.filter(c => c.id !== payload.old.id)
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [questionId, queryClient, queryKey])

  return {
    comments: query.data || [],
    loading: query.isLoading,
    error: query.error,
  }
}
