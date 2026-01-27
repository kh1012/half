'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryKeys } from '@/lib/queryKeys'

interface VoteParams {
  questionId: string
  browserId: string
  chosenOption: 'a' | 'b'
}

export function useVoteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ questionId, browserId, chosenOption }: VoteParams) => {
      const { data, error } = await supabase
        .from('votes')
        .insert({
          question_id: questionId,
          browser_id: browserId,
          chosen_option: chosenOption,
        })
        .select()
      
      if (error) throw error
      return data
    },
    onMutate: async ({ questionId, chosenOption }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.stats(questionId) })

      // Snapshot previous value
      const previousStats = queryClient.getQueryData(queryKeys.stats(questionId))

      // Optimistically update stats
      queryClient.setQueryData(queryKeys.stats(questionId), (old: any) => {
        if (!old) return old
        
        return {
          ...old,
          [chosenOption === 'a' ? 'count_a' : 'count_b']: 
            (old[chosenOption === 'a' ? 'count_a' : 'count_b'] || 0) + 1,
          total_votes: (old.total_votes || 0) + 1,
        }
      })

      return { previousStats }
    },
    onError: (err, { questionId }, context) => {
      // Rollback on error
      if (context?.previousStats) {
        queryClient.setQueryData(queryKeys.stats(questionId), context.previousStats)
      }
    },
    // Don't invalidate - rely on optimistic update + 5min refetch
  })
}
