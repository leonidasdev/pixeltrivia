'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

function CreateGameContent() {
  const _router = useRouter()
  const searchParams = useSearchParams()
  const [playerSettings, setPlayerSettings] = useState({
    name: '',
    avatar: 'knight',
    volume: 50,
    mode: 'quick',
  })

  useEffect(() => {
    const name = searchParams.get('name') || 'Player1234'
    const avatar = searchParams.get('avatar') || 'knight'
    const volume = parseInt(searchParams.get('volume') || '50')
    const mode = searchParams.get('mode') || 'quick'

    setPlayerSettings({ name, avatar, volume, mode })
  }, [searchParams])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-4xl font-bold text-white mb-8 pixel-text-shadow">CREATE GAME ROOM</h1>

        <div className="bg-gray-900 border-4 border-gray-600 rounded-lg p-8 pixel-border">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-xl font-bold text-yellow-400 mb-4">COMING SOON</h2>
          <p className="text-gray-300 mb-6 leading-relaxed">
            Room creation for{' '}
            <strong>{playerSettings.mode === 'quick' ? 'Quick Game' : 'Custom Game'}</strong> is
            being developed. This will allow you to host multiplayer games with up to 8 players.
          </p>

          <div className="space-y-4">
            <div className="text-left bg-gray-800 p-4 rounded border-2 border-gray-700">
              <h3 className="font-bold text-cyan-300 mb-2">Features Coming:</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Auto-generated 6-character room codes</li>
                <li>• Real-time player joining</li>
                <li>• Game host controls</li>
                <li>• Customizable wait time</li>
                <li>• Live player list with avatars</li>
              </ul>
            </div>
            <div className="text-sm text-gray-500">
              Player: {playerSettings.name} | Mode: {playerSettings.mode}
            </div>{' '}
          </div>
        </div>

        <footer className="text-center text-gray-400 text-sm mt-8">
          <p>Room will be created when you&apos;re ready to play</p>
          <p className="text-xs mt-1 opacity-75">© 2025 PixelTrivia</p>
        </footer>
      </div>
    </main>
  )
}

export default function CreateGamePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>
      }
    >
      <CreateGameContent />
    </Suspense>
  )
}
