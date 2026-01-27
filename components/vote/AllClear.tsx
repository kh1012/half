'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Sparkles } from 'lucide-react'

interface AllClearProps {
  onGenerateNew?: () => void
  isGenerating?: boolean
}

export function AllClear({ onGenerateNew, isGenerating = false }: AllClearProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(48px, 8vw, 80px)',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        textAlign: 'center',
        minHeight: '400px'
      }}
    >
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 20,
          delay: 0.2
        }}
      >
        <CheckCircle2
          size={64}
          color="#10b981"
          strokeWidth={1.5}
          style={{ marginBottom: '24px' }}
        />
      </motion.div>

      {/* Title */}
      <h2
        style={{
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          fontWeight: 600,
          color: '#111827',
          marginBottom: '16px',
          lineHeight: 1.3
        }}
      >
        모든 질문에 투표했습니다!
      </h2>

      {/* Description */}
      <p
        style={{
          fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)',
          color: '#6b7280',
          lineHeight: 1.6,
          maxWidth: '500px',
          marginBottom: '32px'
        }}
      >
        새로운 질문을 생성하거나 다른 사용자가 질문을 생성할 때까지 기다려보세요
      </p>

      {/* Generate Button */}
      {onGenerateNew && (
        <motion.button
          onClick={onGenerateNew}
          disabled={isGenerating}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '16px 32px',
            fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
            fontWeight: 500,
            color: '#ffffff',
            backgroundColor: '#000000',
            border: '2px solid #000000',
            borderRadius: '8px',
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            opacity: isGenerating ? 0.6 : 1
          }}
          className="hover:bg-white hover:text-black"
        >
          {isGenerating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              >
                <Sparkles size={20} />
              </motion.div>
              생성 중...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              새 질문 생성하기
            </>
          )}
        </motion.button>
      )}

      {/* Helper Text */}
      <p
        style={{
          fontSize: '12px',
          color: '#9ca3af',
          marginTop: '24px',
          maxWidth: '400px'
        }}
      >
        질문은 AI가 자동으로 생성하며, 투표한 질문 목록은 하단에서 확인할 수 있습니다
      </p>
    </motion.div>
  )
}
