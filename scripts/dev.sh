#!/bin/bash

# Development script to run both backend and frontend concurrently

set -e

echo "Starting development servers..."
echo ""

# Check if tmux is available
if command -v tmux &> /dev/null; then
    echo "Using tmux for better terminal management"
    echo "Press Ctrl+C to stop all servers"
    echo ""

    # Create a new tmux session with backend and frontend
    tmux new-session -d -s webapp-dev -n backend "cd backend && cargo run"
    tmux split-window -h -t webapp-dev:backend "cd frontend && npm run dev"
    tmux attach-session -t webapp-dev
else
    # Fallback to simple background jobs
    echo "Backend starting on http://localhost:3000"
    echo "Frontend will start on http://localhost:5173"
    echo ""
    echo "Press Ctrl+C to stop all servers"
    echo ""

    # Trap Ctrl+C to kill both processes
    trap 'kill $(jobs -p) 2>/dev/null' EXIT

    cd backend
    cargo run &
    BACKEND_PID=$!

    cd ../frontend
    npm run dev &
    FRONTEND_PID=$!

    # Wait for both processes
    wait
fi
