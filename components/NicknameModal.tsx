'use client'

import { useState, useEffect } from 'react'
import { User } from 'lucide-react'

interface NicknameModalProps {
  isOpen: boolean
  onSubmit: (nickname: string) => void | Promise<void>
}

export function NicknameModal({ isOpen, onSubmit }: NicknameModalProps) {
  const [nickname, setNickname] = useState('')
  const [isMounted, setIsMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedNickname = nickname.trim()
    if (trimmedNickname && !isSubmitting) {
      setIsSubmitting(true)
      await onSubmit(trimmedNickname)
      // Page will reload, so no need to reset isSubmitting
    }
  }

  if (!isMounted || !isOpen) return null

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
      onClick={(e) => {
        // Prevent closing on backdrop click
        e.stopPropagation()
      }}
    >
      <div 
        className="bg-white rounded-md"
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: 'clamp(24px, 6vw, 40px)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              backgroundColor: '#f3f4f6',
              borderRadius: '50%',
              marginBottom: '16px',
            }}
          >
            <User size={32} color="#374151" />
          </div>
          <h2 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', fontWeight: 'bold', color: 'black', marginBottom: '8px' }}>
            반가워요! 👋
          </h2>
          <p style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)', color: '#6b7280', lineHeight: '1.6' }}>
            HALF에서 사용할 닉네임을 입력해주세요.<br />
            투표와 댓글에 표시됩니다.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임 (예: 익명의 토론가)"
            autoFocus
            maxLength={20}
            className="border-2 border-gray-300 text-black bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-black rounded-md transition-all"
            style={{
              width: '100%',
              padding: 'clamp(12px, 3vw, 16px)',
              fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
              marginBottom: '20px',
            }}
          />

          <button
            type="submit"
            disabled={!nickname.trim() || isSubmitting}
            className="border-2 border-black bg-black text-white rounded-md hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            style={{
              width: '100%',
              padding: 'clamp(12px, 3vw, 16px)',
              fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
            }}
          >
            {isSubmitting ? '설정 중...' : '시작하기'}
          </button>
        </form>

        <p style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', color: '#9ca3af', textAlign: 'center', marginTop: '16px' }}>
          닉네임은 나중에 댓글 작성 시 변경할 수 있습니다
        </p>
      </div>
    </div>
  )
}
