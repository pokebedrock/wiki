---
title: Pipeline de sincronizacion con el sitio
description: Como el contenido del wiki llega al sitio publico y como se mantienen actualizados los indices de busqueda.
tags:
  - reference
  - sync
lastUpdated: "2026-03-30"
status: published
lang: es
toc: true
order: 1
---

## Resumen

El contenido del wiki llega al sitio web a traves de dos canales:

1. **Renderizado de paginas** — el frontend Next.js lee los archivos Markdown/MDX directamente del sistema de archivos local.
2. **Indexado de busqueda** — un workflow de CI construye un indice de busqueda y lo envia al backend, que lo sincroniza con Meilisearch.

## Renderizado de paginas (sistema de archivos)

El frontend (`website-frontend`) lee los docs del repositorio wiki en la ruta configurada via `POKEBEDROCK_WIKI_PATH` (por defecto `../wiki`). Las paginas se compilan desde MDX en tiempo de solicitud usando `next-mdx-remote`.

En produccion, el repositorio wiki se monta como volumen en el contenedor del frontend mediante `website-services` (`compose/stack-apps.yml`). Un cron job (`scripts/sync-wiki.sh`) hace pull periodicamente de los ultimos commits de `main` para que el contenido se mantenga actualizado sin necesidad de redesplegar.

Ver `website-frontend/src/lib/wiki.ts` para la logica de resolucion del sistema de archivos y compilacion MDX.

## Sincronizacion del indice de busqueda (CI → Backend → Meilisearch)

Cuando los docs o los assets de datos del juego cambian en `main`, el workflow `wiki-search` de GitHub Actions (`.github/workflows/search-index.yml`) se ejecuta:

1. `npm run build:search` produce `build/search-indices.json` con tres colecciones: **docs**, **pokemon** y **moves**.
2. El workflow hace `POST` de ese archivo al endpoint interno del backend:

```
POST /internal/wiki/search-index
Authorization: Bearer <WIKI_SEARCH_SYNC_TOKEN>
Content-Type: application/json
```

3. El backend valida el token Bearer y sincroniza cada coleccion en Meilisearch como indices separados (`wiki-docs`, `wiki-pokemon`, `wiki-moves`).

Ver `website-backend/src/http/routes/wiki-search-sync.ts` para el endpoint de sincronizacion y `website-backend/src/http/routes/wiki-search.ts` para el proxy publico de busqueda.

### Secretos requeridos (GitHub Actions)

| Secreto | Proposito |
| --- | --- |
| `WIKI_SEARCH_SYNC_URL` | URL completa del endpoint de sincronizacion (ej. `https://api.pokebedrock.com/internal/wiki/search-index`) |
| `WIKI_SEARCH_SYNC_TOKEN` | Token Bearer compartido con el backend (variable de entorno `WIKI_SEARCH_SYNC_TOKEN`) |

### Disparadores

El workflow se ejecuta en:

- Push a `main` (cuando cambian `docs/`, `assets/content/`, `schemas/` o `scripts/`)
- Dispatch manual (`workflow_dispatch`)
- Programacion diaria (`0 6 * * *`)

## Desarrollo local

En desarrollo, la busqueda hace fallback a un archivo local `search-index.json` si Meilisearch no esta disponible. Construyelo con:

```bash
npm run build:search
```

El backend verifica automaticamente varias rutas candidatas (ver `localWikiSearchIndexCandidates` en `wiki-search.ts`), por lo que no se necesita configuracion adicional cuando el repositorio wiki esta al lado del backend.

