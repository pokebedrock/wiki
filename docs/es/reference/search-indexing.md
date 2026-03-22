---
title: Indexacion de busqueda
description: Detalles para ejecutar el flujo de indexacion de Meilisearch localmente y en CI.
tags:
  - reference
  - search
lastUpdated: "2026-03-11"
status: beta
lang: es
toc: true
order: 2
---

## Flujo

- `scripts/build-search-index.ts` escanea docs y datasets JSON de contenido bajo
  `assets/content/<locale>/pokemon/` y `assets/content/<locale>/moves/`.
- Genera:
  - `build/search-index.json` para fallback local de busqueda combinada
  - `build/search-indices.json` para sincronizacion remota de multiples indices
  - `build/content/en/pokemon-manifest.json` y `build/content/es/pokemon-manifest.json`
    para listado y navegacion rapida de Pokemon en frontend
  - `build/content/en/moves-manifest.json` y `build/content/es/moves-manifest.json`
    para listado y navegacion rapida de moves en frontend
  - `build/content/en/move-learners-manifest.json` y
    `build/content/es/move-learners-manifest.json` para busqueda rapida de aprendices por move
- Si `MEILISEARCH_URL` y `MEILISEARCH_KEY` estan definidos, el script publica cada
  payload de indice (`wiki-docs`, `wiki-pokemon` y `wiki-moves`) directamente en el
  indice correspondiente de Meilisearch.
- `.github/workflows/search-index.yml` ejecuta el script en `main` y de forma nocturna, sube los
  payloads de busqueda generados y los manifiestos de contenido del frontend como artifacts del workflow,
  y luego envia el payload JSON multi-indice al endpoint protegido de sync del backend del sitio para
  mantener privado Meilisearch.

## Configuracion requerida

| Variable | Descripcion |
| --- | --- |
| `MEILISEARCH_URL` | URL base de la instancia autohospedada de Meilisearch |
| `MEILISEARCH_KEY` | Clave de admin o documents con permisos de escritura |

## Configuracion de CI

| Secret | Descripcion |
| --- | --- |
| `WIKI_SEARCH_SYNC_URL` | URL HTTPS publica del endpoint de sync del backend |
| `WIKI_SEARCH_SYNC_TOKEN` | Token bearer compartido validado por el backend antes de importar documentos |

## Ejecucion local

```bash
MEILISEARCH_URL=https://search.pokebedrock.com \
MEILISEARCH_KEY=<docs-key> \
npm run build:search
```

El comando escribe payloads de busqueda y manifiestos del frontend, y publica los tres
indices remotos cuando las variables de entorno estan definidas.

## Endpoint de sync en produccion

El flujo de produccion por defecto no expone Meilisearch publicamente:

1. GitHub Actions construye `build/search-index.json` y `build/search-indices.json`.
2. El workflow hace `POST` de `build/search-indices.json` al backend del sitio.
3. El backend valida `WIKI_SEARCH_SYNC_TOKEN`.
4. El backend se conecta a `http://meilisearch:7700` dentro del cluster y reemplaza:
   - `wiki-docs`
   - `wiki-pokemon`
   - `wiki-moves`

## Schema del documento

```json
{
  "id": "guides/getting-started",
  "slug": "guides/getting-started",
  "title": "Comenzando",
  "description": "Resumen corto...",
  "tags": ["guia", "onboarding"],
  "lastUpdated": "2025-11-21",
  "status": "stable",
  "lang": "en",
  "order": 3,
  "body": "Contenido Markdown sin frontmatter"
}
```

Manten descripciones de hasta 180 caracteres para evitar truncamiento en UIs de busqueda.

