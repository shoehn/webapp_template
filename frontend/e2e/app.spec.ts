import { test, expect } from '@playwright/test'

test.describe('Web App Template', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display the main page title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Web App Template' })).toBeVisible()
  })

  test('should display tech stack description', async ({ page }) => {
    await expect(page.getByText(/Axum \+ Diesel \+ SQLite/i)).toBeVisible()
  })

  test('should have fetch API button', async ({ page }) => {
    const button = page.getByRole('button', { name: /fetch from api/i })
    await expect(button).toBeVisible()
    await expect(button).toBeEnabled()
  })

  test('should show loading state when clicking fetch button', async ({ page }) => {
    // Mock the API response with a delay
    await page.route('/api/hello', async route => {
      await new Promise(resolve => setTimeout(resolve, 500))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Hello from Axum!',
          timestamp: Math.floor(Date.now() / 1000)
        })
      })
    })

    const button = page.getByRole('button', { name: /fetch from api/i })
    await button.click()

    // Should show loading state
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(button).toBeDisabled()
  })

  test('should display API response on successful fetch', async ({ page }) => {
    await page.route('/api/hello', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Hello from Axum!',
          timestamp: 1234567890
        })
      })
    })

    await page.getByRole('button', { name: /fetch from api/i }).click()

    await expect(page.getByText('API Response:')).toBeVisible()
    await expect(page.getByText('Hello from Axum!')).toBeVisible()
    await expect(page.getByText(/Timestamp:/i)).toBeVisible()
  })

  test('should display error message on failed fetch', async ({ page }) => {
    await page.route('/api/hello', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      })
    })

    await page.getByRole('button', { name: /fetch from api/i }).click()

    await expect(page.getByText(/Error:/i)).toBeVisible()
    await expect(page.getByText(/Make sure the backend is running/i)).toBeVisible()
  })

  test('should display quick start instructions', async ({ page }) => {
    await expect(page.getByText('Quick Start:')).toBeVisible()
    await expect(page.getByText(/cd backend && cargo run/i)).toBeVisible()
    await expect(page.getByText(/cd frontend && npm run dev/i)).toBeVisible()
    await expect(page.getByText(/\.\/scripts\/dev\.sh/i)).toBeVisible()
  })

  test('should have proper page structure', async ({ page }) => {
    // Check for main container
    const mainContainer = page.locator('.min-h-screen')
    await expect(mainContainer).toBeVisible()

    // Check for card component
    const card = page.locator('.rounded-lg.border')
    await expect(card).toBeVisible()
  })

  test('error message should disappear when retrying fetch after error', async ({ page }) => {
    // First call fails
    let callCount = 0
    await page.route('/api/hello', route => {
      callCount++
      if (callCount === 1) {
        route.fulfill({ status: 500 })
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Success on retry!',
            timestamp: 1234567890
          })
        })
      }
    })

    const button = page.getByRole('button', { name: /fetch from api/i })

    // First click - should show error
    await button.click()
    await expect(page.getByText(/Error:/i)).toBeVisible()

    // Second click - should show success and error should be gone
    await button.click()
    await expect(page.getByText(/Error:/i)).not.toBeVisible()
    await expect(page.getByText('Success on retry!')).toBeVisible()
  })
})
