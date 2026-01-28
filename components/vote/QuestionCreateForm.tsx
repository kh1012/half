'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Send } from 'lucide-react'
import { createUserQuestion } from '@/app/actions/create-user-question'
import { Question } from '@/lib/types'

interface QuestionCreateFormProps {
  onQuestionCreated: (question: Question) => void
}

export function QuestionCreateForm({ onQuestionCreated }: QuestionCreateFormProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [title, setTitle] = useState('')
  const [optionA, setOptionA] = useState('')
  const [optionB, setOptionB] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setError(null)
    setIsSubmitting(true)

    try {
      const result = await createUserQuestion({
        title,
        optionA,
        optionB,
      })

      if (result.success && result.question) {
        onQuestionCreated(result.question)
        setTitle('')
        setOptionA('')
        setOptionB('')
        setIsExpanded(false)
      } else {
        setError(result.error || '질문 생성에 실패했습니다')
      }
    } catch {
      setError('질문 생성 중 오류가 발생했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isValid = title.trim() && optionA.trim() && optionB.trim()

  if (!isExpanded) {
    return (
      <motion.button
        onClick={() => setIsExpanded(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '48px',
          height: '48px',
          backgroundColor: '#000000',
          color: '#ffffff',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
        title="새 질문 만들기"
      >
        <Plus size={24} />
      </motion.button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '20px',
        width: '100%',
        maxWidth: '320px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h3 style={{ 
          fontSize: '14px', 
          fontWeight: 600, 
          color: '#111827',
          margin: 0
        }}>
          질문 만들기
        </h3>
        <button
          onClick={() => setIsExpanded(false)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#6b7280',
            fontSize: '20px',
            lineHeight: 1,
            padding: '4px'
          }}
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="질문을 입력하세요"
            maxLength={200}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              resize: 'none',
              minHeight: '80px',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <input
            type="text"
            value={optionA}
            onChange={(e) => setOptionA(e.target.value)}
            placeholder="선택 1"
            maxLength={50}
            style={{
              flex: 1,
              padding: '10px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
          <input
            type="text"
            value={optionB}
            onChange={(e) => setOptionB(e.target.value)}
            placeholder="선택 2"
            maxLength={50}
            style={{
              flex: 1,
              padding: '10px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>

        {error && (
          <p style={{ 
            color: '#dc2626', 
            fontSize: '12px', 
            marginBottom: '12px',
            margin: '0 0 12px 0'
          }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: isValid ? '#000000' : '#e5e7eb',
            color: isValid ? '#ffffff' : '#9ca3af',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: isValid && !isSubmitting ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          {isSubmitting ? (
            '생성 중...'
          ) : (
            <>
              <Send size={16} />
              생성하기
            </>
          )}
        </button>
      </form>
    </motion.div>
  )
}
