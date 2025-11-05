import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { useAuth } from '../contexts/AuthContext'

interface LoginFormProps {
  onToggleForm?: () => void
}

export function LoginForm({ onToggleForm }: LoginFormProps) {
  const { login, error, loading, clearError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    try {
      await login({ email, password })
    } catch (err) {
      // Error is handled in context
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Logging in...' : 'Login'}
          </Button>

          {onToggleForm && (
            <div className="text-center text-sm">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onToggleForm}
                className="text-blue-600 hover:underline"
              >
                Register
              </button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
