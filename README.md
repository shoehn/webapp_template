# Web App Template

A modern, full-stack web application template featuring a Rust backend and React frontend in a monorepo structure.

## Tech Stack

### Backend
- **Axum** - Modern async web framework for Rust
- **Diesel** - Type-safe ORM for Rust
- **SQLite** - Lightweight embedded database
- **Tokio** - Async runtime
- **Tower** - Modular middleware
- **Utoipa** - OpenAPI documentation generator with Swagger UI
- **JWT** - JSON Web Token authentication with refresh tokens
- **Argon2** - Password hashing (OWASP recommended)

### Frontend
- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS v4** - Latest utility-first CSS framework with `@theme` directive
- **shadcn-ui** - High-quality React components

### Testing
- **Vitest** - Fast unit test framework for Vite
- **React Testing Library** - Component testing utilities
- **Playwright** - End-to-end testing framework

## Project Structure

```
webapp_template/
├── backend/                 # Rust backend
│   ├── src/
│   │   ├── main.rs         # Entry point
│   │   ├── api/            # API route handlers
│   │   ├── models/         # Data models
│   │   ├── db/             # Database setup
│   │   └── config.rs       # Configuration
│   ├── migrations/         # Database migrations
│   └── Cargo.toml          # Rust dependencies
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   └── ui/        # shadcn-ui components
│   │   ├── lib/           # Utilities
│   │   ├── test/          # Test setup files
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── e2e/               # Playwright E2E tests
│   ├── package.json       # Node dependencies
│   ├── vite.config.ts     # Vite configuration
│   ├── vitest.config.ts   # Vitest test configuration
│   └── playwright.config.ts # Playwright configuration
│
└── scripts/               # Helper scripts
    └── dev.sh            # Start both servers
```

## Prerequisites

- **Rust** (1.70+): [Install Rust](https://rustup.rs/)
- **Node.js** (18+): [Install Node.js](https://nodejs.org/)
- **Diesel CLI** (optional): `cargo install diesel_cli --no-default-features --features sqlite`

## Getting Started

### Quick Start (Recommended)

Run both backend and frontend with a single command:

```bash
./scripts/dev.sh
```

This will start:
- Backend on `http://localhost:3000`
- Frontend on `http://localhost:5173`

### Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
cargo run
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install  # First time only
npm run dev
```

## Development

### Backend Development

#### Adding Database Migrations

```bash
cd backend
diesel migration generate create_your_table
# Edit the generated up.sql and down.sql files
diesel migration run
```

#### Adding API Routes

1. Add handler functions in `backend/src/api/mod.rs`
2. Register routes in the `create_router` function
3. Define models in `backend/src/models/mod.rs`

#### Environment Variables

Create `backend/.env`:
```bash
DATABASE_URL=database.db
HOST=127.0.0.1
PORT=3000
JWT_SECRET=your-secret-key-here-change-in-production
RUST_LOG=webapp_backend=debug,tower_http=debug
```

**Important:** Change `JWT_SECRET` to a secure random string in production.

### Frontend Development

#### Adding shadcn-ui Components

The template includes Button and Card components. To add more:

1. Visit [shadcn-ui](https://ui.shadcn.com/docs/components)
2. Copy component code to `frontend/src/components/ui/`
3. Import and use in your components

#### API Integration

The frontend is configured to proxy `/api/*` requests to the backend. Example:

```typescript
const response = await fetch('/api/hello')
const data = await response.json()
```

#### Styling

This template uses **Tailwind CSS v4**, which has a new approach to theming:

- Use Tailwind utility classes directly
- Theme is configured using `@theme` directive in `frontend/src/index.css`
- CSS variables use the `--color-*` naming convention (e.g., `--color-primary`)
- Colors are referenced using `hsl(var(--color-name))` syntax
- Dark mode is automatic using `@media (prefers-color-scheme: dark)`
- Minimal configuration in `frontend/tailwind.config.js` (only content paths)

**Example custom color:**
```css
/* In frontend/src/index.css */
@theme {
  --color-brand: 200 100% 50%;
}
```

Then use it: `className="bg-[hsl(var(--color-brand))]"`

## Testing

This template includes comprehensive testing setup with Vitest (for unit/component tests) and Playwright (for E2E tests).

### Unit and Component Testing (Vitest + React Testing Library)

The project uses **Vitest** as the test runner (fast, Vite-native alternative to Jest) and **React Testing Library** for component testing.

#### Running Tests

```bash
cd frontend

# Run tests in watch mode (recommended during development)
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm test:ui

# Generate coverage report
npm run test:coverage
```

#### Test File Structure

- Unit tests: `src/**/*.test.ts`
- Component tests: `src/**/*.test.tsx`
- Test setup: `src/test/setup.ts`
- Config: `vitest.config.ts`

#### Writing Component Tests

Example test for a Button component:

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './button'

it('should handle click events', async () => {
  const handleClick = vi.fn()
  const user = userEvent.setup()

  render(<Button onClick={handleClick}>Click me</Button>)
  await user.click(screen.getByRole('button'))

  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

#### Example Tests Included

- `src/lib/utils.test.ts` - Unit test for utility functions
- `src/components/ui/button.test.tsx` - Component test for Button
- `src/components/ui/card.test.tsx` - Component test for Card
- `src/App.test.tsx` - Integration test for App component

### End-to-End Testing (Playwright)

**Playwright** provides reliable E2E testing across all browsers with powerful features like auto-waiting and network mocking.

#### Running E2E Tests

```bash
cd frontend

# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI (visual test runner)
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed

# Debug E2E tests (step through)
npm run test:e2e:debug
```

#### E2E Test File Structure

- E2E tests: `e2e/**/*.spec.ts`
- Config: `playwright.config.ts`

#### Writing E2E Tests

Example E2E test:

```typescript
import { test, expect } from '@playwright/test'

test('should display API response', async ({ page }) => {
  await page.goto('/')

  // Mock API endpoint
  await page.route('/api/hello', route => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({ message: 'Hello!', timestamp: 123 })
    })
  })

  await page.getByRole('button', { name: /fetch from api/i }).click()
  await expect(page.getByText('API Response:')).toBeVisible()
})
```

#### Example E2E Tests Included

- `e2e/app.spec.ts` - Main application E2E tests
- `e2e/example.spec.ts` - Example tests showcasing Playwright features (responsive design, accessibility, network mocking)

### Test Coverage

Generate a coverage report:

```bash
cd frontend
npm run test:coverage
```

Coverage reports are generated in:
- Terminal output (text summary)
- `coverage/index.html` (HTML report - open in browser)

### Continuous Integration

For CI/CD pipelines, use:

```bash
# Frontend tests
cd frontend
npm run test:run          # Unit/component tests (no watch mode)
npm run test:e2e          # E2E tests (automatically starts dev server)
```

### Best Practices

1. **Unit Tests**: Test utility functions and business logic in isolation
2. **Component Tests**: Test component behavior, user interactions, and props
3. **Integration Tests**: Test multiple components working together
4. **E2E Tests**: Test critical user flows and happy paths
5. **Mock External Dependencies**: Use `vi.fn()` (Vitest) or `page.route()` (Playwright)
6. **Follow AAA Pattern**: Arrange, Act, Assert
7. **Use Testing Library Queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`

## Building for Production

### Backend

```bash
cd backend
cargo build --release
# Binary will be in target/release/webapp_backend
```

### Frontend

```bash
cd frontend
npm run build
# Static files will be in dist/
```

## Project Scripts

### Development
- `scripts/dev.sh` - Start both backend and frontend
- `backend`: `cargo run` - Run backend server
- `frontend`: `npm run dev` - Start dev server

### Testing
- `backend`: `cargo test` - Run backend tests
- `frontend`: `npm test` - Run unit/component tests (watch mode)
- `frontend`: `npm run test:run` - Run tests once
- `frontend`: `npm run test:ui` - Run tests with UI
- `frontend`: `npm run test:coverage` - Generate coverage report
- `frontend`: `npm run test:e2e` - Run E2E tests
- `frontend`: `npm run test:e2e:ui` - Run E2E tests with UI
- `frontend`: `npm run test:e2e:headed` - Run E2E tests in headed mode
- `frontend`: `npm run test:e2e:debug` - Debug E2E tests

### Building
- `frontend`: `npm run build` - Build for production
- `frontend`: `npm run preview` - Preview production build

## API Documentation

The API includes comprehensive OpenAPI 3.0 documentation with an interactive Swagger UI.

### Accessing API Documentation

Once the backend is running, visit:

**Swagger UI:** `http://localhost:3000/swagger-ui`

The Swagger UI provides:
- Interactive API testing
- Complete endpoint documentation
- Request/response schemas
- Authentication testing with JWT tokens

### API Endpoints

#### Health & Example
- `GET /health` - Health check
- `GET /api/hello` - Example API endpoint

#### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/refresh` - Refresh access token using refresh token
- `POST /api/auth/logout` - Logout and invalidate refresh token
- `GET /api/auth/me` - Get current authenticated user (requires JWT)

### Authentication Flow

This template implements a secure two-token authentication system:

1. **Access Token** (JWT, 15 minutes): Used for API requests, sent via Authorization header or httpOnly cookie
2. **Refresh Token** (UUID, 30 days): Used to obtain new access tokens, stored in database

**Registration/Login:**
```typescript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'password123' })
})
const { access_token, refresh_token, user } = await response.json()
```

**Authenticated Requests:**
```typescript
const response = await fetch('/api/auth/me', {
  headers: { 'Authorization': `Bearer ${access_token}` }
})
```

**Token Refresh:**
```typescript
const response = await fetch('/api/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refresh_token })
})
const { access_token } = await response.json()
```

### Security Features

- **Argon2id** password hashing (OWASP recommended)
- **JWT** access tokens with short expiration
- **Refresh token rotation** with database storage
- **httpOnly cookies** for XSS protection
- **CORS** properly configured for credentials
- **Input validation** using validator crate

## Database

The template uses SQLite with Diesel ORM. The database file (`database.db`) is created automatically when you run the backend.

### Migrations

The template includes migrations for authentication:

**Users table** (`00000000000000_create_users`):
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**Refresh tokens table** (`00000000000001_create_refresh_tokens`):
```sql
CREATE TABLE refresh_tokens (
    id TEXT PRIMARY KEY NOT NULL,
    user_id INTEGER NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

## Customization

### Changing the Port

**Backend:** Edit `backend/.env` or set `PORT` environment variable

**Frontend:** Edit `frontend/vite.config.ts`:
```typescript
server: {
  port: 5173,
  // ...
}
```

### Extending Authentication

The template includes complete JWT authentication. To extend it:

1. Add more protected routes in `backend/src/api/mod.rs` using the `require_auth` middleware
2. Add user roles/permissions in the `users` table
3. Create role-based authorization middleware
4. Add OAuth providers (Google, GitHub, etc.)

### Adding More Database Tables

1. Create migration: `diesel migration generate table_name`
2. Define schema in `up.sql` and `down.sql`
3. Run migration: `diesel migration run`
4. Add models in `backend/src/models/`

## Troubleshooting

### Backend won't start
- Check if port 3000 is available
- Verify Rust toolchain is installed: `rustc --version`
- Check database permissions

### Frontend won't start
- Run `npm install` in frontend directory
- Check if port 5173 is available
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### API requests fail
- Ensure backend is running
- Check CORS settings in `backend/src/main.rs`
- Verify proxy configuration in `frontend/vite.config.ts`

## License

MIT License - feel free to use this template for your projects!

## Contributing

This is a template repository. Feel free to fork and customize for your needs!
