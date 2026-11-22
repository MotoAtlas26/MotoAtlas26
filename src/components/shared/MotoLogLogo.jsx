import React from 'react'

/**
 * MotoAtlas26Logo - Official MotoAtlas26 brand logo (SVG-based)
 * Colors adapt via CSS custom properties: --color-primary, --color-text-primary
 * 
 * @param {number} size - Logo height in pixels (default: 40)
 * @param {boolean} horizontal - Horizontal layout for sidebar (default: true)
 * @param {string} className - Additional CSS classes
 */
export const MotoAtlas26Logo = ({ 
  size = 40, 
  horizontal = true, 
  className = '' 
}) => {
  // Horizontal: isotipo + text (sidebar header)
  if (horizontal) {
    const isotipoSize = size
    const textSize = size * 0.65
    const gap = size * 0.25
    
    return (
      <div className={`MotoAtlas26-logo MotoAtlas26-logo--horizontal ${className}`} 
           style={{ display: 'inline-flex', alignItems: 'center', gap: gap }}>
        {/* Isotipo: Hexagon + M */}
        <svg 
          viewBox="0 0 64 64" 
          width={isotipoSize} 
          height={isotipoSize} 
          fill="none" 
          aria-hidden="true"
          style={{ flexShrink: 0 }}
        >
          <polygon 
            points="32,7 54,19.5 54,44.5 32,57 10,44.5 10,19.5" 
            stroke="var(--color-primary)" 
            strokeWidth="5" 
            strokeLinejoin="miter"
            fill="none"
          />
          <path 
            d="M18 43V22L32 35L46 22V43" 
            stroke="var(--color-text-primary)" 
            strokeWidth="5.5" 
            strokeLinecap="square" 
            strokeLinejoin="miter"
            fill="none"
          />
        </svg>
        
        {/* Text: MotoAtlas26 */}
        <span className="MotoAtlas26-text" style={{
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          fontWeight: 800,
          fontSize: textSize,
          letterSpacing: '0.06em',
          lineHeight: 1,
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: '0.1em'
        }}>
          <span style={{ color: 'var(--color-text-primary)' }}>MOTO</span>
          <span style={{ color: 'var(--color-primary)' }}>ATLAS</span>
        </span>
      </div>
    )
  }
  
  // Square: just isotipo (favicon, small spaces)
  return (
    <svg 
      viewBox="0 0 64 64" 
      width={size} 
      height={size} 
      fill="none" 
      aria-hidden="true"
      className={`MotoAtlas26-logo MotoAtlas26-logo--square ${className}`}
    >
      <polygon 
        points="32,7 54,19.5 54,44.5 32,57 10,44.5 10,19.5" 
        stroke="var(--color-primary)" 
        strokeWidth="5" 
        strokeLinejoin="miter"
        fill="none"
      />
      <path 
        d="M18 43V22L32 35L46 22V43" 
        stroke="var(--color-text-primary)" 
        strokeWidth="5.5" 
        strokeLinecap="square" 
        strokeLinejoin="miter"
        fill="none"
      />
    </svg>
  )
}

export default MotoAtlas26Logo