'use server'

import { supabaseServer } from '@/lib/supabase-server'

/**
 * Delete a question and all associated comments
 */
export async function deleteQuestion(questionId: string) {
  try {
    // Delete all comments first (due to foreign key constraints)
    const { error: commentsError } = await supabaseServer
      .from('comments')
      .delete()
      .eq('question_id', questionId)

    if (commentsError) {
      console.error('Failed to delete comments:', commentsError)
      return { success: false, error: commentsError.message }
    }

    // Delete all votes
    const { error: votesError } = await supabaseServer
      .from('votes')
      .delete()
      .eq('question_id', questionId)

    if (votesError) {
      console.error('Failed to delete votes:', votesError)
      return { success: false, error: votesError.message }
    }

    // Delete the question
    const { error: questionError } = await supabaseServer
      .from('questions')
      .delete()
      .eq('id', questionId)

    if (questionError) {
      console.error('Failed to delete question:', questionError)
      return { success: false, error: questionError.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to delete question:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Delete a single comment
 */
export async function deleteComment(commentId: string) {
  try {
    const { error } = await supabaseServer
      .from('comments')
      .delete()
      .eq('id', commentId)

    if (error) {
      console.error('Failed to delete comment:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to delete comment:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
