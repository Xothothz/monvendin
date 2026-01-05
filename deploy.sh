#!/usr/bin/env bash
set -euo pipefail

cd /var/www/monvendin

if [ "${SKIP_GIT_PULL:-0}" != "1" ]; then
  echo "==> Pull latest main"
  git pull origin main
else
  echo "==> Skip git pull (SKIP_GIT_PULL=1)"
fi

echo "==> Install deps"
npm install

echo "==> Run payload migrations"
if [ -f /var/www/monvendin/.env ]; then
  set -a
  # shellcheck disable=SC1091
  . /var/www/monvendin/.env
  set +a
else
  echo "==> Warning: /var/www/monvendin/.env not found; skipping env load"
fi
NODE_ENV=production npx tsx ./node_modules/payload/bin.js migrate

echo "==> Build"
npm run build

echo "==> Ensure standalone assets"
mkdir -p .next/standalone/.next
rm -rf .next/standalone/.next/static
cp -a .next/static .next/standalone/.next/
rm -rf .next/standalone/public
ln -s /var/www/monvendin/public .next/standalone/public
ln -sf /var/www/monvendin/.env .next/standalone/.env

echo "==> Restart PM2 via ecosystem"
pm2 startOrRestart /var/www/monvendin/ecosystem.config.cjs --update-env

echo "==> Done"
pm2 status monvendin
