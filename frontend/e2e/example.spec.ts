import { test, expect } from '@playwright/test'

/**
 * Example E2E test demonstrating various Playwright features
 * This file serves as a template for writing more comprehensive tests
 */

test.describe('Example E2E Tests', () => {
  test('complete user flow - fetch API data', async ({ page }) => {
    // Navigate to the page
    await page.goto('/')

    // Take a screenshot of initial state
    await page.screenshot({ path: 'test-results/initial-state.png', fullPage: true })

    // Mock the API endpoint
    await page.route('/api/hello', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Test message from mock',
          timestamp: 1234567890
        })
      })
    })

    // Verify page loaded correctly
    await expect(page).toHaveTitle(/frontend/i)

    // Find and click the fetch button
    const fetchButton = page.getByRole('button', { name: /fetch from api/i })
    await expect(fetchButton).toBeVisible()
    await fetchButton.click()

    // Wait for and verify the response
    await expect(page.getByText('API Response:')).toBeVisible()
    await expect(page.getByText('Test message from mock')).toBeVisible()

    // Take a screenshot of success state
    await page.screenshot({ path: 'test-results/success-state.png', fullPage: true })
  })

  test('check responsive design', async ({ page, viewport }) => {
    await page.goto('/')

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.getByText('Web App Template')).toBeVisible()

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.getByText('Web App Template')).toBeVisible()

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page.getByText('Web App Template')).toBeVisible()
  })

  test('accessibility check - keyboard navigation', async ({ page }) => {
    await page.goto('/')

    // Tab to the fetch button
    await page.keyboard.press('Tab')

    // Verify button is focused
    const fetchButton = page.getByRole('button', { name: /fetch from api/i })
    await expect(fetchButton).toBeFocused()

    // Press Enter to click
    await page.keyboard.press('Enter')

    // The button should show loading or response
    await expect(
      page.getByText('Loading...').or(page.getByText('Error:'))
    ).toBeVisible({ timeout: 5000 })
  })

  test('verify all text content is present', async ({ page }) => {
    await page.goto('/')

    // Check all important text elements
    const expectedTexts = [
      'Web App Template',
      'Quick Start:',
      'Backend:',
      'Frontend:',
      'cd backend && cargo run',
      'cd frontend && npm run dev',
      './scripts/dev.sh'
    ]

    for (const text of expectedTexts) {
      await expect(page.getByText(text, { exact: false })).toBeVisible()
    }
  })

  test('network error handling', async ({ page }) => {
    await page.goto('/')

    // Simulate network failure
    await page.route('/api/hello', route => route.abort('failed'))

    await page.getByRole('button', { name: /fetch from api/i }).click()

    // Should show error message
    await expect(page.getByText(/Error:/i)).toBeVisible({ timeout: 5000 })
  })
})
