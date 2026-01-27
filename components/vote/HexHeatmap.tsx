'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { HexCell } from './HexCell'

interface HexCellData {
  id: string
  value: 'a' | 'b' | 'neutral'
  intensity: number
}

interface HexHeatmapProps {
  countA: number
  countB: number
  optionA: string
  optionB: string
}

export function HexHeatmap({ countA, countB, optionA, optionB }: HexHeatmapProps) {
  const hexagons = useMemo(() => {
    const totalVotes = countA + countB
    const cells: HexCellData[] = []

    // Calculate normalized counts to max 100 hexagons
    let hexA = 0
    let hexB = 0

    if (totalVotes === 0) {
      // No votes yet - show neutral state
      cells.push({ id: 'neutral-0', value: 'neutral', intensity: 0.3 })
      return cells
    }

    if (totalVotes <= 100) {
      hexA = countA
      hexB = countB
    } else {
      // Normalize to 100 hexagons
      const percentA = countA / totalVotes
      hexA = Math.floor(percentA * 100)
      hexB = 100 - hexA // Ensure sum is exactly 100
    }

    // Create hexagon array with intensity gradient
    for (let i = 0; i < hexA; i++) {
      const intensity = 0.3 + (0.7 * (i / Math.max(hexA, 1))) // Gradient from 0.3 to 1.0
      cells.push({
        id: `a-${i}`,
        value: 'a',
        intensity: Math.min(1.0, intensity)
      })
    }

    for (let i = 0; i < hexB; i++) {
      const intensity = 0.3 + (0.7 * (i / Math.max(hexB, 1))) // Gradient from 0.3 to 1.0
      cells.push({
        id: `b-${i}`,
        value: 'b',
        intensity: Math.min(1.0, intensity)
      })
    }

    // Shuffle for organic distribution
    return cells.sort(() => Math.random() - 0.5)
  }, [countA, countB])

  const hexSize = 16
  const cols = Math.ceil(Math.sqrt(hexagons.length * 1.5))
  const rows = Math.ceil(hexagons.length / cols) + 1

  const percentA = countA + countB > 0 ? Math.round((countA / (countA + countB)) * 100) : 50
  const percentB = countA + countB > 0 ? Math.round((countB / (countA + countB)) * 100) : 50

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', width: '100%' }}>
      {/* Hexagon Grid */}
      <motion.div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: `${hexSize * 0.25}px`,
          padding: '24px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {Array.from({ length: rows }).map((_, rowIndex) => {
          const isOffsetRow = rowIndex % 2 === 1
          const hexagonsInRow = hexagons.slice(
            rowIndex * cols,
            Math.min((rowIndex + 1) * cols, hexagons.length)
          )

          if (hexagonsInRow.length === 0) return null

          return (
            <motion.div
              key={rowIndex}
              style={{
                display: 'flex',
                gap: `${hexSize * 0.25}px`,
                marginLeft: isOffsetRow ? `${hexSize * 0.75}px` : '0',
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.4,
                delay: rowIndex * 0.05, // staggerChildren effect
              }}
            >
              {hexagonsInRow.map((hex, hexIndex) => (
                <motion.div
                  key={hex.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 0.3,
                    delay: (rowIndex * cols + hexIndex) * 0.01, // Sequential reveal
                    type: 'spring',
                    stiffness: 300,
                    damping: 20
                  }}
                >
                  <HexCell
                    value={hex.value}
                    intensity={hex.intensity}
                    size={hexSize}
                  />
                </motion.div>
              ))}
            </motion.div>
          )
        })}
      </motion.div>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '500px', padding: '0 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '24px', height: '24px', position: 'relative' }}>
            <svg width="24" height="24" viewBox="0 0 100 100">
              <polygon
                points="50 0, 93.3 25, 93.3 75, 50 100, 6.7 75, 6.7 25"
                fill="#ff006e"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 500, fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)', color: 'black', marginBottom: '4px', wordBreak: 'keep-all' }}>
              {optionA}
            </div>
            <div style={{ fontSize: 'clamp(12px, 2vw, 14px)', color: '#6b7280' }}>
              {countA}표 ({percentA}%)
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '24px', height: '24px', position: 'relative' }}>
            <svg width="24" height="24" viewBox="0 0 100 100">
              <polygon
                points="50 0, 93.3 25, 93.3 75, 50 100, 6.7 75, 6.7 25"
                fill="#ffbe0d"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 500, fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)', color: 'black', marginBottom: '4px', wordBreak: 'keep-all' }}>
              {optionB}
            </div>
            <div style={{ fontSize: 'clamp(12px, 2vw, 14px)', color: '#6b7280' }}>
              {countB}표 ({percentB}%)
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
