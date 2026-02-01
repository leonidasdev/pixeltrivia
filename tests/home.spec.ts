import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display the main title', async ({ page }) => {
    // Check for PIXEL and TRIVIA titles using role heading
    await expect(page.getByRole('heading', { name: 'PIXEL' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'TRIVIA' })).toBeVisible()
  })

  test('should display main menu buttons', async ({ page }) => {
    // Check for main action buttons by their visible text
    await expect(page.getByText('START NEW GAME')).toBeVisible()
    await expect(page.getByText('JOIN EXISTING GAME')).toBeVisible()
  })

  test('should display help and settings buttons', async ({ page }) => {
    // Help and settings buttons with emoji text
    await expect(page.getByText('❓ HELP')).toBeVisible()
    await expect(page.getByText('⚙️')).toBeVisible()
  })

  test('should show settings panel when settings button clicked', async ({ page }) => {
    // Click settings button (the gear icon)
    await page.getByText('⚙️').click()

    // Settings panel should appear with player name and volume
    await expect(page.getByText('Player Name')).toBeVisible()
    await expect(page.getByText('Sound Volume')).toBeVisible()
  })
})

test.describe('Navigation', () => {
  test('should navigate to game mode selection when starting new game', async ({ page }) => {
    await page.goto('/')

    // Click start new game (player name is auto-generated)
    await page.getByText('START NEW GAME').click()

    // Should navigate to game mode page
    await expect(page).toHaveURL(/\/game\/mode/)
  })

  test('should show alert for join game coming soon', async ({ page }) => {
    await page.goto('/')

    // Set up dialog handler
    let dialogMessage = ''
    page.on('dialog', async dialog => {
      dialogMessage = dialog.message()
      await dialog.accept()
    })

    // Click join existing game
    await page.getByText('JOIN EXISTING GAME').click()

    // Should show "coming soon" alert
    expect(dialogMessage).toContain('Coming soon')
  })
})

test.describe('Settings Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Open settings by clicking gear icon
    await page.getByText('⚙️').click()
  })

  test('should allow changing player name', async ({ page }) => {
    const nameInput = page.locator('#playerName')
    await nameInput.clear()
    await nameInput.fill('TestPlayer')
    await expect(nameInput).toHaveValue('TestPlayer')
  })

  test('should allow changing volume', async ({ page }) => {
    const volumeSlider = page.getByRole('slider')
    await expect(volumeSlider).toBeVisible()

    // Volume should have a value
    const value = await volumeSlider.inputValue()
    expect(parseInt(value)).toBeGreaterThanOrEqual(0)
    expect(parseInt(value)).toBeLessThanOrEqual(100)
  })

  test('should allow selecting avatars', async ({ page }) => {
    // Knight should be selected by default
    const knightButton = page.getByRole('button', { name: /select knight avatar/i })
    await expect(knightButton).toHaveAttribute('aria-pressed', 'true')

    // Click on wizard avatar
    await page.getByRole('button', { name: /select wizard avatar/i }).click()

    // Wizard should now be selected
    await expect(page.getByRole('button', { name: /select wizard avatar/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    await expect(knightButton).toHaveAttribute('aria-pressed', 'false')
  })
})
