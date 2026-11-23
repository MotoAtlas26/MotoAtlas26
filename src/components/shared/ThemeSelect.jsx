import React, { useState, useRef, useEffect } from 'react'

export const ThemeSelect = ({ 
  options, 
  value, 
  onChange, 
  placeholder = 'Seleccionar tema',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const dropdownRef = useRef(null)
  const buttonRef = useRef(null)

  const selectedOption = options.find(opt => opt.value === value)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          buttonRef.current && !buttonRef.current.contains(e.target)) {
        setIsOpen(false)
        setHighlightedIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = (e) => {
    const visibleOptions = options.filter(opt => opt.value !== undefined)
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex(prev => Math.min(prev + 1, visibleOptions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (highlightedIndex >= 0 && visibleOptions[highlightedIndex]) {
        onChange(visibleOptions[highlightedIndex].value)
        setIsOpen(false)
        setHighlightedIndex(-1)
      } else {
        setIsOpen(!isOpen)
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setHighlightedIndex(-1)
    }
  }

  const renderOption = (opt, index) => {
    const isHighlighted = index === highlightedIndex
    const isSelected = opt.value === value
    
    return (
      <div
        key={opt.value}
        className={`theme-option ${isHighlighted ? 'highlighted' : ''} ${isSelected ? 'selected' : ''}`}
        onClick={() => {
          onChange(opt.value)
          setIsOpen(false)
          setHighlightedIndex(-1)
        }}
        onMouseEnter={() => setHighlightedIndex(index)}
        role="option"
        aria-selected={isSelected}
      >
        <span className="theme-option-name">{opt.label}</span>
        {opt.swatches && opt.swatches.length > 0 && (
          <span className="theme-option-swatches">
            {opt.swatches.map((color, i) => (
              <span 
                key={i} 
                className="theme-swatch" 
                style={{ backgroundColor: color }}
                title={`Color ${i + 1}`}
              />
            ))}
          </span>
        )}
      </div>
    )
  }

  const renderOptGroup = (group) => {
    if (!group.options || group.options.length === 0) return null
    return (
      <div key={group.label} className="theme-optgroup">
        <div className="theme-optgroup-label">{group.label}</div>
        {group.options.map((opt, i) => renderOption(opt, i))}
      </div>
    )
  }

  return (
    <div className={`theme-select-wrapper ${className}`} ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        className={`theme-select-button form-select ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={placeholder}
      >
        <span className="theme-select-value">
          {selectedOption ? (
            <>
              <span className="theme-select-name">{selectedOption.label}</span>
              {selectedOption.swatches && selectedOption.swatches.length > 0 && (
                <span className="theme-select-swatches">
                  {selectedOption.swatches.map((color, i) => (
                    <span 
                      key={i} 
                      className="theme-swatch" 
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </span>
              )}
            </>
          ) : (
            <span className="theme-select-placeholder">{placeholder}</span>
          )}
        </span>
        <span className="theme-select-chevron" aria-hidden="true">▼</span>
      </button>

      {isOpen && (
        <div className="theme-select-dropdown" role="listbox">
          {options.map((group, i) => 
            Array.isArray(group.options) ? renderOptGroup(group) : renderOption(group, i)
          )}
        </div>
      )}
    </div>
  )
}