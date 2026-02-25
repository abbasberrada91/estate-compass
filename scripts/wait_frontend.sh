#!/usr/bin/env bash
set -euo pipefail

PORT="${FRONTEND_PORT:-8080}"
PID_FILE="${FRONTEND_PID_FILE:-/tmp/estate_compass_frontend.pid}"

pid_alive() {
  local pid="$1"
  if [ -z "$pid" ]; then
    return 1
  fi
  kill -0 "$pid" 2>/dev/null
}

for _ in {1..30}; do
  if [ -f "$PID_FILE" ]; then
    PID="$(cat "$PID_FILE" 2>/dev/null || true)"
    if [ -n "${PID:-}" ] && ! pid_alive "$PID"; then
      echo "FAIL: frontend pid $PID is not running"
      exit 1
    fi
  fi
  if curl -s "http://127.0.0.1:$PORT" >/dev/null 2>&1; then
    exit 0
  fi
  sleep 1
  if [ "$_" -eq 30 ]; then
    echo "FAIL: frontend health check timeout"
    exit 1
  fi
done
