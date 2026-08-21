#!/usr/bin/env bash
# env.sh — sourced by every script. Loads .env and derives TARGET_HOST.
# Fails fast if TARGET_WEB or authorization is missing.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

ENV_FILE="${SEC_ENV_FILE:-$REPO_ROOT/.env}"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "missing $ENV_FILE — copy .env.example to .env and edit" >&2
  return 1 2>/dev/null || exit 1
fi

# Load .env — line-by-line so process substitution timing isn't an issue.
while IFS='=' read -r key val; do
  [[ -z "$key" || "$key" =~ ^# ]] && continue
  [[ "$key" =~ ^[A-Z_][A-Z0-9_]*$ ]] || continue
  # Strip surrounding quotes if any.
  val="${val%\"}"; val="${val#\"}"; val="${val%\'}"; val="${val#\'}"
  export "$key=$val"
done < "$ENV_FILE"

if [[ -z "${TARGET_WEB:-}" ]]; then
  echo "TARGET_WEB not set in $ENV_FILE" >&2
  return 1 2>/dev/null || exit 1
fi

# Authorization gate — refuse to run without an authorization declaration.
AUTHORIZATION_TYPE="${AUTHORIZATION_TYPE:-}"
case "$AUTHORIZATION_TYPE" in
  owner|written-permission|bugbounty-scope|internal-authorized) ;;
  *)
    echo "AUTHORIZATION_TYPE must be one of: owner | written-permission | bugbounty-scope | internal-authorized (got '$AUTHORIZATION_TYPE')" >&2
    return 1 2>/dev/null || exit 1
  ;;
esac

# Killswitch.
if [[ "${SEC_AGENT_KILL:-0}" == "1" ]]; then
  echo "SEC_AGENT_KILL=1 — refusing all requests" >&2
  return 1 2>/dev/null || exit 1
fi

# Derive host + slug.
export TARGET_WEB
export TARGET_HOST=$(echo "$TARGET_WEB" | awk -F/ '{print $3}' | awk -F: '{print $1}')
export TARGET_SLUG=$(echo "$TARGET_HOST" | sed 's/[^a-z0-9-]/-/g')
export TARGET_DATE=$(date -u +%Y-%m-%d)
export OUT_DIR="${OUT_DIR:-$REPO_ROOT/reports/${TARGET_DATE}-${TARGET_SLUG}}"

# Build in-scope regex from TARGET_HOST + any extras.
HOSTS=("$TARGET_HOST")
if [[ -n "${EXTRA_IN_SCOPE_HOSTS:-}" ]]; then
  IFS=',' read -r -a EXTRA <<< "$EXTRA_IN_SCOPE_HOSTS"
  for h in "${EXTRA[@]}"; do
    h="$(echo "$h" | xargs)"
    [[ -n "$h" ]] && HOSTS+=("$h")
  done
fi
# regex-escape dots, join with |
ESCAPED=()
for h in "${HOSTS[@]}"; do ESCAPED+=("${h//./\\.}"); done
JOINED=$(IFS='|'; echo "${ESCAPED[*]}")
export IN_SCOPE_REGEX="^https?://(${JOINED})(:[0-9]+)?(/.*)?$"

export MAX_RPM="${MAX_RPM:-60}"
# Convert to min-interval-ms for safe-curl.sh
export SEC_MIN_INTERVAL_MS=$(( 60000 / MAX_RPM ))
