'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabase } from '@/lib/supabase'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function generateQuestion() {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-flash-preview',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            option_a: { type: 'string' },
            option_b: { type: 'string' },
            category: { type: 'string' },
          },
          required: ['title', 'option_a', 'option_b', 'category'],
        } as any, // Type assertion for SDK compatibility
      },
    })

    const prompt = `당신은 사소하지만 의견이 팽팽하게 갈리는 일상의 딜레마를 설계하는 전문가입니다.
50:50에 가까운 의견 분포를 만들어낼 수 있는 밸런스 게임 질문을 생성하세요.

질문 주제는 일상적이고 공감 가능한 것이어야 하며, 양쪽 선택지 모두 합리적인 근거를 가져야 합니다.
예시: "아침에 일어나자마자 샤워 vs 밤에 자기 전 샤워", "라면은 끓여먹기 vs 라면은 볶아먹기"

title: 질문 제목 (간결하고 명확하게)
option_a: 첫 번째 선택지
option_b: 두 번째 선택지
category: 질문의 카테고리 (예: 일상, 음식, 습관, 취향 등)`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()
    
    const questionData = JSON.parse(text)

    // Check for duplicate questions
    const { data: existingQuestion } = await supabase
      .from('questions')
      .select('id')
      .eq('title', questionData.title)
      .eq('option_a', questionData.option_a)
      .eq('option_b', questionData.option_b)
      .maybeSingle()

    if (existingQuestion) {
      return { 
        success: false, 
        error: '동일한 질문이 이미 존재합니다. 다시 생성해주세요.' 
      }
    }

    // Insert into questions table
    const { data, error } = await supabase
      .from('questions')
      .insert({
        title: questionData.title,
        option_a: questionData.option_a,
        option_b: questionData.option_b,
        category: questionData.category,
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to insert question:', error)
      return { success: false, error: error.message }
    }

    return { success: true, question: data }
  } catch (error) {
    console.error('Failed to generate question:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
