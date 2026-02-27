'use client'

import { useState } from 'react'
import { fetchQuickQuiz, type QuickQuizQuestion, type QuickQuizResponse } from '@/lib/quickQuizApi'

export default function QuizTestPage() {
  const [category, setCategory] = useState('')
  const [questions, setQuestions] = useState<QuickQuizQuestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<QuickQuizResponse | null>(null)

  const handleFetchQuiz = async () => {
    if (!category.trim()) {
      setError('Please enter a category')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetchQuickQuiz(category)
      setResult(response)

      if (response.success && response.data) {
        setQuestions(response.data)
        setError(null)
      } else {
        setError(response.error || 'Failed to fetch questions')
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
      const testResult = await fetchQuickQuiz('Science')
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

  const categories = [
    'Science',
    'Geography',
    'Mathematics',
    'Animals',
    'Art',
    'History',
    'Sports',
    'Music',
    'Food',
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 pixel-text-shadow">
            Quick Quiz API Test
          </h1>
          <p className="text-cyan-300">Test the /api/quiz/quick endpoint</p>
        </header>

        {/* Test Controls */}
        <div className="bg-gray-900 bg-opacity-80 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Test Controls</h2>

          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-64">
              <label htmlFor="category" className="block text-cyan-300 font-bold mb-2">
                Category:
              </label>
              <input
                id="category"
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="Enter category (e.g., Science)"
                className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-600 text-white rounded-md
                         focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div className="flex items-end space-x-2">
              <button
                onClick={handleFetchQuiz}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600
                         text-white font-bold rounded-md transition-colors"
              >
                {loading ? 'Loading...' : 'Fetch Quiz'}
              </button>

              <button
                onClick={handleTestAPI}
                disabled={loading}
                className="px-6 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600
                         text-white font-bold rounded-md transition-colors"
              >
                Run Test
              </button>
            </div>
          </div>

          {/* Quick Category Buttons */}
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded
                         transition-colors"
              >
                {cat}
              </button>
            ))}
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
            <pre className="bg-gray-900 p-4 rounded text-green-300 text-sm overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {/* Questions Display */}
        {questions.length > 0 && (
          <div className="bg-gray-900 bg-opacity-80 rounded-lg p-6">
            <h3 className="text-white font-bold mb-4">Questions Found ({questions.length}):</h3>

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

                  <p className="text-white mb-3">{question.question}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {question.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`p-2 rounded text-sm ${
                          optIndex === question.correctAnswer
                            ? 'bg-green-600 text-white font-bold'
                            : 'bg-gray-700 text-gray-300'
                        }`}
                      >
                        {optIndex + 1}. {option}
                      </div>
                    ))}
                  </div>

                  <p className="text-green-400 text-xs mt-2">
                    Correct Answer: {question.correctAnswer + 1} -{' '}
                    {question.options[question.correctAnswer]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Usage Instructions */}
        <div className="bg-gray-900 bg-opacity-60 rounded-lg p-6 mt-8 text-gray-300 text-sm">
          <h4 className="text-white font-bold mb-2">API Usage:</h4>
          <pre className="bg-gray-800 p-3 rounded text-green-300 mb-2">
            {`POST /api/quiz/quick
Content-Type: application/json

{
  "category": "Science"
}`}
          </pre>
          <p>
            The API returns up to 10 questions matching the category with question, options,
            correctAnswer, and id fields.
          </p>
        </div>
      </div>
    </main>
  )
}
