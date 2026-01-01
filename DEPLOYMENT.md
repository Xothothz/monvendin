# Plan de deploiement (build + export + Nginx)

## 1) Build statique

```bash
npm install
npm run build
```

Le site est genere dans le dossier `out/` (Next.js export).

## 2) Copier vers le serveur

```bash
rsync -avz out/ user@serveur:/var/www/vendin-citoyen
```

## 3) Configuration Nginx (exemple)

```nginx
server {
  listen 80;
  server_name vendin-citoyen.exemple;

  root /var/www/vendin-citoyen;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location = /robots.txt { allow all; }
  location = /sitemap.xml { allow all; }
}
```

## 4) Verification

- Ouvrir le site en HTTP/HTTPS
- Verifier le bandeau non officiel
- Controler les pages dynamiques (actualites, agenda, demarches)
