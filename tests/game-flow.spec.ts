import { test, expect } from '@playwright/test'

test.describe('Game Mode Selection', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to game mode page with player params
    await page.goto('/game/mode?name=TestPlayer&avatar=knight&volume=50')
  })

  test('should display game mode options', async ({ page }) => {
    // Should show Quick Game option
    await expect(page.getByText(/quick game/i).first()).toBeVisible()

    // Should show Custom Game option
    await expect(page.getByText(/custom game/i).first()).toBeVisible()
  })

  test('should navigate to quick game select page when selected', async ({ page }) => {
    // Click on Quick Game mode
    await page.getByRole('button', { name: /quick game/i }).click()

    // Should navigate to quick game select page
    await expect(page).toHaveURL(/\/game\/select.*mode=quick/)
  })

  test('should navigate to custom game select page when selected', async ({ page }) => {
    // Click on Custom Game mode
    await page.getByRole('button', { name: /custom game/i }).click()

    // Should navigate to custom game select page
    await expect(page).toHaveURL(/\/game\/select.*mode=custom/)
  })
})

test.describe('Quick Game Select Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/game/select?mode=quick&name=TestPlayer&avatar=knight&volume=50')
  })

  test('should display the page title', async ({ page }) => {
    // Should show quick game heading
    await expect(page.getByText(/quick game/i).first()).toBeVisible()
  })
})

test.describe('Custom Game Select Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/game/select?mode=custom&name=TestPlayer&avatar=knight&volume=50')
  })

  test('should display custom game configurator', async ({ page }) => {
    // Should show custom game page
    await expect(
      page
        .getByText(/custom game/i)
        .or(page.getByText(/generate/i))
        .first()
    ).toBeVisible()
  })
})
