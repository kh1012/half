'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Send, X } from 'lucide-react'
import { createUserQuestion } from '@/app/actions/create-user-question'
import { Question } from '@/lib/types'

interface QuestionCreateFormProps {
  onQuestionCreated: (question: Question) => void
}

export function QuestionCreateForm({ onQuestionCreated }: QuestionCreateFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [optionA, setOptionA] = useState('')
  const [optionB, setOptionB] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen])

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
        setIsOpen(false)
      } else {
        setError(result.error || '질문 생성에 실패했습니다')
      }
    } catch {
      setError('질문 생성 중 오류가 발생했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setIsOpen(false)
      setError(null)
    }
  }

  const isValid = title.trim() && optionA.trim() && optionB.trim()

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
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

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              padding: '16px'
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '24px',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
              }}
            >
              {/* Header */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h2 style={{ 
                  fontSize: '18px', 
                  fontWeight: 600, 
                  color: '#111827',
                  margin: 0
                }}>
                  새 질문 만들기
                </h2>
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    background: 'none',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    color: '#6b7280',
                    transition: 'background-color 0.2s'
                  }}
                  className="hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '13px', 
                    fontWeight: 500, 
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    질문
                  </label>
                  <textarea
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="사람들에게 물어볼 질문을 입력하세요"
                    maxLength={200}
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      resize: 'none',
                      minHeight: '100px',
                      fontFamily: 'inherit',
                      transition: 'border-color 0.2s'
                    }}
                    className="focus:border-gray-400 focus:outline-none"
                  />
                  <div style={{ 
                    fontSize: '11px', 
                    color: '#9ca3af', 
                    textAlign: 'right',
                    marginTop: '4px'
                  }}>
                    {title.length}/200
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '13px', 
                    fontWeight: 500, 
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    선택지
                  </label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input
                      type="text"
                      value={optionA}
                      onChange={(e) => setOptionA(e.target.value)}
                      placeholder="선택 1"
                      maxLength={50}
                      style={{
                        flex: 1,
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        transition: 'border-color 0.2s'
                      }}
                      className="focus:border-gray-400 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={optionB}
                      onChange={(e) => setOptionB(e.target.value)}
                      placeholder="선택 2"
                      maxLength={50}
                      style={{
                        flex: 1,
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        transition: 'border-color 0.2s'
                      }}
                      className="focus:border-gray-400 focus:outline-none"
                    />
                  </div>
                </div>

                {error && (
                  <div style={{ 
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '16px'
                  }}>
                    <p style={{ 
                      color: '#dc2626', 
                      fontSize: '13px', 
                      margin: 0
                    }}>
                      {error}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: isValid ? '#000000' : '#e5e7eb',
                    color: isValid ? '#ffffff' : '#9ca3af',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '15px',
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
                      질문 생성하기
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

