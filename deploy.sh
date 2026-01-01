#!/usr/bin/env bash
set -euo pipefail

ROOT="/var/www/monvendin"
APP_NAME="monvendin"
LOCAL_URL="http://127.0.0.1:3000"
PUBLIC_URL="https://monvendin.fr"

cd "$ROOT"

echo "==> Pull"
git pull

echo "==> Install"
npm ci

echo "==> Build"
npm run build

echo "==> Sync uploads"
./sync-uploads.sh

echo "==> Restart PM2"
pm2 reload ecosystem.config.cjs --update-env

echo "==> Waiting for app on 127.0.0.1:3000..."
ok=0
for i in {1..30}; do
  if curl -fsS -I "$LOCAL_URL" >/dev/null 2>&1; then
    ok=1
    echo "✅ App is up"
    break
  fi
  sleep 1
done

if [ "$ok" -ne 1 ]; then
  echo "❌ App did not start on $LOCAL_URL after 30s"
  echo "==> PM2 status"
  pm2 ls || true
  echo "==> Last logs"
  pm2 logs "$APP_NAME" --lines 120 --nostream || true
  exit 1
fi

echo "==> Healthchecks"
curl -fsS -I "$LOCAL_URL" >/dev/null
curl -fsS -I "$PUBLIC_URL" >/dev/null

echo "✅ Deploy OK"
