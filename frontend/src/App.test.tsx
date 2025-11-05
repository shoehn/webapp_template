import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('App Component', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('should render the main title', () => {
    render(<App />)
    expect(screen.getByText('Web App Template')).toBeInTheDocument()
  })

  it('should render the tech stack description', () => {
    render(<App />)
    expect(
      screen.getByText(/Axum \+ Diesel \+ SQLite \+ React \+ Vite \+ Tailwind \+ shadcn-ui/i)
    ).toBeInTheDocument()
  })

  it('should render fetch button', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /fetch from api/i })).toBeInTheDocument()
  })

  it('should show loading state when fetching', async () => {
    const user = userEvent.setup()

    mockFetch.mockImplementation(() =>
      new Promise(resolve => setTimeout(() =>
        resolve({
          ok: true,
          json: async () => ({ message: 'Hello', timestamp: 1234567890 })
        }), 100))
    )

    render(<App />)

    const button = screen.getByRole('button', { name: /fetch from api/i })
    await user.click(button)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(button).toBeDisabled()
  })

  it('should display API response on successful fetch', async () => {
    const user = userEvent.setup()
    const mockResponse = {
      message: 'Hello from Axum!',
      timestamp: 1234567890
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    render(<App />)

    await user.click(screen.getByRole('button', { name: /fetch from api/i }))

    await waitFor(() => {
      expect(screen.getByText('API Response:')).toBeInTheDocument()
      expect(screen.getByText('Hello from Axum!')).toBeInTheDocument()
    })
  })

  it('should display error message on failed fetch', async () => {
    const user = userEvent.setup()

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    })

    render(<App />)

    await user.click(screen.getByRole('button', { name: /fetch from api/i }))

    await waitFor(() => {
      expect(screen.getByText(/Error:/i)).toBeInTheDocument()
      expect(screen.getByText(/Make sure the backend is running on port 3000/i)).toBeInTheDocument()
    })
  })

  it('should display error message when network fails', async () => {
    const user = userEvent.setup()

    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(<App />)

    await user.click(screen.getByRole('button', { name: /fetch from api/i }))

    await waitFor(() => {
      expect(screen.getByText(/Error: Network error/i)).toBeInTheDocument()
    })
  })

  it('should render quick start instructions', () => {
    render(<App />)

    expect(screen.getByText('Quick Start:')).toBeInTheDocument()
    expect(screen.getByText(/cd backend && cargo run/i)).toBeInTheDocument()
    expect(screen.getByText(/cd frontend && npm run dev/i)).toBeInTheDocument()
    expect(screen.getByText(/\.\/scripts\/dev\.sh/i)).toBeInTheDocument()
  })
})
