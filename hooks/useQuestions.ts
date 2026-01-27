'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Question } from '@/lib/types'
import { queryKeys } from '@/lib/queryKeys'

export function useQuestions() {
  return useQuery({
    queryKey: queryKeys.questions,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (error) throw error
      return data as Question[]
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}

export function useQuestionStats(questionId: string) {
  return useQuery({
    queryKey: queryKeys.stats(questionId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('question_stats')
        .select('*')
        .eq('question_id', questionId)
        .single()
      
      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}
