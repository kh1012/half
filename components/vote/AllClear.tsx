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
      className="flex flex-col items-center justify-center p-[clamp(48px,8vw,80px)] bg-white border border-gray-200 rounded-xl text-center min-h-[400px]"
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
          className="mb-6"
        />
      </motion.div>

      {/* Title */}
      <h2 className="text-[clamp(1.5rem,4vw,2rem)] font-semibold text-gray-900 mb-4 leading-tight">
        모든 질문에 투표했습니다!
      </h2>

      {/* Description */}
      <p className="text-[clamp(0.875rem,2.5vw,1.125rem)] text-gray-500 leading-relaxed max-w-[500px] mb-8">
        새로운 질문을 생성하거나 다른 사용자가 질문을 생성할 때까지 기다려보세요
      </p>

      {/* Generate Button - Icon Only */}
      {onGenerateNew && (
        <motion.button
          onClick={onGenerateNew}
          disabled={isGenerating}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="AI가 새 질문을 생성합니다"
          className={`flex items-center justify-center w-14 h-14 text-white bg-black border-2 border-black rounded-full transition-all duration-200 ${isGenerating ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
        >
          {isGenerating ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear'
              }}
            >
              <Sparkles size={24} />
            </motion.div>
          ) : (
            <Sparkles size={24} />
          )}
        </motion.button>
      )}

      {/* Helper Text */}
      <p className="text-xs text-gray-400 mt-6 max-w-[400px]">
        질문은 AI가 자동으로 생성하며, 투표한 질문 목록은 하단에서 확인할 수 있습니다
      </p>
    </motion.div>
  )
}
