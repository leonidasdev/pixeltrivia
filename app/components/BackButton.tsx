/**
 * Back Button
 *
 * Pixel-art styled navigation button that returns
 * to the previous page.
 *
 * @module app/components/BackButton
 * @since 1.0.0
 */

'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'

export default function BackButton() {
  const router = useRouter()
  const pathname = usePathname()
  const [isHovered, setIsHovered] = useState(false)
  // Don't show on main menu or during active gameplay
  if (pathname === '/' || pathname.includes('/play')) {
    return null
  }

  const handleBack = () => {
    router.back()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleBack()
    }
  }
  return (
    <button
      onClick={handleBack}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        flex items-center justify-center
        w-12 h-12 sm:w-14 sm:h-14
        bg-gradient-to-br from-gray-600 to-gray-700
        border-3 border-gray-800
        text-white font-bold text-lg sm:text-xl
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-4 focus:ring-gray-300 focus:ring-opacity-50
        pixel-border
        ${
          isHovered
            ? 'scale-110 pixel-shadow translate-x-1 translate-y-1 border-gray-600 from-gray-500 to-gray-600'
            : 'hover:scale-110 hover:pixel-shadow hover:translate-x-1 hover:translate-y-1 hover:border-gray-600 hover:from-gray-500 hover:to-gray-600'
        }
        active:scale-95 active:translate-x-0 active:translate-y-0
      `}
      aria-label="Go back to previous page"
      title="Go back"
    >
      <span className="select-none" aria-hidden="true">
        ←
      </span>
    </button>
  )
}
