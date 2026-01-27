'use client'

interface HexagonGridProps {
  countA: number
  countB: number
  optionA: string
  optionB: string
}

export function HexagonGrid({ countA, countB, optionA, optionB }: HexagonGridProps) {
  const totalVotes = countA + countB
  
  // Calculate normalized counts to max 100 hexagons
  let hexA = 0
  let hexB = 0
  
  if (totalVotes === 0) {
    hexA = 0
    hexB = 0
  } else if (totalVotes <= 100) {
    hexA = countA
    hexB = countB
  } else {
    // Normalize to 100 hexagons
    const percentA = countA / totalVotes
    const percentB = countB / totalVotes
    
    // Use floor for one and ceil for the other to ensure sum is exactly 100
    hexA = Math.floor(percentA * 100)
    hexB = 100 - hexA // This ensures the sum is exactly 100
  }

  const totalHexagons = hexA + hexB
  const percentA = totalVotes > 0 ? Math.round((countA / totalVotes) * 100) : 50
  const percentB = totalVotes > 0 ? Math.round((countB / totalVotes) * 100) : 50

  // Create hexagon array with colors
  const hexagons: ('a' | 'b' | 'empty')[] = []
  for (let i = 0; i < hexA; i++) hexagons.push('a')
  for (let i = 0; i < hexB; i++) hexagons.push('b')
  
  // If no votes yet, show one empty hexagon
  if (totalHexagons === 0) {
    hexagons.push('empty')
  }

  // Shuffle hexagons for better visual distribution
  const shuffled = [...hexagons].sort(() => Math.random() - 0.5)

  // Calculate grid dimensions for honeycomb layout
  const hexSize = 16 // Size of each hexagon
  const cols = Math.ceil(Math.sqrt(shuffled.length * 1.5))
  const rows = Math.ceil(shuffled.length / cols) + 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', width: '100%' }}>
      {/* Hexagon Grid */}
      <div 
        style={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: `${hexSize * 0.25}px`,
          padding: '20px',
        }}
      >
        {Array.from({ length: rows }).map((_, rowIndex) => {
          const isOffsetRow = rowIndex % 2 === 1
          const hexagonsInRow = shuffled.slice(
            rowIndex * cols,
            Math.min((rowIndex + 1) * cols, shuffled.length)
          )
          
          if (hexagonsInRow.length === 0) return null

          return (
            <div
              key={rowIndex}
              style={{
                display: 'flex',
                gap: `${hexSize * 0.25}px`,
                marginLeft: isOffsetRow ? `${hexSize * 0.75}px` : '0',
              }}
            >
              {hexagonsInRow.map((type, hexIndex) => (
                <div
                  key={`${rowIndex}-${hexIndex}`}
                  style={{
                    width: `${hexSize}px`,
                    height: `${hexSize}px`,
                    position: 'relative',
                  }}
                >
                  <svg
                    width={hexSize}
                    height={hexSize}
                    viewBox="0 0 100 100"
                    style={{ display: 'block' }}
                  >
                    <polygon
                      points="50 0, 93.3 25, 93.3 75, 50 100, 6.7 75, 6.7 25"
                      fill={
                        type === 'a' 
                          ? '#000000' 
                          : type === 'b' 
                          ? '#9ca3af' 
                          : '#e5e7eb'
                      }
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '500px', padding: '0 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '24px', height: '24px', position: 'relative' }}>
            <svg width="24" height="24" viewBox="0 0 100 100">
              <polygon
                points="50 0, 93.3 25, 93.3 75, 50 100, 6.7 75, 6.7 25"
                fill="#000000"
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
                fill="#6B7280"
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
