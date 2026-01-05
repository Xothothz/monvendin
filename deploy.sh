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

echo "==> Build"
npm run build

echo "==> Ensure standalone assets"
mkdir -p .next/standalone/.next
rm -rf .next/standalone/.next/static
cp -a .next/static .next/standalone/.next/
rm -rf .next/standalone/public
ln -s /var/www/monvendin/public .next/standalone/public

echo "==> Restart PM2 via ecosystem"
pm2 startOrRestart /var/www/monvendin/ecosystem.config.cjs --update-env

echo "==> Done"
pm2 status monvendin
