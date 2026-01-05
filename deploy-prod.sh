#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "==> Pull latest main"
git pull origin main

echo "==> Deploy"
./deploy.sh
