Monvendin - Runbook et configuration (local / dev / prod)

Objectif
- Centraliser les infos utiles sur l'execution locale, le workflow Git, et le deploiement VPS.
- Garder une trace claire de la configuration actuelle pour depannage rapide.

Apercu technique
- Framework: Next.js (App Router) + Payload CMS.
- Base de donnees: Postgres (via @payloadcms/db-postgres).
- Uploads: fichiers stockes sur disque dans /public/* (pas en Git).
- Widget meteo: depends de METEO_CONCEPT_API_KEY, sinon il ne s'affiche pas.

Structure repo (principaux dossiers)
- app/: pages Next.js (App Router).
- components/: composants UI (HomeBanner, WeatherWidget, etc.).
- payload/: collections Payload (schema des contenus).
- public/: fichiers statiques et uploads (media, documents, files, images, docs).
- data/ et content/: seeds JSON / contenus Markdown.

Configuration locale (developpement)
1) Pre-requis
   - Node.js + npm
   - Postgres local
2) Variables d'environnement (.env)
   - PAYLOAD_SECRET=...
   - DATABASE_URI=postgres://user:password@localhost:5432/monvendin_db
   - METEO_CONCEPT_API_KEY=... (optionnel, pour le widget meteo)
3) Lancer en local
   - npm install
   - npm run dev
4) Acces admin
   - /admin (Payload CMS)

Workflow Git recommande (dev -> main -> prod)
1) Travailler sur dev
   - git checkout dev
   - git pull --ff-only origin dev
   - coder, puis git add -A && git commit -m "..."
   - git push origin dev
2) Publier sur main
   - git checkout main
   - git pull --ff-only origin main
   - git merge --ff-only dev
   - git push origin main

Production (VPS)
- Chemin du projet: /var/www/monvendin
- Gestion process: PM2 (app "monvendin")
- Fichier PM2: ecosystem.config.cjs
  - cwd: /var/www/monvendin/.next/standalone
  - script: server.js
- Build Next.js: output "standalone" (voir next.config.mjs)
- Script de deploiement: /var/www/monvendin/deploy.sh

Ce que fait deploy.sh
1) (Optionnel) git pull origin main si /var/www/monvendin/.git existe
2) npm install
3) Charger .env et lancer migrations Payload (Node 18 si nvm dispo)
4) npm run build
5) Copier .next/static vers .next/standalone/.next/static
6) Lier public/ et .env dans .next/standalone/
7) pm2 startOrRestart ecosystem.config.cjs --update-env

Etat actuel du VPS (important)
- /var/www/monvendin NE contient pas .git pour l'instant.
- Donc deploy.sh fait "Skip git pull".
- Pour un VPS gere par Git: initialiser /var/www/monvendin en repo Git, definir origin, puis utiliser deploy.sh.

Donnees et uploads
- Articles, utilisateurs, infos, etc. sont en base Postgres.
- Uploads sur disque: public/media, public/documents, public/files, public/images, public/docs.
- Un git pull / deploy ne supprime pas la base ni les uploads.
- Pour reproduire prod en local: dump/restore Postgres + copie des dossiers public/*.

Widget meteo
- Code: lib/weather.ts + components/WeatherWidget.tsx + HomeBanner.
- Si METEO_CONCEPT_API_KEY est absente, getWeatherSnapshot() retourne null -> widget cache.
- Cache memoire: 30 minutes (par process).

Fichiers de config a connaitre
- next.config.mjs (output standalone, headers)
- ecosystem.config.cjs (PM2)
- deploy.sh (deploiement)
- payload.config.ts (schema Payload + db postgres)
- .env (variables runtime)

Notes de verification rapide
- Local: git status -sb ; git rev-parse main origin/main
- VPS: pm2 status ; pm2 env monvendin | grep METEO
- Page home: curl -s https://monvendin.fr/ | grep -i "Meteo"

Checklist rapide (dev -> main -> prod)
1) Local (dev)
   - git checkout dev
   - git pull --ff-only origin dev
   - coder, git add -A && git commit -m "..."
   - git push origin dev
2) Local (main)
   - git checkout main
   - git pull --ff-only origin main
   - git merge dev
   - git push origin main
3) VPS (prod)
   - cd /var/www/monvendin
   - git pull origin main
   - ./deploy.sh
