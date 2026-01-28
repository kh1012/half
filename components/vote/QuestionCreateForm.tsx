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
        className="flex items-center justify-center w-12 h-12 bg-black text-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
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
            className="fixed inset-0 bg-black/50 backdrop-blur-[4px] flex items-center justify-center z-[100] p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-[400px] shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-semibold text-gray-900 m-0">
                  새 질문 만들기
                </h2>
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                    질문
                  </label>
                  <textarea
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="사람들에게 물어볼 질문을 입력하세요"
                    maxLength={200}
                    autoFocus
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none min-h-[100px] font-inherit transition-colors focus:border-gray-400 focus:outline-none"
                  />
                  <div className="text-[11px] text-gray-400 text-right mt-1">
                    {title.length}/200
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                    선택지
                  </label>
                  <div className="flex gap-2 flex-col">
                    <input
                      type="text"
                      value={optionA}
                      onChange={(e) => setOptionA(e.target.value)}
                      placeholder="선택 1"
                      maxLength={50}
                      className="flex-1 p-3 border border-gray-200 rounded-lg text-sm transition-colors focus:border-gray-400 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={optionB}
                      onChange={(e) => setOptionB(e.target.value)}
                      placeholder="선택 2"
                      maxLength={50}
                      className="flex-1 p-3 border border-gray-200 rounded-lg text-sm transition-colors focus:border-gray-400 focus:outline-none"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-red-600 text-[13px] m-0">
                      {error}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  className={`w-full p-3.5 rounded-lg text-[15px] font-medium flex items-center justify-center gap-2 transition-all ${isValid && !isSubmitting ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  {isSubmitting ? (
                    '생성 중...'
                  ) : (
                    <>
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

