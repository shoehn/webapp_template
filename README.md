# Web App Template

A modern, full-stack web application template featuring a Rust backend and React frontend in a monorepo structure.

## Tech Stack

### Backend
- **Axum** - Modern async web framework for Rust
- **Diesel** - Type-safe ORM for Rust
- **SQLite** - Lightweight embedded database
- **Tokio** - Async runtime
- **Tower** - Modular middleware

### Frontend
- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn-ui** - High-quality React components

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
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── package.json       # Node dependencies
│   └── vite.config.ts     # Vite configuration
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
RUST_LOG=webapp_backend=debug,tower_http=debug
```

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

- Use Tailwind utility classes directly
- Customize theme in `frontend/tailwind.config.js`
- Modify CSS variables in `frontend/src/index.css`

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

- `scripts/dev.sh` - Start both backend and frontend
- `backend`: `cargo run` - Run backend server
- `backend`: `cargo test` - Run backend tests
- `frontend`: `npm run dev` - Start dev server
- `frontend`: `npm run build` - Build for production
- `frontend`: `npm run preview` - Preview production build

## API Endpoints

### Example Endpoints

- `GET /health` - Health check
- `GET /api/hello` - Example API endpoint

## Database

The template uses SQLite with Diesel ORM. The database file (`database.db`) is created automatically when you run the backend.

### Example Migration

An example migration for a `users` table is included:

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY NOT NULL,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL
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

### Adding Authentication

1. Add authentication routes in `backend/src/api/`
2. Implement middleware for protected routes
3. Add JWT or session handling
4. Create login/register components in frontend

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
