# Vendin-les-Bethune - Portail citoyen alternatif (non officiel)

Projet demonstrateur d'un site citoyen independant, sans lien officiel avec la mairie. Il propose un audit factuel du site municipal et une refonte des services essentiels.

## Objectifs

- Audit factuel et source du site officiel actuel.
- Portail de services clair (demarches, documents, agenda, vie locale).
- Acces rapide a une bibliotheque de documents.
- Respect strict des contraintes legales: pas d'usurpation, pas de donnees personnelles non publiques.

## Installation

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` : demarrage local
- `npm run build` : build statique (output export)
- `npm run start` : serveur Next.js (non utilise en export statique)
- `npm run lint` : lint
- `npm run typecheck` : verif TypeScript

## Structure

- `app/` : pages (App Router)
- `components/` : composants reutilisables (Card, Badge, Button, Alert, Tabs)
- `data/` : seed JSON (actus, agenda, demarches, documents, associations, ecoles, menus)
- `content/` : contenus Markdown (mentions)
- `public/docs/` : documents internes (exemples PDF)

## Recherche interne

- Recherche locale via `fuse.js` sur Actualites, Demarches et Documents.

## SEO

- Sitemap statique genere via `app/sitemap.ts`. Pensez a mettre a jour `baseUrl`.

## Accessibilite

- HTML semantique, contrastes soignes, focus visible.
- Menus de cantine en HTML, pas d'image cliquable.

## Legal & Ethique

- Bandeau visible sur toutes les pages: site citoyen independant, non affilie.
- Page A propos / mentions obligatoire.
- Aucune donnee personnelle non publique.
- Ton factuel et sources citees.

## Donnees de demonstration

Les contenus sont des exemples (seed). Remplacez les fichiers dans `data/` et `content/` par des sources verifiees.

## Tests

A minima:

```bash
npm run lint
npm run typecheck
```
