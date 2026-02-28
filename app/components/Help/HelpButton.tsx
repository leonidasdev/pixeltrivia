'use client'

import { useState } from 'react'
import HelpModal from './HelpModal'

export default function HelpButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleOpenModal()
    }
  }

  return (
    <>
      <button
        onClick={handleOpenModal}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          flex items-center justify-center
          w-12 h-12 sm:w-14 sm:h-14
          bg-gradient-to-br from-green-600 to-emerald-700
          border-3 border-green-800
          text-white font-bold text-lg sm:text-xl
          transition-all duration-200 ease-in-out
          focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-50
          pixel-border
          ${
            isHovered
              ? 'scale-110 pixel-shadow translate-x-1 translate-y-1 border-green-600 from-green-500 to-emerald-600'
              : 'hover:scale-110 hover:pixel-shadow hover:translate-x-1 hover:translate-y-1 hover:border-green-600 hover:from-green-500 hover:to-emerald-600'
          }
          active:scale-95 active:translate-x-0 active:translate-y-0
        `}
        aria-label="Open help and game information"
        title="Help & Info"
      >
        <span className="select-none" aria-hidden="true">
          ?
        </span>
      </button>

      {isModalOpen && <HelpModal isOpen={isModalOpen} onClose={handleCloseModal} />}
    </>
  )
}
