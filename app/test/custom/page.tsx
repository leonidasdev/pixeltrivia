'use client'

import { useState } from 'react'
import { generateCustomQuiz, testCustomQuizAPI, type CustomQuizRequest, type CustomQuizQuestion } from '@/lib/customQuizApi'

export default function CustomQuizTestPage() {
  const [knowledgeLevel, setKnowledgeLevel] = useState('college')
  const [context, setContext] = useState('')
  const [numQuestions, setNumQuestions] = useState(5)
  const [questions, setQuestions] = useState<CustomQuizQuestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  const handleGenerateQuiz = async () => {
    if (numQuestions < 1 || numQuestions > 50) {
      setError('Number of questions must be between 1 and 50')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const config: CustomQuizRequest = {
        knowledgeLevel,
        context: context.trim(),
        numQuestions
      }

      const response = await generateCustomQuiz(config)
      setResult(response)
      
      if (response.success && response.data) {
        setQuestions(response.data)
        setError(null)
      } else {
        setError(response.error || 'Failed to generate questions')
        setQuestions([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }

  const handleTestAPI = async () => {
    setLoading(true)
    try {
      const testResult = await testCustomQuizAPI()
      setResult(testResult)
      if (testResult?.success && testResult.data) {
        setQuestions(testResult.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test failed')
    } finally {
      setLoading(false)
    }
  }

  const knowledgeLevels = [
    { value: 'elementary', label: 'Elementary' },
    { value: 'middle-school', label: 'Middle School' },
    { value: 'high-school', label: 'High School' },
    { value: 'college', label: 'College' },
    { value: 'classic', label: 'Classic' }
  ]

  const contextExamples = [
    'Ancient Greek mythology and gods',
    'JavaScript programming fundamentals',
    'World War II Pacific Theater',
    'Photosynthesis and plant biology',
    'Shakespeare\'s Romeo and Juliet'
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 pixel-text-shadow">
            Custom Quiz API Test
          </h1>
          <p className="text-cyan-300">Test the /api/quiz/custom endpoint with DeepSeek AI</p>
        </header>

        {/* Test Controls */}
        <div className="bg-gray-900 bg-opacity-80 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Test Controls</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
            <div>
              <label htmlFor="knowledgeLevel" className="block text-cyan-300 font-bold mb-2">
                Knowledge Level:
              </label>
              <select
                id="knowledgeLevel"
                value={knowledgeLevel}
                onChange={(e) => setKnowledgeLevel(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-600 text-white rounded-md
                         focus:border-cyan-400 focus:outline-none"
              >
                {knowledgeLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="numQuestions" className="block text-cyan-300 font-bold mb-2">
                Number of Questions (1-50):
              </label>
              <input
                id="numQuestions"
                type="number"
                min="1"
                max="50"
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-600 text-white rounded-md
                         focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="context" className="block text-cyan-300 font-bold mb-2">
              Context (Optional):
            </label>
            <textarea
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Enter specific topic, subject, or context for the questions..."
              maxLength={1000}
              rows={4}
              className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-600 text-white rounded-md
                       focus:border-cyan-400 focus:outline-none placeholder-gray-500"
            />
            <div className="text-right text-xs text-gray-400 mt-1">
              {context.length}/1000 characters
            </div>
          </div>

          {/* Quick Context Examples */}
          <div className="mb-4">
            <p className="text-gray-400 text-sm mb-2">Quick examples:</p>
            <div className="flex flex-wrap gap-2">
              {contextExamples.map(example => (
                <button
                  key={example}
                  onClick={() => setContext(example)}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded
                           transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleGenerateQuiz}
              disabled={loading}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 
                       text-white font-bold rounded-md transition-colors flex-1 min-w-48"
            >
              {loading ? 'Generating...' : '🤖 Generate Custom Quiz'}
            </button>
            
            <button
              onClick={handleTestAPI}
              disabled={loading}
              className="px-6 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 
                       text-white font-bold rounded-md transition-colors"
            >
              🧪 Run Test
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900 bg-opacity-80 border-2 border-red-600 rounded-lg p-4 mb-6">
            <h3 className="text-red-300 font-bold mb-2">Error:</h3>
            <p className="text-red-100">{error}</p>
          </div>
        )}

        {/* API Response */}
        {result && (
          <div className="bg-gray-800 bg-opacity-80 rounded-lg p-6 mb-6">
            <h3 className="text-white font-bold mb-4">API Response:</h3>
            <pre className="bg-gray-900 p-4 rounded text-green-300 text-sm overflow-x-auto max-h-64 overflow-y-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {/* Questions Display */}
        {questions.length > 0 && (
          <div className="bg-gray-900 bg-opacity-80 rounded-lg p-6">
            <h3 className="text-white font-bold mb-4">
              Generated Questions ({questions.length}):
            </h3>
            
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-cyan-300 font-bold">
                      Question {index + 1} (ID: {question.id})
                    </h4>
                    <div className="flex space-x-2 text-xs">
                      <span className="bg-blue-600 px-2 py-1 rounded text-white">
                        {question.category}
                      </span>
                      <span className="bg-purple-600 px-2 py-1 rounded text-white">
                        {question.difficulty}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-white mb-3 font-medium">{question.question}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {question.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`p-3 rounded text-sm ${
                          optIndex === question.correctAnswer
                            ? 'bg-green-600 text-white font-bold border-2 border-green-400'
                            : 'bg-gray-700 text-gray-300 border border-gray-600'
                        }`}
                      >
                        <span className="font-bold">{String.fromCharCode(65 + optIndex)}.</span> {option}
                      </div>
                    ))}
                  </div>
                  
                  <p className="text-green-400 text-sm mt-3 font-medium">
                    ✅ Correct Answer: {String.fromCharCode(65 + question.correctAnswer)} - {question.options[question.correctAnswer]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Usage Instructions */}
        <div className="bg-gray-900 bg-opacity-60 rounded-lg p-6 mt-8 text-gray-300 text-sm">
          <h4 className="text-white font-bold mb-3">API Usage:</h4>
          <pre className="bg-gray-800 p-3 rounded text-green-300 mb-3">
{`POST /api/quiz/custom
Content-Type: application/json

{
  "knowledgeLevel": "college",
  "context": "Ancient Greek mythology",
  "numQuestions": 10
}`}
          </pre>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-cyan-300 font-bold mb-2">Required Environment:</h5>
              <ul className="space-y-1 text-xs">
                <li>• <code>OPENROUTER_API_KEY</code> - Your OpenRouter API key</li>
                <li>• DeepSeek model access through OpenRouter</li>
                <li>• Internet connection for AI API calls</li>
              </ul>
            </div>
            <div>
              <h5 className="text-cyan-300 font-bold mb-2">Features:</h5>
              <ul className="space-y-1 text-xs">
                <li>• Real-time AI question generation</li>
                <li>• Customizable knowledge levels</li>
                <li>• Context-aware question creation</li>
                <li>• Comprehensive error handling</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
