#!/usr/bin/env bash
# Build a clean ZIP — contents are the project root the candidate unzips (not a nested folder).
# Usage from project root:
#   npm run package:zip
#   bash scripts/package-for-candidate.sh
#   bash scripts/package-for-candidate.sh /path/to/out.zip

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DEFAULT_OUT="$(cd "$ROOT/.." && pwd)/variant-gameplay-takehome-candidate.zip"
OUT="${1:-$DEFAULT_OUT}"

cd "$ROOT"

if command -v zip >/dev/null 2>&1; then
  rm -f "$OUT"
  zip -r "$OUT" . \
    -x "node_modules/*" \
    -x "node_modules/**" \
    -x "dist/*" \
    -x "dist/**" \
    -x ".git/*" \
    -x ".git/**" \
    -x "*.zip" \
    -x ".DS_Store" \
    -x "*/.DS_Store" \
    -x "*.log" \
    -x "FOR_RECRUITERS.md"
  echo "Wrote: $OUT"
  ls -lh "$OUT"
else
  echo "zip not found. Install zip or run manually from $ROOT:"
  echo '  zip -r out.zip . -x "node_modules/*" -x "dist/*" -x ".git/*"'
  exit 1
fi
