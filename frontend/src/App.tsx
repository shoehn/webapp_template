import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ApiResponse {
  message: string
  timestamp: number
}

function App() {
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFromApi = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/hello')
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const data: ApiResponse = await res.json()
      setResponse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--color-background))] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Web App Template</CardTitle>
          <CardDescription>
            Axum + Diesel + SQLite + React + Vite + Tailwind + shadcn-ui
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={fetchFromApi}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Loading...' : 'Fetch from API'}
          </Button>

          {error && (
            <div className="p-4 bg-[hsl(var(--color-destructive))]/10 border border-[hsl(var(--color-destructive))] rounded-md">
              <p className="text-sm text-[hsl(var(--color-destructive))]">Error: {error}</p>
              <p className="text-xs text-[hsl(var(--color-muted-foreground))] mt-1">
                Make sure the backend is running on port 3000
              </p>
            </div>
          )}

          {response && (
            <div className="p-4 bg-[hsl(var(--color-secondary))] rounded-md space-y-2">
              <p className="text-sm font-medium">API Response:</p>
              <p className="text-sm text-[hsl(var(--color-muted-foreground))]">{response.message}</p>
              <p className="text-xs text-[hsl(var(--color-muted-foreground))]">
                Timestamp: {new Date(response.timestamp * 1000).toLocaleString()}
              </p>
            </div>
          )}

          <div className="pt-4 border-t space-y-2">
            <p className="text-sm font-medium">Quick Start:</p>
            <ul className="text-xs text-[hsl(var(--color-muted-foreground))] space-y-1">
              <li>• Backend: <code className="bg-[hsl(var(--color-muted))] px-1 py-0.5 rounded">cd backend && cargo run</code></li>
              <li>• Frontend: <code className="bg-[hsl(var(--color-muted))] px-1 py-0.5 rounded">cd frontend && npm run dev</code></li>
              <li>• Or use: <code className="bg-[hsl(var(--color-muted))] px-1 py-0.5 rounded">./scripts/dev.sh</code></li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default App
