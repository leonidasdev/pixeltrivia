/**
 * UI Components Index
 *
 * Reusable pixel-art styled UI components.
 *
 * @module app/components/ui
 * @since 1.0.0
 */

// ============================================================================
// Core Components
// ============================================================================

export { PixelButton } from './PixelButton'
export type { PixelButtonProps, PixelButtonVariant, PixelButtonSize } from './PixelButton'

export { LoadingSpinner, LoadingOverlay, LoadingDots } from './LoadingSpinner'
export type { LoadingSpinnerProps, LoadingSpinnerSize } from './LoadingSpinner'

export { Modal } from './Modal'
export type { ModalProps } from './Modal'

export { PixelCard } from './PixelCard'
export type { PixelCardProps } from './PixelCard'

export { PixelInput } from './PixelInput'
export type { PixelInputProps } from './PixelInput'

export { PixelBadge } from './PixelBadge'
export type { PixelBadgeProps, PixelBadgeVariant } from './PixelBadge'

// ============================================================================
// Background & Animation Components
// ============================================================================

export { AnimatedBackground, PageBackground, SparklesOverlay } from './AnimatedBackground'
export type {
  AnimatedBackgroundProps,
  SparkleConfig,
  SparklePreset,
  GradientPreset,
} from './AnimatedBackground'

// ============================================================================
// Layout Components
// ============================================================================

export { PageHeader, SectionHeader } from './PageHeader'
export type { PageHeaderProps, SectionHeaderProps } from './PageHeader'

export {
  GamePageLayout,
  MenuPageLayout,
  ConfigPageLayout,
  ContentCard,
  ActionGroup,
} from './GamePageLayout'
export type {
  GamePageLayoutProps,
  MenuPageLayoutProps,
  ConfigPageLayoutProps,
  ContentCardProps,
  ActionGroupProps,
} from './GamePageLayout'

// ============================================================================
// Player Components
// ============================================================================

export { AvatarDisplay, PlayerDisplay, PlayerBadge, PlayerList } from './PlayerDisplay'
export type {
  AvatarDisplayProps,
  PlayerDisplayProps,
  PlayerBadgeProps,
  PlayerListProps,
} from './PlayerDisplay'

// ============================================================================
// Feedback Components
// ============================================================================

export { Toast, ToastContainer, useToast } from './Toast'
export type { ToastProps, ToastContainerProps, ToastMessage, ToastVariant } from './Toast'
