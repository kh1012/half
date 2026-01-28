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
    <div className="flex flex-col items-center gap-8 w-full">
      {/* Hexagon Grid */}
      <motion.div
        className="flex flex-col items-center gap-1 p-6 bg-white rounded-lg border border-gray-200"
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
              className={`flex gap-1 ${isOffsetRow ? 'ml-3' : ''}`}
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
      <div className="flex flex-col gap-4 w-full max-w-[500px] px-3">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 relative">
            <svg width="24" height="24" viewBox="0 0 100 100">
              <polygon
                points="50 0, 93.3 25, 93.3 75, 50 100, 6.7 75, 6.7 25"
                fill="#ff006e"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-[clamp(0.875rem,2.5vw,1.125rem)] text-black mb-1 break-keep">
              {optionA}
            </div>
            <div className="text-[clamp(12px,2vw,14px)] text-gray-500">
              {countA}표 ({percentA}%)
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 relative">
            <svg width="24" height="24" viewBox="0 0 100 100">
              <polygon
                points="50 0, 93.3 25, 93.3 75, 50 100, 6.7 75, 6.7 25"
                fill="#ffbe0d"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-[clamp(0.875rem,2.5vw,1.125rem)] text-black mb-1 break-keep">
              {optionB}
            </div>
            <div className="text-[clamp(12px,2vw,14px)] text-gray-500">
              {countB}표 ({percentB}%)
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
