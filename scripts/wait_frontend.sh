#!/usr/bin/env bash
set -euo pipefail

for _ in {1..30}; do
  if curl -s http://127.0.0.1:8080 >/dev/null 2>&1; then
    exit 0
  fi
  sleep 1
  if [ "$_" -eq 30 ]; then
    echo "FAIL: frontend health check timeout"
    exit 1
  fi
done
