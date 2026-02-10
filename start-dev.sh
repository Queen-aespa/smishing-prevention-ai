#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/web-backend"
FRONTEND_DIR="$ROOT_DIR/web-frontend"

BACKEND_PID=""
FRONTEND_PID=""

get_listener_pid() {
  local port="$1"
  lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null | head -n 1 || true
}

cleanup() {
  echo ""
  echo "[dev] shutting down..."
  if [[ -n "$FRONTEND_PID" ]] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
  if [[ -n "$BACKEND_PID" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  wait || true
}

trap cleanup EXIT INT TERM

BACKEND_LISTENER="$(get_listener_pid 8080)"
if [[ -n "$BACKEND_LISTENER" ]]; then
  echo "[dev] backend already running on :8080 (pid=$BACKEND_LISTENER), skipping start."
else
  echo "[dev] starting backend (8080)..."
  (
    cd "$BACKEND_DIR"
    ./gradlew bootRun
  ) &
  BACKEND_PID=$!
fi

FRONTEND_LISTENER="$(get_listener_pid 3000)"
if [[ -n "$FRONTEND_LISTENER" ]]; then
  echo "[dev] frontend already running on :3000 (pid=$FRONTEND_LISTENER), skipping start."
else
  echo "[dev] starting frontend (3000)..."
  (
    cd "$FRONTEND_DIR"
    npm run dev -- --host localhost --port 3000
  ) &
  FRONTEND_PID=$!
fi

echo "[dev] backend pid=$BACKEND_PID, frontend pid=$FRONTEND_PID"
echo "[dev] press Ctrl+C to stop both"

if [[ -n "$BACKEND_PID" && -n "$FRONTEND_PID" ]]; then
  wait -n "$BACKEND_PID" "$FRONTEND_PID"
elif [[ -n "$BACKEND_PID" ]]; then
  wait "$BACKEND_PID"
elif [[ -n "$FRONTEND_PID" ]]; then
  wait "$FRONTEND_PID"
else
  echo "[dev] both services are already running."
fi
