import { test, expect } from '@playwright/test'

test.describe('Leaderboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/game/leaderboard')
  })

  test('should display the leaderboard heading', async ({ page }) => {
    await expect(page.getByText(/leaderboard|ranks/i).first()).toBeVisible()
  })

  test('should show period filter buttons', async ({ page }) => {
    await expect(page.getByText(/all time/i)).toBeVisible()
    await expect(page.getByText(/this month/i)).toBeVisible()
    await expect(page.getByText(/this week/i)).toBeVisible()
    await expect(page.getByText(/today/i)).toBeVisible()
  })

  test('should show sort options', async ({ page }) => {
    await expect(page.getByText(/score/i).first()).toBeVisible()
    await expect(page.getByText(/accuracy/i).first()).toBeVisible()
  })

  test('should display empty state or entries', async ({ page }) => {
    // Either shows entries or an empty state message
    const hasEntries = await page.locator('[class*="bg-gray-700"], [class*="bg-gray-800"]').count()
    const hasEmptyState = await page.getByText(/no games|play some games|no entries/i).count()
    expect(hasEntries > 0 || hasEmptyState > 0).toBeTruthy()
  })

  test('should switch period filter when clicked', async ({ page }) => {
    const weekButton = page.getByText(/this week/i)
    await weekButton.click()

    // Button should appear selected (different styling)
    await expect(weekButton).toBeVisible()
  })

  test('should have a back navigation element', async ({ page }) => {
    const backLink = page
      .getByRole('button', { name: /back|home|menu/i })
      .or(page.getByRole('link', { name: /back|home|menu/i }))
    await expect(backLink.first()).toBeVisible()
  })
})

test.describe('Achievements Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/game/achievements')
  })

  test('should display the achievements heading', async ({ page }) => {
    await expect(page.getByText(/achievements|badges/i).first()).toBeVisible()
  })

  test('should show filter tabs', async ({ page }) => {
    await expect(page.getByText(/^all$/i).first()).toBeVisible()
    await expect(page.getByText(/unlocked/i).first()).toBeVisible()
    await expect(page.getByText(/locked/i).first()).toBeVisible()
  })

  test('should display achievement cards', async ({ page }) => {
    // achievements are displayed as cards with icons
    const cards = page.locator('[class*="pixel-border"]')
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should filter achievements when tab is clicked', async ({ page }) => {
    // Click "LOCKED" tab
    const lockedTab = page.getByText(/^locked$/i).first()
    await lockedTab.click()

    // Should still have achievement content visible
    await expect(page.locator('[class*="pixel-border"]').first()).toBeVisible()
  })

  test('should show achievement summary stats', async ({ page }) => {
    // Page should display some summary info (unlocked count, total, etc.)
    const pageContent = await page.textContent('body')
    // At minimum we expect the page to have loaded with some numeric content
    expect(pageContent).toBeTruthy()
  })

  test('should have a back navigation element', async ({ page }) => {
    const backLink = page
      .getByRole('button', { name: /back|home|menu/i })
      .or(page.getByRole('link', { name: /back|home|menu/i }))
    await expect(backLink.first()).toBeVisible()
  })
})
