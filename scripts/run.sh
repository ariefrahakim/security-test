#!/usr/bin/env bash
# run.sh — one-shot: recon → analyze → build report. Fully driven by .env.
# Usage: ./scripts/run.sh
set -euo pipefail
here="$(dirname "$0")"
# shellcheck disable=SC1091
source "$here/env.sh"

echo "═══ sec-agent ══════════════════════════════════════════════"
echo "  target        : $TARGET_WEB"
echo "  host          : $TARGET_HOST"
echo "  authorization : $AUTHORIZATION_TYPE"
echo "  output        : $OUT_DIR"
echo "  rate          : $MAX_RPM req/min"
echo "════════════════════════════════════════════════════════════"

"$here/recon-passive.sh"
node "$here/analyze-recon.js" "$OUT_DIR"
mv "$OUT_DIR/findings.json" "$OUT_DIR/findings.recon.json"
node "$here/build-report.js" "$OUT_DIR"

echo ""
echo "Done. Open:  file://$OUT_DIR/report.html"
