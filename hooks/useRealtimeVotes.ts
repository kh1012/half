'use client'

import { useEffect, useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryKeys } from '@/lib/queryKeys'

interface VoteEvent {
  id: string
  question_id: string
  chosen_option: 'a' | 'b'
  created_at: string
  browser_id: string
}

interface VoteDistribution {
  countA: number
  countB: number
  recentVotes: VoteEvent[]
}

export function useRealtimeVotes(questionId: string, initialCountA: number = 0, initialCountB: number = 0) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel(`votes:${questionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'votes',
          filter: `question_id=eq.${questionId}`,
        },
        (payload) => {
          const newVote = payload.new as VoteEvent
          const isOptionA = newVote.chosen_option === 'a'

          // 1. Invalidate query to ensure eventual consistency
          // (This triggers a refetch in the background)
          queryClient.invalidateQueries({ queryKey: queryKeys.stats(questionId) })

          // 2. Optimistically update Tanstack Query cache immediately for instant feedback
          queryClient.setQueryData(queryKeys.stats(questionId), (old: any) => {
            
            // If no data exists yet, construct initial structure using props
            if (!old) {
              return {
                question_id: questionId,
                count_a: initialCountA + (isOptionA ? 1 : 0),
                count_b: initialCountB + (isOptionA ? 0 : 1),
                total_votes: initialCountA + initialCountB + 1
              }
            }

            // Update existing cache
            return {
              ...old,
              count_a: old.count_a + (isOptionA ? 1 : 0),
              count_b: old.count_b + (isOptionA ? 0 : 1),
              total_votes: (old.total_votes || 0) + 1
            }
          })
        }
      )
      .subscribe((status) => {
        // Status logging removed
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [questionId, queryClient, initialCountA, initialCountB])

  // Return the counts passed from parent (which come from the query we are updating)
  return {
    countA: initialCountA,
    countB: initialCountB,
    recentVotes: [] // Recent votes logic simplified for now as it wasn't core
  }
}
