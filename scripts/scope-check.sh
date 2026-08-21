#!/usr/bin/env bash
# scope-check.sh — refuse to proceed unless a URL is in-scope per .env-derived rules.
# Usage: ./scripts/scope-check.sh <url>
# Exits 0 if in-scope, 1 if out-of-scope, 2 on config/env error.
set -euo pipefail

URL="${1:-}"
if [[ -z "$URL" ]]; then
  echo "usage: $0 <url>" >&2
  exit 2
fi

# Load .env-derived scope (TARGET_HOST, IN_SCOPE_REGEX, OUT_OF_SCOPE_PATHS, SEC_AGENT_KILL).
# shellcheck disable=SC1091
source "$(dirname "$0")/env.sh"

# host + path.
host=$(echo "$URL" | awk -F/ '{print $3}' | awk -F: '{print $1}')
path=$(echo "$URL" | awk -F/ '{for(i=4;i<=NF;i++)printf "/%s",$i; print ""}')

# Out-of-scope path check.
if [[ -n "${OUT_OF_SCOPE_PATHS:-}" ]]; then
  IFS=',' read -r -a OOSP <<< "$OUT_OF_SCOPE_PATHS"
  for p in "${OOSP[@]}"; do
    p="$(echo "$p" | xargs)"
    [[ -z "$p" ]] && continue
    if [[ "$path" == "$p"* ]]; then
      echo "OUT-OF-SCOPE PATH: $path (matches '$p')" >&2
      exit 1
    fi
  done
fi

# In-scope regex.
if [[ "$URL" =~ $IN_SCOPE_REGEX ]]; then
  exit 0
fi

echo "OUT-OF-SCOPE: $URL not matched by regex $IN_SCOPE_REGEX" >&2
exit 1
