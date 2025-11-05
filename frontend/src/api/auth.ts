export interface User {
  id: number
  username: string
  email: string
  created_at: string
}

export interface AuthResponse {
  user: User
  access_token: string
  refresh_token: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}

export class AuthAPI {
  private static async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include', // Important for cookies
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  static async register(data: RegisterData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  static async login(data: LoginData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  static async logout(refreshToken: string): Promise<void> {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
      credentials: 'include',
    })
  }

  static async refresh(refreshToken: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
  }

  static async me(): Promise<User> {
    return this.request<User>('/api/auth/me')
  }
}
