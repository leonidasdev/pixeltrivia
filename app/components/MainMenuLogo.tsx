/**
 * Main Menu Logo
 *
 * Animated pixel-art logo displayed on the home page
 * and game mode screens.
 *
 * @module app/components/MainMenuLogo
 * @since 1.0.0
 */

'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function MainMenuLogo() {
  const pathname = usePathname()
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)

  // Hide during active gameplay sessions
  if (pathname.includes('/play')) {
    return null
  }

  const handleLogoClick = () => {
    router.push('/')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleLogoClick()
    }
  }
  return (
    <button
      onClick={handleLogoClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        flex flex-col items-center justify-center
        w-16 h-16 sm:w-20 sm:h-20
        bg-gradient-to-br from-indigo-600 to-purple-700
        border-3 border-indigo-800
        text-white font-bold
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:ring-opacity-50
        pixel-border
        ${
          isHovered
            ? 'scale-105 pixel-shadow translate-x-1 translate-y-1 border-indigo-600 from-indigo-500 to-purple-600'
            : 'hover:scale-105 hover:pixel-shadow hover:translate-x-1 hover:translate-y-1 hover:border-indigo-600 hover:from-indigo-500 hover:to-purple-600'
        }
        active:scale-95 active:translate-x-0 active:translate-y-0
      `}
      aria-label="PixelTrivia - Go to main menu"
      title="PixelTrivia - Main Menu"
    >
      {/* Logo Content */}
      <div className="text-center select-none">
        <div className="text-xl sm:text-2xl mb-1" role="img" aria-hidden="true">
          🎮
        </div>
        <div className="text-xs sm:text-sm font-bold leading-tight pixel-text-shadow">PIXEL</div>
        <div className="text-xs text-purple-200 leading-tight">TRIVIA</div>
      </div>
    </button>
  )
}
