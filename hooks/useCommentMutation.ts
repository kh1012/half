'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryKeys } from '@/lib/queryKeys'
import { Comment } from '@/lib/types'

interface CommentParams {
  questionId: string
  browserId: string
  authorName: string
  content: string
  chosenOption: 'a' | 'b'
}

export function useCommentMutation(questionId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: CommentParams) => {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          question_id: params.questionId,
          browser_id: params.browserId,
          author_name: params.authorName,
          content: params.content,
          chosen_option: params.chosenOption,
        })
        .select()
        .single()
      
      if (error) throw error
      return data as Comment
    },
    onSuccess: () => {
      // Invalidate to refetch comments after successful insertion
      queryClient.invalidateQueries({ queryKey: queryKeys.comments(questionId) })
    },
  })
}
