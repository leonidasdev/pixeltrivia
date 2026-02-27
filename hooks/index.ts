/**
 * Custom Hooks Index
 *
 * Central export point for all custom React hooks.
 *
 * @module hooks
 * @since 1.0.0
 */

export { useGameState } from './useGameState'
export { useLocalStorage } from './useLocalStorage'
export { useTimer } from './useTimer'
export { useQuizSession } from './useQuizSession'
export { usePlayerSettings, buildPlayerParams, buildPlayerUrl } from './usePlayerSettings'
export type { PlayerSettings, PlayerInfo, UsePlayerSettingsReturn } from './usePlayerSettings'
export { useRoom } from './useRoom'
export type { UseRoomOptions, UseRoomReturn } from './useRoom'
export { useMultiplayerGame } from './useMultiplayerGame'
export type {
  MultiplayerGamePhase,
  UseMultiplayerGameOptions,
  UseMultiplayerGameReturn,
} from './useMultiplayerGame'
export { useSound } from './useSound'
export type { UseSoundReturn } from './useSound'
