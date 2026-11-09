#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$ROOT_DIR/secondhand-frontend"
SEED_ARG=""

for arg in "$@"; do
    case "$arg" in
        --seed)
            SEED_ARG="all"
            ;;
        --seed=*)
            SEED_ARG="${arg#*=}"
            ;;
        *)
            echo "Usage: ./scripts/start_all.sh [--seed | --seed=<key[,key]|listing|all>]"
            exit 1
            ;;
    esac
done

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

BACKEND_PID=""
FRONTEND_PID=""
COMPOSE_CMD=()
DOCKER_STARTED=false
CLEANED_UP=false

cleanup() {
    if [[ "$CLEANED_UP" == "true" ]]; then
        return
    fi
    CLEANED_UP=true

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

    if [[ "$DOCKER_STARTED" == "true" ]] && [[ ${#COMPOSE_CMD[@]} -gt 0 ]]; then
        echo -e "${YELLOW}Stopping Docker containers...${NC}"
        (cd "$ROOT_DIR" && "${COMPOSE_CMD[@]}" stop) || true
    fi

    echo -e "${GREEN}All services and Docker containers stopped.${NC}"
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

# 2. Start Docker containers (PostgreSQL, Redis, Kafka) and wait for readiness
if ! command -v docker >/dev/null 2>&1; then
    echo -e "${RED}[ERROR]${NC} Docker is not installed or not in PATH."
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}[ERROR]${NC} Docker daemon is not running. Please start Docker Desktop first."
    exit 1
fi

if docker compose version >/dev/null 2>&1; then
    COMPOSE_CMD=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
    COMPOSE_CMD=(docker-compose)
else
    echo -e "${RED}[ERROR]${NC} Neither 'docker compose' nor 'docker-compose' was found."
    exit 1
fi

echo -e "${GREEN}[START]${NC} Starting Docker containers (PostgreSQL :5433, Redis :6379, Kafka :9092)..."
"${COMPOSE_CMD[@]}" up -d
DOCKER_STARTED=true

echo -e "${BLUE}[INFO]${NC} Waiting for PostgreSQL and Redis to become ready..."
for i in {1..30}; do
    if docker exec secondhand_postgres_dev pg_isready -U "${DB_USER:-postgres}" -d secondhand >/dev/null 2>&1; then
        break
    fi
    if [[ $i -eq 30 ]]; then
        echo -e "${RED}[ERROR]${NC} PostgreSQL did not become ready in time."
        exit 1
    fi
    sleep 1
done

for i in {1..30}; do
    if docker exec secondhand_redis_dev redis-cli ping 2>/dev/null | grep -q PONG; then
        break
    fi
    if [[ $i -eq 30 ]]; then
        echo -e "${RED}[ERROR]${NC} Redis did not become ready in time."
        exit 1
    fi
    sleep 1
done
echo -e "${GREEN}[OK]${NC} Docker infrastructure is ready."

# 3. Ensure frontend dependencies are installed
if [[ ! -d "$FRONTEND_DIR/node_modules" ]]; then
    echo -e "${BLUE}[INFO]${NC} Installing frontend dependencies..."
    (cd "$FRONTEND_DIR" && npm install)
fi

# 4. Start Backend (Spring Boot)
if [[ -n "$SEED_ARG" ]]; then
    export APP_SEED="$SEED_ARG"
    echo -e "${BLUE}[INFO]${NC} Catalog seeding enabled (APP_SEED=$APP_SEED)"
fi
echo -e "${GREEN}[START]${NC} Starting Backend on http://localhost:8080 ..."
mvn spring-boot:run > >(sed "s/^/$(printf "${BLUE}[BACKEND]${NC} ")/") 2>&1 &
BACKEND_PID=$!

# 5. Start Frontend (Vite)
echo -e "${GREEN}[START]${NC} Starting Frontend on http://localhost:5173 ..."
(cd "$FRONTEND_DIR" && npm run dev) > >(sed "s/^/$(printf "${GREEN}[FRONTEND]${NC} ")/") 2>&1 &
FRONTEND_PID=$!

echo -e "${BLUE}[INFO]${NC} Docker, Backend, and Frontend launched. Press Ctrl+C to stop all."

# Wait for both processes
wait "$BACKEND_PID" "$FRONTEND_PID"
