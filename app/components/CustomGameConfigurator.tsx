import React, { useState } from 'react'

interface CustomGameConfiguratorProps {
  onStartCustomGame: (config: CustomGameConfig) => void
  onCancel?: () => void
  isLoading?: boolean
}

export interface CustomGameConfig {
  knowledgeLevel: string
  context: string
  numberOfQuestions: number
}

const KNOWLEDGE_LEVELS = [
  {
    value: 'classic',
    label: 'Classic',
    description: 'Mixed difficulty • General knowledge',
    emoji: '🌟'
  },
  {
    value: 'college',
    label: 'College Level',
    description: 'Advanced topics • University level',
    emoji: '🎓'
  },
  {
    value: 'high-school',
    label: 'High School',
    description: 'Academic subjects • Grade 9-12',
    emoji: '📚'
  },
  {
    value: 'middle-school',
    label: 'Middle School',
    description: 'Core subjects • Grade 6-8',
    emoji: '📝'
  },
  {
    value: 'elementary',
    label: 'Elementary',
    description: 'Basic concepts • Grade K-5',
    emoji: '🎈'
  }
]

export default function CustomGameConfigurator({
  onStartCustomGame,
  onCancel,
  isLoading = false
}: CustomGameConfiguratorProps) {
  const [knowledgeLevel, setKnowledgeLevel] = useState('classic')
  const [context, setContext] = useState('')
  const [numberOfQuestions, setNumberOfQuestions] = useState(10)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    // Validate knowledge level
    if (!knowledgeLevel) {
      newErrors.knowledgeLevel = 'Please select a knowledge level'
    }

    // Validate number of questions
    if (numberOfQuestions < 1) {
      newErrors.numberOfQuestions = 'Minimum 1 question required'
    } else if (numberOfQuestions > 50) {
      newErrors.numberOfQuestions = 'Maximum 50 questions allowed'
    }

    // Validate context length
    if (context.length > 1000) {
      newErrors.context = 'Context must be 1000 characters or less'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const config: CustomGameConfig = {
      knowledgeLevel,
      context: context.trim(),
      numberOfQuestions
    }

    onStartCustomGame(config)
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0
    setNumberOfQuestions(Math.max(1, Math.min(50, value)))
  }

  const selectedLevel = KNOWLEDGE_LEVELS.find(level => level.value === knowledgeLevel)

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-900 bg-opacity-90 border-4 border-gray-600 rounded-lg p-6 backdrop-blur-sm">
      <header className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white pixel-text-shadow mb-2">
          🎯 CUSTOM GAME
        </h2>
        <p className="text-cyan-300 text-sm">
          AI-generated questions tailored to your needs
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Knowledge Level Dropdown */}
        <div className="space-y-2">
          <label 
            htmlFor="knowledgeLevel" 
            className="block text-sm font-bold text-cyan-300 uppercase tracking-wider"
          >
            Knowledge Level
          </label>
          <div className="relative">
            <select
              id="knowledgeLevel"
              value={knowledgeLevel}
              onChange={(e) => setKnowledgeLevel(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border-3 border-gray-600 text-white font-pixel
                       focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-opacity-50
                       appearance-none cursor-pointer text-lg pixel-border transition-colors duration-200"
              aria-describedby="knowledgeLevelHelp"
            >
              {KNOWLEDGE_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.emoji} {level.label}
                </option>
              ))}
            </select>
            {/* Custom dropdown arrow */}
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          {selectedLevel && (
            <p id="knowledgeLevelHelp" className="text-xs text-gray-400">
              {selectedLevel.description}
            </p>
          )}
          {errors.knowledgeLevel && (
            <p className="text-red-400 text-xs">{errors.knowledgeLevel}</p>
          )}
        </div>

        {/* Number of Questions */}
        <div className="space-y-2">
          <label 
            htmlFor="numberOfQuestions" 
            className="block text-sm font-bold text-cyan-300 uppercase tracking-wider"
          >
            Number of Questions
          </label>
          <div className="flex items-center space-x-4">
            <input
              id="numberOfQuestions"
              type="number"
              min="1"
              max="50"
              value={numberOfQuestions}
              onChange={handleNumberChange}
              className="w-24 px-4 py-3 bg-gray-800 border-3 border-gray-600 text-white font-pixel text-center
                       focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-opacity-50
                       text-lg pixel-border transition-colors duration-200"
              aria-describedby="questionsHelp"
            />
            <div className="flex-1">
              <input
                type="range"
                min="1"
                max="50"
                value={numberOfQuestions}
                onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
                className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer
                         focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-opacity-50"
                style={{
                  background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${(numberOfQuestions / 50) * 100}%, #374151 ${(numberOfQuestions / 50) * 100}%, #374151 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
                <span>1</span>
                <span>25</span>
                <span>50</span>
              </div>
            </div>
          </div>
          <p id="questionsHelp" className="text-xs text-gray-400">
            More questions = longer game • Recommended: 10-20 questions
          </p>
          {errors.numberOfQuestions && (
            <p className="text-red-400 text-xs">{errors.numberOfQuestions}</p>
          )}
        </div>

        {/* Context Textarea */}
        <div className="space-y-2">
          <label 
            htmlFor="context" 
            className="block text-sm font-bold text-cyan-300 uppercase tracking-wider"
          >
            Custom Context <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <textarea
            id="context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Describe your topic, provide context, or paste study material...&#10;&#10;Examples:&#10;• Ancient Roman Empire&#10;• JavaScript programming fundamentals&#10;• Content from my biology textbook chapter 5&#10;• World War II Pacific Theater"
            maxLength={1000}
            rows={6}
            className="w-full px-4 py-3 bg-gray-800 border-3 border-gray-600 text-white font-pixel
                     focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-opacity-50
                     placeholder-gray-500 text-base pixel-border transition-colors duration-200 resize-none"
            aria-describedby="contextHelp"
          />
          <div className="flex justify-between items-center">
            <p id="contextHelp" className="text-xs text-gray-400">
              AI will generate questions based on this context
            </p>
            <span className="text-xs text-gray-400">
              {context.length}/1000 characters
            </span>
          </div>
          {errors.context && (
            <p className="text-red-400 text-xs">{errors.context}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-600">
          <button
            type="submit"
            disabled={isLoading}
            className={`
              flex-1 py-4 px-6 text-xl font-bold text-center rounded-lg
              transform transition-all duration-150 ease-in-out
              focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-opacity-50
              ${isLoading
                ? 'bg-purple-400 border-purple-600 text-white cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white border-4 border-purple-800 hover:border-purple-600 hover:scale-105 hover:pixel-shadow active:scale-95'
              }
              pixel-border
            `}
          >
            {isLoading ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>GENERATING...</span>
              </span>
            ) : (
              '🚀 START CUSTOM GAME'
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 text-white font-bold rounded-lg
                       border-2 border-gray-700 hover:border-gray-600 transition-all duration-150
                       focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50
                       hover:scale-105 active:scale-95"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Info Footer */}
      <footer className="mt-6 pt-4 border-t border-gray-600 text-center text-gray-400 text-xs">
        <p className="flex items-center justify-center space-x-2 mb-1">
          <span>🤖</span>
          <span>Powered by AI • Questions generated in real-time</span>
        </p>
        <p className="opacity-75">
          Generation time: ~10-30 seconds depending on complexity
        </p>
      </footer>
    </div>
  )
}
