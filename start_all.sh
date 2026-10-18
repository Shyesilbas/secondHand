#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$ROOT_DIR/secondhand-frontend"

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down services...${NC}"

    if [[ -n "$FRONTEND_PID" ]] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
        pkill -P "$FRONTEND_PID" 2>/dev/null || true
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi

    if [[ -n "$BACKEND_PID" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        pkill -P "$BACKEND_PID" 2>/dev/null || true
        kill "$BACKEND_PID" 2>/dev/null || true
    fi

    wait 2>/dev/null || true
    echo -e "${GREEN}All services stopped.${NC}"
}

trap cleanup SIGINT SIGTERM EXIT

cd "$ROOT_DIR"

# 1. Load environment variables from .env if present
if [[ -f "$ROOT_DIR/.env" ]]; then
    echo -e "${BLUE}[INFO]${NC} Loading environment variables from .env"
    set -a
    # shellcheck disable=SC1091
    source "$ROOT_DIR/.env"
    set +a
else
    echo -e "${YELLOW}[WARN]${NC} .env file not found in project root. Run 'cp .env.template .env' if backend fails to start."
fi

# 2. Ensure frontend dependencies are installed
if [[ ! -d "$FRONTEND_DIR/node_modules" ]]; then
    echo -e "${BLUE}[INFO]${NC} Installing frontend dependencies..."
    (cd "$FRONTEND_DIR" && npm install)
fi

# 3. Start Backend (Spring Boot)
echo -e "${GREEN}[START]${NC} Starting Backend on http://localhost:8080 ..."
./mvnw spring-boot:run > >(sed "s/^/$(printf "${BLUE}[BACKEND]${NC} ")/") 2>&1 &
BACKEND_PID=$!

# 4. Start Frontend (Vite)
echo -e "${GREEN}[START]${NC} Starting Frontend on http://localhost:5173 ..."
(cd "$FRONTEND_DIR" && npm run dev) > >(sed "s/^/$(printf "${GREEN}[FRONTEND]${NC} ")/") 2>&1 &
FRONTEND_PID=$!

echo -e "${BLUE}[INFO]${NC} Both services launched. Press Ctrl+C to stop all."

# Wait for both processes
wait "$BACKEND_PID" "$FRONTEND_PID"
