'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function JoinGamePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [playerSettings, setPlayerSettings] = useState({
    name: '',
    avatar: 'knight',
    volume: 50,
    mode: 'quick'
  })
  const [roomCode, setRoomCode] = useState('')

  useEffect(() => {
    const name = searchParams.get('name') || 'Player1234'
    const avatar = searchParams.get('avatar') || 'knight'
    const volume = parseInt(searchParams.get('volume') || '50')
    const mode = searchParams.get('mode') || 'quick'
    
    setPlayerSettings({ name, avatar, volume, mode })
  }, [searchParams])

  const handleJoinRoom = () => {
    if (roomCode.length === 6) {
      alert(`Joining room ${roomCode} will be available once backend is configured!`)
    } else {
      alert('Please enter a valid 6-character room code')
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-4xl font-bold text-white mb-8 pixel-text-shadow">
          JOIN GAME ROOM
        </h1>
        
        <div className="bg-gray-900 border-4 border-gray-600 rounded-lg p-8 pixel-border">
          <div className="text-6xl mb-4">🚪</div>
          <h2 className="text-xl font-bold text-blue-400 mb-4">ENTER ROOM CODE</h2>
          <p className="text-gray-300 mb-6 leading-relaxed">
            Enter the 6-character room code provided by your host to join their 
            <strong> {playerSettings.mode === 'quick' ? 'Quick Game' : 'Custom Game'}</strong> session.
          </p>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="roomCode" className="block text-sm font-bold text-cyan-300 mb-2 uppercase tracking-wider">
                Room Code
              </label>
              <input
                id="roomCode"
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="ABC123"
                maxLength={6}
                className="w-full px-4 py-3 bg-gray-800 border-3 border-gray-600 text-white font-mono text-center text-2xl tracking-widest
                         focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-opacity-50
                         placeholder-gray-400 pixel-border transition-colors duration-200"
              />
              <p className="text-xs text-gray-400 mt-2">
                6 characters • Letters and numbers • Case insensitive
              </p>
            </div>

            <button
              onClick={handleJoinRoom}
              disabled={roomCode.length !== 6}
              className={`
                w-full py-3 px-6 text-lg font-bold 
                ${roomCode.length === 6 
                  ? 'bg-blue-600 hover:bg-blue-500 border-blue-800 hover:border-blue-600 text-white cursor-pointer' 
                  : 'bg-gray-600 border-gray-800 text-gray-400 cursor-not-allowed'
                }
                border-4 rounded transition-all duration-150 pixel-border
                focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50
                disabled:hover:bg-gray-600 disabled:hover:border-gray-800
              `}
            >
              {roomCode.length === 6 ? 'JOIN ROOM' : `ENTER ${6 - roomCode.length} MORE CHARACTER${6 - roomCode.length !== 1 ? 'S' : ''}`}
            </button>
            
            <div className="text-sm text-gray-500">
              Player: {playerSettings.name} | Mode: {playerSettings.mode}
            </div>          </div>
        </div>

        <footer className="text-center text-gray-400 text-sm mt-8">
          <p>Enter a valid room code to join an existing game</p>
          <p className="text-xs mt-1 opacity-75">© 2025 PixelTrivia</p>
        </footer>
      </div>
    </main>
  )
}
