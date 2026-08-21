#!/usr/bin/env bash
# safe-curl.sh — a curl wrapper that (1) enforces scope, (2) rate-limits, (3) logs.
# Every request the agent makes must go through this wrapper.
# Usage: ./scripts/safe-curl.sh <url> [extra curl args...]
set -euo pipefail

URL="${1:-}"
shift || true

if [[ -z "$URL" ]]; then
  echo "usage: $0 <url> [curl args...]" >&2
  exit 2
fi

# 1. Scope enforcement.
"$(dirname "$0")/scope-check.sh" "$URL"

# 2. Simple client-side rate limit: sleep min-interval between calls.
#    Uses a stamp file, so it's cross-invocation.
STAMP="${SEC_RATE_STAMP:-/tmp/sec-agent-lastcall}"
MIN_INTERVAL_MS="${SEC_MIN_INTERVAL_MS:-1000}"  # 1 req/sec default (=60 rpm)
now_ms() { python3 -c 'import time; print(int(time.time()*1000))'; }
now=$(now_ms)
if [[ -f "$STAMP" ]]; then
  last=$(cat "$STAMP")
  delta=$(( now - last ))
  if (( delta < MIN_INTERVAL_MS )); then
    sleep_ms=$(( MIN_INTERVAL_MS - delta ))
    python3 -c "import time; time.sleep($sleep_ms/1000)"
  fi
fi
now_ms > "$STAMP"

# 3. Log every request (host + path + method + timestamp).
LOG_DIR="${SEC_LOG_DIR:-reports/_agent-log}"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/$(date -u +%Y-%m-%d).jsonl"
METHOD="GET"
for a in "$@"; do
  if [[ "$a" == -X* ]]; then METHOD="${a#-X}"; fi
  if [[ "$a" == -I || "$a" == --head ]]; then METHOD="HEAD"; fi
done
printf '{"ts":"%s","method":"%s","url":"%s"}\n' "$(date -u +%FT%TZ)" "$METHOD" "$URL" >> "$LOG_FILE"

# 4. Sane defaults: fail on network error, timeout, don't follow redirects blindly.
exec curl \
  --max-time 15 \
  --connect-timeout 8 \
  --user-agent "sec-agent/1.0 (+authorized-test; contact=arief@hubexo.com)" \
  --silent --show-error \
  "$@" "$URL"
