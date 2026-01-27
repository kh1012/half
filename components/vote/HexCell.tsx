'use client'

import { useRef, useEffect } from 'react'
import { motion, useAnimation } from 'framer-motion'

interface HexCellProps {
  value: 'a' | 'b' | 'neutral'
  intensity: number // 0~1
  size?: number
  onAnimationComplete?: () => void
}

const COLORS = {
  a: '#ff006e',      // Hot Pink
  b: '#ffbe0d',      // Golden Yellow
  neutral: '#e5e7eb' // Light Gray
}

export function HexCell({ value, intensity, size = 16, onAnimationComplete }: HexCellProps) {
  const controls = useAnimation()
  const prevIntensityRef = useRef(intensity)

  // Pulse animation when intensity increases
  useEffect(() => {
    const prevIntensity = prevIntensityRef.current
    
    if (intensity > prevIntensity && intensity > 0) {
      // Trigger pulse animation
      controls.start({
        scale: [1, 1.15, 1],
        filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)'],
        transition: {
          type: 'spring',
          stiffness: 400,
          damping: 25,
          duration: 0.6
        }
      }).then(() => {
        onAnimationComplete?.()
      })
    }
    
    prevIntensityRef.current = intensity
  }, [intensity, controls, onAnimationComplete])

  // Calculate opacity based on intensity (min 0.1, max 1.0)
  const opacity = value === 'neutral' ? 0.3 : Math.max(0.1, Math.min(1.0, intensity))
  const fillColor = COLORS[value]

  return (
    <motion.div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: 'relative',
      }}
      animate={controls}
      layout
      initial={{ scale: 0, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        style={{ display: 'block' }}
      >
        <polygon
          points="50 0, 93.3 25, 93.3 75, 50 100, 6.7 75, 6.7 25"
          fill={fillColor}
          fillOpacity={opacity}
          stroke="#ffffff"
          strokeWidth="2"
        />
      </svg>
    </motion.div>
  )
}
