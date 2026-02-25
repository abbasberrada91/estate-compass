#!/usr/bin/env bash
set -euo pipefail

PORT="${FRONTEND_PORT:-8080}"
HOST="${FRONTEND_HOST:-0.0.0.0}"
LOG_FILE="${FRONTEND_LOG_FILE:-/tmp/estate_compass_frontend.log}"
PID_FILE="${FRONTEND_PID_FILE:-/tmp/estate_compass_frontend.pid}"
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

pid_alive() {
  local pid="$1"
  if [ -z "$pid" ]; then
    return 1
  fi
  kill -0 "$pid" 2>/dev/null
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

if [ -f "$PID_FILE" ]; then
  OLD_PID="$(cat "$PID_FILE" 2>/dev/null || true)"
  if [ -n "${OLD_PID:-}" ]; then
    stop_pid "$OLD_PID"
  fi
  rm -f "$PID_FILE"
fi

PID="$(find_pid)"
if [ -n "${PID:-}" ]; then
  stop_pid "$PID"
fi

attempt_start() {
  : > "$LOG_FILE"
  setsid -f bash -lc "cd '$ROOT_DIR' && exec npm run dev -- --host '$HOST' --port '$PORT'" >> "$LOG_FILE" 2>&1
}

wait_for_port_pid() {
  local pid=""
  for _ in {1..25}; do
    pid="$(find_pid)"
    if [ -n "$pid" ]; then
      echo "$pid"
      return 0
    fi
    sleep 0.4
  done
  return 1
}

stability_check() {
  local pid="$1"
  for _ in {1..6}; do
    if ! pid_alive "$pid"; then
      return 1
    fi
    if ! curl -s "http://127.0.0.1:$PORT" >/dev/null 2>&1; then
      return 1
    fi
    sleep 1
  done
  return 0
}

STARTED_PID=""
for attempt in 1 2 3; do
  attempt_start
  if ! STARTED_PID="$(wait_for_port_pid)"; then
    continue
  fi
  if stability_check "$STARTED_PID"; then
    break
  fi
  stop_pid "$STARTED_PID"
  STARTED_PID=""
done

if [ -z "$STARTED_PID" ]; then
  echo "FAIL: frontend failed to stay up after 3 attempts"
  echo "Last frontend logs:"
  tail -n 120 "$LOG_FILE" || true
  exit 1
fi

echo "$STARTED_PID" > "$PID_FILE"
echo "Frontend started on http://127.0.0.1:$PORT (pid=$STARTED_PID, host=$HOST)"
echo "tail -f $LOG_FILE"
