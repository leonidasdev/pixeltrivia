import React, { useState } from 'react'
import { GAME_CATEGORIES } from '@/constants/categories'

interface QuickGameSelectorProps {
  onCategorySelected: (category: string, difficulty: string) => void
  onCancel?: () => void
}

export default function QuickGameSelector({
  onCategorySelected,
  onCancel,
}: QuickGameSelectorProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('classic')
  const [selectedCategory, setSelectedCategory] = useState<{
    category: string
    difficulty: string
  } | null>(null)
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)

  const handleSectionToggle = (sectionKey: string) => {
    setExpandedSection(expandedSection === sectionKey ? null : sectionKey)
  }

  const handleCategorySelect = (category: string, difficulty: string) => {
    setSelectedCategory({ category, difficulty })
    // Brief delay to show selection before triggering callback
    setTimeout(() => {
      onCategorySelected(category, difficulty)
    }, 150)
  }

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      action()
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-900 bg-opacity-90 border-4 border-gray-600 p-6 pixel-border backdrop-blur-sm">
      <header className="text-center mb-6">
        <h2 className="text-lg font-pixel text-white pixel-text-shadow mb-2">QUICK GAME</h2>
        <p className="text-cyan-300 font-pixel-body text-base">
          Choose your difficulty level and category for 10 questions
        </p>
      </header>

      <div className="space-y-3">
        {Object.entries(GAME_CATEGORIES).map(([key, section]) => (
          <div key={key} className="border-4 border-gray-600 pixel-border overflow-hidden">
            {/* Section Header */}
            <button
              onClick={() => handleSectionToggle(key)}
              onKeyDown={e => handleKeyDown(e, () => handleSectionToggle(key))}
              className={`
                w-full px-4 py-3 flex items-center justify-between
                ${section.styles.color} ${section.styles.hoverColor} ${section.styles.borderColor}
                text-white font-bold transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-opacity-50
                hover:scale-[1.02] active:scale-[0.98]
              `}
              aria-expanded={expandedSection === key}
              aria-controls={`section-${key}`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl" role="img" aria-label={section.title}>
                  {section.emoji}
                </span>
                <div className="text-left">
                  <div className="font-pixel text-xs sm:text-sm">{section.title}</div>
                  <div className="font-pixel-body text-sm opacity-90">{section.description}</div>
                </div>
              </div>
              <div
                className={`transform transition-transform duration-200 ${
                  expandedSection === key ? 'rotate-180' : ''
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </button>

            {/* Collapsible Content */}
            <div
              id={`section-${key}`}
              className={`
                overflow-hidden transition-all duration-300 ease-in-out
                ${expandedSection === key ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
              `}
            >
              <div className="p-4 bg-gray-800 bg-opacity-50">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {section.categories.map(category => {
                    const buttonKey = `${key}-${category}`
                    const isSelected =
                      selectedCategory?.category === category &&
                      selectedCategory?.difficulty === key

                    return (
                      <button
                        key={category}
                        onClick={() => handleCategorySelect(category, key)}
                        onMouseEnter={() => setHoveredButton(buttonKey)}
                        onMouseLeave={() => setHoveredButton(null)}
                        onFocus={() => setHoveredButton(buttonKey)}
                        onBlur={() => setHoveredButton(null)}
                        onKeyDown={e => handleKeyDown(e, () => handleCategorySelect(category, key))}
                        className={`
                          px-3 py-2 min-h-[44px] font-pixel-body text-sm font-bold text-center
                          border-4 pixel-border transition-all duration-150 ease-in-out
                          focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-opacity-50
                          ${
                            isSelected
                              ? `${section.styles.color} border-white text-white scale-105 pixel-shadow`
                              : hoveredButton === buttonKey
                                ? `${section.styles.color} ${section.styles.borderColor} text-white scale-105 hover:pixel-shadow`
                                : `bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500 hover:text-white hover:scale-105 pixel-glow-hover`
                          }
                        `}
                        aria-label={`Select ${category} category for ${section.title} difficulty`}
                      >
                        <span className="block leading-tight">{category}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="flex justify-center space-x-4 mt-6 pt-4 border-t border-gray-600">
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-6 py-3 min-h-[44px] bg-gray-600 hover:bg-gray-500 text-white font-pixel text-xs
                     border-4 border-gray-700 hover:border-gray-600 pixel-border transition-all duration-150
                     focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50
                     hover:scale-105 active:scale-95 pixel-glow-hover"
          >
            Cancel
          </button>
        )}
        <div className="text-center text-gray-400 font-pixel-body text-sm">
          <p>🎮 Use keyboard arrows and Enter to navigate</p>
          <p className="opacity-75 font-pixel text-[10px]">
            10 questions per category • Instant start
          </p>
        </div>
      </div>
    </div>
  )
}
