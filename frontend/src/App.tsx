import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginForm } from '@/components/LoginForm'
import { RegisterForm } from '@/components/RegisterForm'

interface ApiResponse {
  message: string
  timestamp: number
}

function App() {
  const { user, logout, loading: authLoading } = useAuth()
  const [showRegister, setShowRegister] = useState(false)
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

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--color-background))]">
        <p className="text-lg">Loading...</p>
      </div>
    )
  }

  // Show auth forms if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--color-background))] p-4">
        {showRegister ? (
          <RegisterForm onToggleForm={() => setShowRegister(false)} />
        ) : (
          <LoginForm onToggleForm={() => setShowRegister(true)} />
        )}
      </div>
    )
  }

  // Show main app when authenticated
  return (
    <div className="min-h-screen bg-[hsl(var(--color-background))] p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header with user info and logout */}
        <div className="flex justify-between items-center p-4 bg-white rounded-lg border">
          <div>
            <h1 className="text-2xl font-bold">Web App Template</h1>
            <p className="text-sm text-gray-600">Welcome, {user.username}!</p>
          </div>
          <Button onClick={logout} variant="outline">
            Logout
          </Button>
        </div>

        {/* Main content */}
        <Card>
          <CardHeader>
            <CardTitle>Authenticated Dashboard</CardTitle>
            <CardDescription>
              Axum + Diesel + SQLite + React + Vite + Tailwind + shadcn-ui
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm font-medium">User Information</p>
              <ul className="text-sm text-gray-600 mt-2 space-y-1">
                <li>• ID: {user.id}</li>
                <li>• Username: {user.username}</li>
                <li>• Email: {user.email}</li>
                <li>• Joined: {new Date(user.created_at).toLocaleDateString()}</li>
              </ul>
            </div>

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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App
