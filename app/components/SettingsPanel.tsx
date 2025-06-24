import React from 'react'

interface SettingsPanelProps {
  volume: number
  playerName: string
  selectedAvatar: string
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onPlayerNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onAvatarSelect: (avatarId: string) => void
}

const AVATAR_OPTIONS = [
  { id: 'knight', name: 'Knight', emoji: '🛡️', color: 'bg-red-600' },
  { id: 'wizard', name: 'Wizard', emoji: '🧙', color: 'bg-purple-600' },
  { id: 'archer', name: 'Archer', emoji: '🏹', color: 'bg-green-600' },
  { id: 'rogue', name: 'Rogue', emoji: '🗡️', color: 'bg-gray-600' },
  { id: 'mage', name: 'Mage', emoji: '✨', color: 'bg-blue-600' },
]

export default function SettingsPanel({
  volume,
  playerName,
  selectedAvatar,
  onVolumeChange,
  onPlayerNameChange,
  onAvatarSelect,
}: SettingsPanelProps) {
  return (
    <div className="w-full">
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        {/* Player Name Input */}
        <div className="space-y-2">
          <label 
            htmlFor="playerName" 
            className="block text-sm font-bold text-cyan-300 uppercase tracking-wider"
          >
            Player Name
          </label>
          <input
            id="playerName"
            type="text"
            value={playerName}
            onChange={onPlayerNameChange}
            placeholder="Enter your name"
            maxLength={20}
            className="w-full px-4 py-3 bg-gray-800 border-3 border-gray-600 text-white font-pixel
                     focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-opacity-50
                     placeholder-gray-400 text-lg pixel-border transition-colors duration-200"
            aria-describedby="playerNameHelp"
          />
          <p id="playerNameHelp" className="text-xs text-gray-400">
            Max 20 characters • This name will be displayed in the game
          </p>
        </div>

        {/* Volume Control */}
        <div className="space-y-3">
          <label 
            htmlFor="volumeSlider" 
            className="flex justify-between items-center text-sm font-bold text-cyan-300 uppercase tracking-wider"
          >
            <span>Sound Volume</span>
            <span className="text-white text-lg">{volume}%</span>
          </label>
          <div className="relative">
            <input
              id="volumeSlider"
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={onVolumeChange}
              className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer
                       focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-opacity-50"
              style={{
                background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${volume}%, #374151 ${volume}%, #374151 100%)`
              }}
              aria-label={`Volume level: ${volume} percent`}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
              <span>Mute</span>
              <span>Mid</span>
              <span>Max</span>
            </div>
          </div>
        </div>

        {/* Avatar Selector */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-cyan-300 uppercase tracking-wider">
            Choose Avatar
          </label>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {AVATAR_OPTIONS.map((avatar) => (
              <button
                key={avatar.id}
                type="button"
                onClick={() => onAvatarSelect(avatar.id)}
                className={`
                  relative p-3 border-3 rounded-lg transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-opacity-50
                  ${selectedAvatar === avatar.id
                    ? `${avatar.color} border-white scale-105 pixel-shadow`
                    : `${avatar.color} border-gray-600 hover:border-gray-400 hover:scale-105 opacity-70 hover:opacity-100`
                  }
                `}
                aria-label={`Select ${avatar.name} avatar`}
                aria-pressed={selectedAvatar === avatar.id}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1" role="img" aria-label={avatar.name}>
                    {avatar.emoji}
                  </div>
                  <div className="text-xs font-bold text-white uppercase leading-tight">
                    {avatar.name}
                  </div>
                </div>
                {selectedAvatar === avatar.id && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-400 border-2 border-yellow-600 rounded-full flex items-center justify-center">
                    <span className="text-xs text-black font-bold" aria-hidden="true">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center">
            Your avatar represents you in multiplayer games
          </p>        </div>
      </form>
    </div>
  )
}
