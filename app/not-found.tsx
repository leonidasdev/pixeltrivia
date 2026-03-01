/**
 * 404 Not Found Page
 *
 * Custom page displayed when a route does not exist.
 *
 * @module app/not-found
 * @since 1.0.0
 */

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 bg-opacity-95 border-4 border-yellow-600 pixel-border p-8 text-center">
        <div className="text-8xl mb-4">🔍</div>
        <h1 className="text-2xl font-pixel text-yellow-400 pixel-text-shadow mb-2">404</h1>
        <h2 className="text-sm font-pixel text-white mb-4">Page Not Found</h2>
        <p className="text-gray-300 font-pixel-body text-lg mb-6">
          Looks like this page went on an adventure and got lost! Let&apos;s get you back to the
          game.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-pixel text-xs
                       border-4 border-purple-800 hover:border-purple-600 transition-all duration-150
                       focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-opacity-50
                       hover:scale-105 active:scale-95 pixel-border pixel-glow-hover"
          >
            🏠 MAIN MENU
          </Link>
          <Link
            href="/game/quick"
            className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-pixel text-xs
                       border-4 border-cyan-800 hover:border-cyan-600 transition-all duration-150
                       focus:outline-none focus:ring-4 focus:ring-cyan-300 focus:ring-opacity-50
                       hover:scale-105 active:scale-95 pixel-border pixel-glow-hover"
          >
            🎮 QUICK GAME
          </Link>
        </div>
      </div>
    </div>
  )
}
