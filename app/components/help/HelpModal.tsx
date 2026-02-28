/**
 * Help Modal Component
 *
 * Tabbed modal displaying help content for each game mode.
 * Tabs are dynamically shown based on visited routes.
 *
 * @module app/components/help/HelpModal
 * @since 1.0.0
 */

'use client'

import { useEffect, useState, useMemo } from 'react'
import { useHelpContext } from './HelpContext'
import { Modal } from '../ui/Modal'

export interface HelpModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Callback when the modal is closed */
  onClose: () => void
}

type HelpTab = 'general' | 'quick' | 'custom' | 'advanced'

/**
 * Tabbed help modal with dynamic content based on visited routes.
 *
 * @param props - Modal visibility and close handler
 */
export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const [activeTab, setActiveTab] = useState<HelpTab>('general')
  const { currentRoute, getAvailableHelpTabs } = useHelpContext()

  // Get available tabs from context (memoized to prevent re-render churn)
  const availableTabs = useMemo(() => {
    const availableTabsFromContext = getAvailableHelpTabs()
    return availableTabsFromContext.filter(tab =>
      ['general', 'quick', 'custom', 'advanced'].includes(tab)
    ) as HelpTab[]
  }, [getAvailableHelpTabs])

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

  // Reset to general tab if current tab becomes unavailable
  useEffect(() => {
    if (!availableTabs.includes(activeTab)) {
      setActiveTab('general')
    }
  }, [availableTabs, activeTab])

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-pixel text-white mb-3">Game Modes</h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-900/30 pixel-border border-4 border-blue-700">
                <h4 className="font-pixel text-[10px] text-blue-300">Quick Game</h4>
                <p className="text-blue-100 font-pixel-body text-base">
                  Fast-paced trivia with preset questions and immediate results.
                </p>
              </div>
              <div className="p-3 bg-purple-900/30 pixel-border border-4 border-purple-700">
                <h4 className="font-pixel text-[10px] text-purple-300">Custom Game</h4>
                <p className="text-purple-100 font-pixel-body text-base">
                  Create or join multiplayer rooms with custom settings and topics.
                </p>
              </div>
              <div className="p-3 bg-emerald-900/30 pixel-border border-4 border-emerald-700">
                <h4 className="font-pixel text-[10px] text-emerald-300">Advanced Game</h4>
                <p className="text-emerald-100 font-pixel-body text-base">
                  AI-powered questions generated from your uploaded files and documents.
                </p>
              </div>
            </div>
          </div>
        )

      case 'quick':
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-pixel text-blue-300 mb-3">Quick Game</h3>
            <p className="text-white/90 font-pixel-body text-base">
              Jump straight into a trivia game with curated questions across various topics.
            </p>
            <div className="space-y-2">
              <h4 className="font-pixel text-[10px] text-blue-300">Features:</h4>
              <ul className="list-disc list-inside space-y-1 text-blue-100 font-pixel-body text-base">
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
            <h3 className="text-sm font-pixel text-purple-300 mb-3">Custom Game</h3>
            <p className="text-white/90 font-pixel-body text-base">
              Create private rooms or join existing ones for multiplayer trivia sessions.
            </p>
            <div className="space-y-2">
              <h4 className="font-pixel text-[10px] text-purple-300">Features:</h4>
              <ul className="list-disc list-inside space-y-1 text-purple-100 font-pixel-body text-base">
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
            <h3 className="text-sm font-pixel text-emerald-300 mb-3">Advanced Game</h3>
            <p className="text-white/90 font-pixel-body text-base">
              Upload your own documents and let AI generate custom trivia questions.
            </p>
            <div className="space-y-2">
              <h4 className="font-pixel text-[10px] text-emerald-300">Features:</h4>
              <ul className="list-disc list-inside space-y-1 text-emerald-100 font-pixel-body text-base">
                <li>AI-powered question generation from uploaded content</li>
                <li>Support for various file formats (PDF, DOCX, TXT)</li>
                <li>Customizable question count and difficulty</li>
                <li>Content analysis and topic extraction</li>
                <li>Perfect for studying or testing knowledge</li>
              </ul>
            </div>
            <div className="mt-4 p-3 bg-yellow-900/30 pixel-border border-4 border-yellow-700">
              <p className="text-yellow-200 font-pixel-body text-base">
                <strong>Note:</strong> Uploading files may take up to 2 minutes depending on size.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Help & Information"
      titleClassName="text-lg font-pixel text-white pixel-text-shadow"
      size="lg"
      className="bg-gradient-to-br from-gray-800 to-gray-900 pixel-border"
    >
      {/* Tabs */}
      <div className="flex border-b-2 border-gray-600 bg-gray-800/50 -mx-4 -mt-4 mb-4">
        {availableTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              px-4 py-2 font-pixel text-[10px] capitalize transition-colors border-b-2
              ${
                activeTab === tab
                  ? 'text-white border-blue-400 bg-blue-900/30'
                  : 'text-gray-300 border-transparent hover:text-white hover:bg-gray-700/50'
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </Modal>
  )
}
