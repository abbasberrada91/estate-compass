#!/usr/bin/env bash
set -euo pipefail

PORT="${FRONTEND_PORT:-8080}"
PID_FILE="${FRONTEND_PID_FILE:-/tmp/estate_compass_frontend.pid}"

find_pid() {
  local pid=""
  if command -v lsof >/dev/null 2>&1; then
    pid=$(lsof -ti tcp:"$PORT" || true)
  elif command -v ss >/dev/null 2>&1; then
    pid=$(ss -lptn "sport = :$PORT" 2>/dev/null | awk -F'pid=' 'NR>1 {print $2}' | awk -F',' '{print $1}' | head -n1)
  elif command -v fuser >/dev/null 2>&1; then
    pid=$(fuser "$PORT"/tcp 2>/dev/null | awk '{print $1}' | head -n1)
  fi
  echo "$pid"
}

stop_pid() {
  local pid="$1"
  if [ -z "$pid" ]; then
    return 0
  fi
  if kill -0 "$pid" 2>/dev/null; then
    kill -TERM "$pid" 2>/dev/null || true
    for _ in {1..10}; do
      sleep 0.3
      if ! kill -0 "$pid" 2>/dev/null; then
        return 0
      fi
    done
    kill -KILL "$pid" 2>/dev/null || true
  fi
}

if [ -f "$PID_FILE" ]; then
  PID="$(cat "$PID_FILE" 2>/dev/null || true)"
  stop_pid "${PID:-}"
  rm -f "$PID_FILE"
fi

PID="$(find_pid)"
if [ -n "${PID:-}" ]; then
  stop_pid "$PID"
fi

echo "Frontend stopped"
