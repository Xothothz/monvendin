#!/usr/bin/env bash
set -euo pipefail

ROOT="/var/www/monvendin"
DST="$ROOT/.next/standalone/public"

mkdir -p "$DST/media" "$DST/files" "$DST/documents"

rsync -a --delete "$ROOT/public/media/" "$DST/media/" 2>/dev/null || true
rsync -a --delete "$ROOT/public/files/" "$DST/files/" 2>/dev/null || true
rsync -a --delete "$ROOT/public/documents/" "$DST/documents/" 2>/dev/null || true

echo "✅ Uploads sync OK -> $DST"
