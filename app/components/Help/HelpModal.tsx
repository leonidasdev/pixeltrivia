'use client'

import { useEffect, useState } from 'react'
import { useHelpContext } from './HelpContext'

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

type HelpTab = 'general' | 'quick' | 'custom' | 'advanced'

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const [activeTab, setActiveTab] = useState<HelpTab>('general')
  const { currentRoute, getAvailableHelpTabs } = useHelpContext()

  // Get available tabs from context
  const availableTabsFromContext = getAvailableHelpTabs()
  const availableTabs: HelpTab[] = availableTabsFromContext.filter(tab => 
    ['general', 'quick', 'custom', 'advanced'].includes(tab)
  ) as HelpTab[]

  // Set appropriate tab based on current route
  useEffect(() => {
    if (currentRoute.includes('/game/quick') && availableTabs.includes('quick')) {
      setActiveTab('quick')
    } else if (currentRoute.includes('/game/custom') && availableTabs.includes('custom')) {
      setActiveTab('custom')
    } else if (currentRoute.includes('/game/advanced') && availableTabs.includes('advanced')) {
      setActiveTab('advanced')
    }
  }, [currentRoute, availableTabs])

  // Close modal with Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Reset to general tab if current tab becomes unavailable
  useEffect(() => {
    if (!availableTabs.includes(activeTab)) {
      setActiveTab('general')
    }
  }, [availableTabs, activeTab])

  if (!isOpen) return null

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-3">Game Modes</h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-900/30 rounded-lg border border-blue-700">
                <h4 className="font-bold text-blue-300">Quick Game</h4>
                <p className="text-blue-100 text-sm">Fast-paced trivia with preset questions and immediate results.</p>
              </div>
              <div className="p-3 bg-purple-900/30 rounded-lg border border-purple-700">
                <h4 className="font-bold text-purple-300">Custom Game</h4>
                <p className="text-purple-100 text-sm">Create or join multiplayer rooms with custom settings and topics.</p>
              </div>
              <div className="p-3 bg-emerald-900/30 rounded-lg border border-emerald-700">
                <h4 className="font-bold text-emerald-300">Advanced Game</h4>
                <p className="text-emerald-100 text-sm">AI-powered questions generated from your uploaded files and documents.</p>
              </div>
            </div>
          </div>
        )

      case 'quick':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-blue-300 mb-3">Quick Game</h3>
            <p className="text-white/90">
              Jump straight into a trivia game with curated questions across various topics.
            </p>
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-300">Features:</h4>
              <ul className="list-disc list-inside space-y-1 text-blue-100 text-sm">
                <li>Preset question packs covering popular topics</li>
                <li>Multiple difficulty levels (Easy, Medium, Hard)</li>
                <li>Timed rounds with score tracking</li>
                <li>Single-player and multiplayer modes</li>
                <li>Instant feedback and explanations</li>
              </ul>
            </div>
          </div>
        )

      case 'custom':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-purple-300 mb-3">Custom Game</h3>
            <p className="text-white/90">
              Create private rooms or join existing ones for multiplayer trivia sessions.
            </p>
            <div className="space-y-2">
              <h4 className="font-semibold text-purple-300">Features:</h4>
              <ul className="list-disc list-inside space-y-1 text-purple-100 text-sm">
                <li>Private room codes for controlled access</li>
                <li>Customizable timer settings and round limits</li>
                <li>Real-time multiplayer with live leaderboards</li>
                <li>Chat functionality during games</li>
                <li>Host controls for game management</li>
              </ul>
            </div>
          </div>
        )

      case 'advanced':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-emerald-300 mb-3">Advanced Game</h3>
            <p className="text-white/90">
              Upload your own documents and let AI generate custom trivia questions.
            </p>
            <div className="space-y-2">
              <h4 className="font-semibold text-emerald-300">Features:</h4>
              <ul className="list-disc list-inside space-y-1 text-emerald-100 text-sm">
                <li>AI-powered question generation from uploaded content</li>
                <li>Support for various file formats (PDF, DOCX, TXT)</li>
                <li>Customizable question count and difficulty</li>
                <li>Content analysis and topic extraction</li>
                <li>Perfect for studying or testing knowledge</li>
              </ul>
            </div>
            <div className="mt-4 p-3 bg-yellow-900/30 rounded-lg border border-yellow-700">
              <p className="text-yellow-200 text-sm">
                <strong>Note:</strong> Uploading files may take up to 2 minutes depending on size.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-4 border-gray-600 pixel-border max-w-2xl w-full max-h-[80vh] overflow-hidden animate-slideIn">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-gray-600 bg-gray-800/80">
          <h2 className="text-2xl font-bold text-white pixel-text-shadow">Help & Information</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-label="Close help modal"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b-2 border-gray-600 bg-gray-800/50">
          {availableTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-4 py-2 font-semibold capitalize transition-colors border-b-2
                ${activeTab === tab 
                  ? 'text-white border-blue-400 bg-blue-900/30' 
                  : 'text-gray-300 border-transparent hover:text-white hover:bg-gray-700/50'
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}
