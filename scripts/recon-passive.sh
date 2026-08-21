#!/usr/bin/env bash
# recon-passive.sh — passive reconnaissance driven by .env's TARGET_WEB.
# Usage: ./scripts/recon-passive.sh          # uses TARGET_WEB from .env
#        ./scripts/recon-passive.sh <url>    # override for this run only (must still be in-scope)
set -uo pipefail
# Note: not using -e; passive recon should tolerate individual probe failures.
# We rely on scope-check.sh + safe-curl.sh (both -e) for hard gates.

# shellcheck disable=SC1091
source "$(dirname "$0")/env.sh"

TARGET="${1:-$TARGET_WEB}"
"$(dirname "$0")/scope-check.sh" "$TARGET"

RAW="$OUT_DIR/raw"
mkdir -p "$RAW"

echo "[recon] target = $TARGET"
echo "[recon] out    = $OUT_DIR"

CURL="$(dirname "$0")/safe-curl.sh"

# 1. Root headers
$CURL "$TARGET/" -o "$RAW/body-root.html" -D "$RAW/headers-root.txt" -w '' || true

# 2. HTTP → HTTPS redirect
HTTP_URL="${TARGET/https:/http:}"
$CURL "$HTTP_URL/" -I -D "$RAW/headers-http.txt" -o /dev/null -w '' || true

# 3. Common infra files
: > "$RAW/infra-files.txt"
for p in robots.txt sitemap.xml .well-known/security.txt humans.txt manifest.json; do
  code=$($CURL "$TARGET/$p" -o "$RAW/${p//\//_}" -w "%{http_code}" || echo "ERR")
  echo "$code  $p" >> "$RAW/infra-files.txt"
done

# 4. Sensitive-file 404 confirmation
: > "$RAW/sensitive-files.txt"
for p in .env .git/config .DS_Store backup.zip backup.tar.gz config.json admin .htaccess phpinfo.php server-status; do
  code=$($CURL "$TARGET/$p" -o /dev/null -w "%{http_code}" || echo "ERR")
  echo "$code  /$p" >> "$RAW/sensitive-files.txt"
done

# 5. OPTIONS
$CURL "$TARGET/" -I -X OPTIONS -D "$RAW/headers-options.txt" -o /dev/null -w '' || true

# 6. CORS hostile origins
$CURL "$TARGET/" -I -H "Origin: https://evil.example" -D "$RAW/cors-evil.txt" -o /dev/null -w '' || true
$CURL "$TARGET/" -I -H "Origin: null"                  -D "$RAW/cors-null.txt" -o /dev/null -w '' || true

# 7. TLS
{
  echo "=== issuer / subject / dates ==="
  echo | openssl s_client -connect "$TARGET_HOST:443" -servername "$TARGET_HOST" 2>/dev/null \
    | openssl x509 -noout -issuer -subject -dates -ext subjectAltName 2>/dev/null || true
  echo ""
  echo "=== version negotiation ==="
  for v in tls1 tls1_1 tls1_2 tls1_3; do
    raw=$(echo | openssl s_client -connect "$TARGET_HOST:443" -servername "$TARGET_HOST" -$v 2>/dev/null || true)
    r=$(printf '%s\n' "$raw" | awk '/^(New|SSL-Session)/ {print; exit}')
    echo "$v: ${r:-refused}"
  done
} > "$RAW/tls.txt"

echo "[recon] raw evidence in $RAW"
echo "[recon] next: node scripts/analyze-recon.js \"$OUT_DIR\""
