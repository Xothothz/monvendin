#!/usr/bin/env bash
set -euo pipefail

cd /var/www/monvendin

echo "==> Pull latest main"
git pull origin main

echo "==> Install deps"
npm install

echo "==> Build"
npm run build

echo "==> Ensure standalone assets"
mkdir -p .next/standalone/.next
rm -rf .next/standalone/.next/static
cp -a .next/static .next/standalone/.next/
rm -rf .next/standalone/public
cp -a public .next/standalone/
echo "==> Sync uploads"
/var/www/monvendin/sync-uploads.sh

echo "==> Restart PM2 via ecosystem"
pm2 startOrRestart /var/www/monvendin/ecosystem.config.cjs --update-env

echo "==> Done"
pm2 status monvendin
