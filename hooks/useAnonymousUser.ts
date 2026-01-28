'use client'

import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '@/lib/supabase'

const BROWSER_ID_KEY = 'half_browser_id'
const VOTED_QUESTIONS_KEY = 'half_voted_questions'
const PASSED_QUESTIONS_KEY = 'half_passed_questions'
const LAST_NICKNAME_KEY = 'half_last_nickname'
const LAST_GENERATION_KEY = 'half_last_generation'

const GENERATION_COOLDOWN_MS = 24 * 60 * 60 * 1000 // 24 hours

export function useAnonymousUser() {
  const [browserId, setBrowserId] = useState<string | null>(null)
  const [nickname, setNickname] = useState<string>('익명')
  const [votedQuestions, setVotedQuestions] = useState<string[]>([])
  const [passedQuestions, setPassedQuestions] = useState<string[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [lastGeneration, setLastGeneration] = useState<number | null>(null)
  const [hasSetNickname, setHasSetNickname] = useState(false) // New state to track initial nickname setup

  useEffect(() => {
    // Get or create browser_id
    let storedBrowserId = localStorage.getItem(BROWSER_ID_KEY)
    
    if (!storedBrowserId) {
      storedBrowserId = uuidv4()
      localStorage.setItem(BROWSER_ID_KEY, storedBrowserId)
    }
    
    setBrowserId(storedBrowserId)

    // Load voted questions
    const storedVotedQuestions = localStorage.getItem(VOTED_QUESTIONS_KEY)
    if (storedVotedQuestions) {
      try {
        setVotedQuestions(JSON.parse(storedVotedQuestions))
      } catch (e) {
        console.error('Failed to parse voted questions', e)
      }
    }

    // Load passed questions
    const storedPassedQuestions = localStorage.getItem(PASSED_QUESTIONS_KEY)
    if (storedPassedQuestions) {
      try {
        setPassedQuestions(JSON.parse(storedPassedQuestions))
      } catch (e) {
        console.error('Failed to parse passed questions', e)
      }
    }

    // Load last nickname
    const storedNickname = localStorage.getItem(LAST_NICKNAME_KEY)
    if (storedNickname) {
      setNickname(storedNickname)
      setHasSetNickname(true) // User has previously set a nickname
    } else {
      setHasSetNickname(false) // First time user
    }

    // Load last generation timestamp
    const storedLastGeneration = localStorage.getItem(LAST_GENERATION_KEY)
    if (storedLastGeneration) {
      setLastGeneration(parseInt(storedLastGeneration, 10))
    }

    // Ensure profile exists in database
    if (storedBrowserId) {
      ensureProfileExists(storedBrowserId, storedNickname || '익명')
    }

    setIsInitialized(true)
  }, [])

  const ensureProfileExists = async (id: string, lastNickname: string) => {
    try {
      const { data, error } = await supabase
        .from('anonymous_profiles')
        .select('browser_id, last_question_generated_at')
        .eq('browser_id', id)
        .single()

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        await supabase.from('anonymous_profiles').insert({
          browser_id: id,
          last_nickname: lastNickname,
        })
      } else if (data?.last_question_generated_at) {
        // Sync last generation time from DB
        const dbTimestamp = new Date(data.last_question_generated_at).getTime()
        setLastGeneration(dbTimestamp)
        localStorage.setItem(LAST_GENERATION_KEY, dbTimestamp.toString())
      }
    } catch (e) {
      console.error('Failed to ensure profile exists', e)
    }
  }

  const hasVoted = (questionId: string): boolean => {
    return votedQuestions.includes(questionId)
  }

  const recordVote = (questionId: string) => {
    setVotedQuestions(prev => {
      const updated = [...prev, questionId]
      // Save to localStorage inside setVotedQuestions to ensure consistency
      localStorage.setItem(VOTED_QUESTIONS_KEY, JSON.stringify(updated))
      return updated
    })
    
    // Remove from passed if it was passed before
    removePass(questionId)
  }

  const hasPassed = (questionId: string): boolean => {
    return passedQuestions.includes(questionId)
  }

  const recordPass = (questionId: string) => {
    setPassedQuestions(prev => {
      if (prev.includes(questionId)) return prev
      const updated = [...prev, questionId]
      localStorage.setItem(PASSED_QUESTIONS_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const removePass = (questionId: string) => {
    setPassedQuestions(prev => {
      if (!prev.includes(questionId)) return prev
      const updated = prev.filter(id => id !== questionId)
      localStorage.setItem(PASSED_QUESTIONS_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const updateNickname = async (newNickname: string) => {
    setNickname(newNickname)
    setHasSetNickname(true) // Mark that user has set their nickname
    localStorage.setItem(LAST_NICKNAME_KEY, newNickname)

    // Update in database
    if (browserId) {
      try {
        await supabase
          .from('anonymous_profiles')
          .update({ last_nickname: newNickname })
          .eq('browser_id', browserId)
      } catch (e) {
        console.error('Failed to update nickname in database', e)
      }
    }
  }

  const canGenerateQuestion = (): { canGenerate: boolean; remainingMs: number } => {
    if (!lastGeneration) {
      return { canGenerate: true, remainingMs: 0 }
    }

    const now = Date.now()
    const elapsed = now - lastGeneration
    const remaining = GENERATION_COOLDOWN_MS - elapsed

    return {
      canGenerate: elapsed >= GENERATION_COOLDOWN_MS,
      remainingMs: remaining > 0 ? remaining : 0,
    }
  }

  const recordQuestionGeneration = async () => {
    const now = Date.now()
    setLastGeneration(now)
    localStorage.setItem(LAST_GENERATION_KEY, now.toString())

    // Update in database
    if (browserId) {
      try {
        await supabase
          .from('anonymous_profiles')
          .update({ last_question_generated_at: new Date(now).toISOString() })
          .eq('browser_id', browserId)
      } catch (e) {
        console.error('Failed to update generation timestamp in database', e)
      }
    }
  }

  return {
    browserId,
    nickname,
    votedQuestions,
    passedQuestions,
    isInitialized,
    hasSetNickname,
    hasVoted,
    hasPassed,
    recordVote,
    recordPass,
    removePass,
    updateNickname,
    canGenerateQuestion,
    recordQuestionGeneration,
  }
}
