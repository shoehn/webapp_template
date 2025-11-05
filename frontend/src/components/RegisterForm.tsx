import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { useAuth } from '../contexts/AuthContext'

interface RegisterFormProps {
  onToggleForm?: () => void
}

export function RegisterForm({ onToggleForm }: RegisterFormProps) {
  const { register, error, loading, clearError } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationError, setValidationError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setValidationError('')

    // Client-side validation
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters')
      return
    }

    if (username.length < 3) {
      setValidationError('Username must be at least 3 characters')
      return
    }

    try {
      await register({ username, email, password })
    } catch (err) {
      // Error is handled in context
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>
          Enter your information to create a new account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={50}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="johndoe"
            />
          </div>

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
            <p className="text-xs text-gray-500">
              Must be at least 8 characters
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="••••••••"
            />
          </div>

          {(error || validationError) && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {validationError || error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating account...' : 'Register'}
          </Button>

          {onToggleForm && (
            <div className="text-center text-sm">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onToggleForm}
                className="text-blue-600 hover:underline"
              >
                Login
              </button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
