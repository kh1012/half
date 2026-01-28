'use server'

import { supabase } from '@/lib/supabase'

interface CreateQuestionInput {
  title: string
  optionA: string
  optionB: string
}

export async function createUserQuestion(input: CreateQuestionInput) {
  try {
    const { title, optionA, optionB } = input

    // Validate input
    if (!title.trim() || !optionA.trim() || !optionB.trim()) {
      return { success: false, error: '모든 필드를 입력해주세요' }
    }

    if (title.length > 200) {
      return { success: false, error: '질문은 200자 이내로 입력해주세요' }
    }

    if (optionA.length > 50 || optionB.length > 50) {
      return { success: false, error: '선택지는 50자 이내로 입력해주세요' }
    }

    // Check for duplicate questions
    const { data: existingQuestion } = await supabase
      .from('questions')
      .select('id')
      .eq('title', title.trim())
      .maybeSingle()

    if (existingQuestion) {
      return { 
        success: false, 
        error: '동일한 질문이 이미 존재합니다' 
      }
    }

    // Insert into questions table
    const { data, error } = await supabase
      .from('questions')
      .insert({
        title: title.trim(),
        option_a: optionA.trim(),
        option_b: optionB.trim(),
        category: '사용자 생성',
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create question:', error)
      return { success: false, error: error.message }
    }

    return { success: true, question: data }
  } catch (error) {
    console.error('Failed to create question:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
