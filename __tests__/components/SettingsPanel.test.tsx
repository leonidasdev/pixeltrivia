/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import SettingsPanel from '@/app/components/SettingsPanel'

describe('SettingsPanel', () => {
  const defaultProps = {
    volume: 50,
    playerName: 'TestPlayer',
    selectedAvatar: 'knight',
    onVolumeChange: jest.fn(),
    onPlayerNameChange: jest.fn(),
    onAvatarSelect: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the settings panel', () => {
      render(<SettingsPanel {...defaultProps} />)

      expect(screen.getByLabelText(/player name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/volume level/i)).toBeInTheDocument()
    })

    it('should display the current player name', () => {
      render(<SettingsPanel {...defaultProps} />)

      const nameInput = screen.getByLabelText(/player name/i)
      expect(nameInput).toHaveValue('TestPlayer')
    })

    it('should display the current volume level', () => {
      render(<SettingsPanel {...defaultProps} />)

      expect(screen.getByText('50%')).toBeInTheDocument()
    })

    it('should display all avatar options', () => {
      render(<SettingsPanel {...defaultProps} />)

      expect(screen.getByRole('button', { name: /knight/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /wizard/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /archer/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /rogue/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /mage/i })).toBeInTheDocument()
    })

    it('should highlight the selected avatar', () => {
      render(<SettingsPanel {...defaultProps} selectedAvatar="wizard" />)

      const wizardButton = screen.getByRole('button', { name: /wizard/i })
      expect(wizardButton).toHaveAttribute('aria-pressed', 'true')
    })
  })

  describe('Player Name Input', () => {
    it('should call onPlayerNameChange when typing', () => {
      render(<SettingsPanel {...defaultProps} />)

      const nameInput = screen.getByLabelText(/player name/i)
      fireEvent.change(nameInput, { target: { value: 'NewName' } })

      expect(defaultProps.onPlayerNameChange).toHaveBeenCalled()
    })

    it('should have a maximum length of 20 characters', () => {
      render(<SettingsPanel {...defaultProps} />)

      const nameInput = screen.getByLabelText(/player name/i)
      expect(nameInput).toHaveAttribute('maxLength', '20')
    })

    it('should show help text about max characters', () => {
      render(<SettingsPanel {...defaultProps} />)

      expect(screen.getByText(/max 20 characters/i)).toBeInTheDocument()
    })
  })

  describe('Volume Slider', () => {
    it('should call onVolumeChange when slider is moved', () => {
      render(<SettingsPanel {...defaultProps} />)

      const volumeSlider = screen.getByRole('slider')
      fireEvent.change(volumeSlider, { target: { value: '75' } })

      expect(defaultProps.onVolumeChange).toHaveBeenCalled()
    })

    it('should have min value of 0', () => {
      render(<SettingsPanel {...defaultProps} />)

      const volumeSlider = screen.getByRole('slider')
      expect(volumeSlider).toHaveAttribute('min', '0')
    })

    it('should have max value of 100', () => {
      render(<SettingsPanel {...defaultProps} />)

      const volumeSlider = screen.getByRole('slider')
      expect(volumeSlider).toHaveAttribute('max', '100')
    })

    it('should update displayed percentage when volume changes', () => {
      const { rerender } = render(<SettingsPanel {...defaultProps} />)
      expect(screen.getByText('50%')).toBeInTheDocument()

      rerender(<SettingsPanel {...defaultProps} volume={75} />)
      expect(screen.getByText('75%')).toBeInTheDocument()
    })

    it('should show muted and max labels', () => {
      render(<SettingsPanel {...defaultProps} />)

      expect(screen.getByText('Mute')).toBeInTheDocument()
      expect(screen.getByText('Max')).toBeInTheDocument()
    })
  })

  describe('Avatar Selection', () => {
    it('should call onAvatarSelect when an avatar is clicked', () => {
      render(<SettingsPanel {...defaultProps} />)

      const wizardButton = screen.getByRole('button', { name: /wizard/i })
      fireEvent.click(wizardButton)

      expect(defaultProps.onAvatarSelect).toHaveBeenCalledWith('wizard')
    })

    it('should update selection when different avatar is chosen', () => {
      const { rerender } = render(<SettingsPanel {...defaultProps} selectedAvatar="knight" />)

      expect(screen.getByRole('button', { name: /knight/i })).toHaveAttribute(
        'aria-pressed',
        'true'
      )
      expect(screen.getByRole('button', { name: /wizard/i })).toHaveAttribute(
        'aria-pressed',
        'false'
      )

      rerender(<SettingsPanel {...defaultProps} selectedAvatar="wizard" />)

      expect(screen.getByRole('button', { name: /knight/i })).toHaveAttribute(
        'aria-pressed',
        'false'
      )
      expect(screen.getByRole('button', { name: /wizard/i })).toHaveAttribute(
        'aria-pressed',
        'true'
      )
    })

    it('should display avatar emojis', () => {
      render(<SettingsPanel {...defaultProps} />)

      expect(screen.getByText('🛡️')).toBeInTheDocument()
      expect(screen.getByText('🧙')).toBeInTheDocument()
      expect(screen.getByText('🏹')).toBeInTheDocument()
      expect(screen.getByText('🗡️')).toBeInTheDocument()
      expect(screen.getByText('✨')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper form structure', () => {
      render(<SettingsPanel {...defaultProps} />)

      const form = document.querySelector('form')
      expect(form).toBeInTheDocument()
    })

    it('should have proper labels for inputs', () => {
      render(<SettingsPanel {...defaultProps} />)

      const nameInput = screen.getByLabelText(/player name/i)
      const volumeSlider = screen.getByRole('slider')

      expect(nameInput.id).toBe('playerName')
      expect(volumeSlider.id).toBe('volumeSlider')
    })

    it('should have accessible name for volume slider', () => {
      render(<SettingsPanel {...defaultProps} />)

      const volumeSlider = screen.getByRole('slider')
      expect(volumeSlider).toHaveAttribute('aria-label', 'Volume level: 50 percent')
    })

    it('should have aria-pressed for avatar buttons', () => {
      render(<SettingsPanel {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-pressed')
      })
    })
  })
})
