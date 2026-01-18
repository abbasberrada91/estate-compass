#!/usr/bin/env bash
set -euo pipefail

PORT=8080
LOG_FILE="/tmp/estate_compass_frontend.log"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

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
      sleep 0.5
      if ! kill -0 "$pid" 2>/dev/null; then
        return 0
      fi
    done
    kill -KILL "$pid" 2>/dev/null || true
  fi
}

PID=$(find_pid)
if [ -n "$PID" ]; then
  stop_pid "$PID"
fi

nohup bash -c "cd '$ROOT_DIR' && npm run dev -- --host 127.0.0.1 --port 8080" > "$LOG_FILE" 2>&1 &

echo "Frontend started on http://127.0.0.1:8080"
echo "tail -f /tmp/estate_compass_frontend.log"
