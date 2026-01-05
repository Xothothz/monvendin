#!/usr/bin/env bash
set -euo pipefail

cd /var/www/monvendin

if [ "${SKIP_GIT_PULL:-0}" != "1" ] && [ -d /var/www/monvendin/.git ]; then
  echo "==> Pull latest main"
  git pull origin main
else
  echo "==> Skip git pull (no .git or SKIP_GIT_PULL=1)"
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
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  # Ensure Node 18 for payload migrations (Node 20 triggers undici CacheStorage error)
  # shellcheck disable=SC1090
  . "$HOME/.nvm/nvm.sh"
  nvm use 18 >/dev/null
fi
NODE_ENV=production npx tsx ./node_modules/payload/bin.js migrate

echo "==> Build"
NODE_OPTIONS="--max-old-space-size=3072" npm run build

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
