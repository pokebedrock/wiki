---
title: Pipeline de sincronización con el sitio
description: Cómo el workflow de búsqueda de la wiki sube los índices generados al backend y actualiza Meilisearch.
tags:
  - reference
  - sync
lastUpdated: "2026-04-08"
status: beta
lang: es
toc: true
order: 1
---

## Resumen

1. Los docs se mergean en `main`.
2. El workflow de GitHub Actions `wiki-search` ejecuta `npm run build:search` y genera
   `build/search-index.json`, `build/search-indices.json` y los manifiestos de contenido por idioma.
3. El workflow siempre publica esos artefactos para descarga manual.
4. Cuando los secretos `WIKI_SEARCH_SYNC_URL` y `WIKI_SEARCH_SYNC_TOKEN` existen, el job hace
   `POST` de `build/search-indices.json` hacia el backend.
5. El backend ingiere cada payload (`docs`, `pokemon`, `moves`) en el cluster interno de Meilisearch,
   que alimenta la búsqueda de la wiki y la Pokédex.

## Endpoint de sincronización

- **Ruta:** `POST /internal/wiki/search-index` (apunta `WIKI_SEARCH_SYNC_URL` aquí, p. ej.
  `https://api.pokebedrock.com/internal/wiki/search-index`).
- **Auth:** `Authorization: Bearer <WIKI_SEARCH_SYNC_TOKEN>`.
- **Límite de cuerpo:** 20 MiB (`WIKI_SEARCH_SYNC_BODY_LIMIT_BYTES`).
- **Prerequisitos backend:** Deben existir `WIKI_SEARCH_SYNC_TOKEN`, `MEILI_URL` y alguno de
  `MEILI_KEY` o `MEILI_MASTER_KEY`; si faltan el endpoint responde `503`.

### Forma del payload

`build/search-indices.json` contiene tres arreglos que comparten la misma estructura de registro.

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `docs` | `SearchRecord[]` | Páginas de documentación (frontmatter + contenido MDX). |
| `pokemon` | `SearchRecord[]` | Registros generados de la Pokédex. |
| `moves` | `SearchRecord[]` | Registros generados de movimientos. |

Propiedades de `SearchRecord`:

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | `string` | Identificador estable (`docs/es/...`, `content/es/pokemon/...`, etc.). |
| `slug` | `string` | Ruta lista para URL sin prefijo de locale. |
| `title` | `string?` | Desde frontmatter o desde el JSON de contenido. |
| `description` | `string?` | Texto mostrado en autocomplete/resultados. |
| `tags` | `string[]` | Tags normalizados (locale, categoría, tipo, estado). |
| `lastUpdated` | `string?` | Fecha ISO tomada del frontmatter cuando existe. |
| `status` | `string` | `stable`/`beta`/`draft`, igual que en los docs. |
| `lang` | `string` | Código de idioma (`en` o `es`). |
| `order` | `number` | Orden estable para paginación determinística. |
| `body` | `string?` | Markdown del doc o resumen generado (datos). |

### Forma de la respuesta

El backend responde con estadísticas por índice una vez que Meilisearch termina la ingesta:

```json
{
  "ok": true,
  "indices": {
    "docs": { "indexUid": "wiki-docs", "documentCount": 420, "taskUid": 1012 },
    "pokemon": { "indexUid": "wiki-pokemon", "documentCount": 1025, "taskUid": 1013 },
    "moves": { "indexUid": "wiki-moves", "documentCount": 890, "taskUid": 1014 }
  }
}
```

## Pruebas locales

1. Ejecuta `npm run build:search` para generar `build/search-indices.json` en tu máquina.
2. Usa el payload de ejemplo `docs/es/reference/search-sync-example.json`, que respeta el esquema.
3. Envía el payload hacia tu backend de pruebas:

```bash
WIKI_SEARCH_SYNC_URL=https://api.pokebedrock.com/internal/wiki/search-index \
WIKI_SEARCH_SYNC_TOKEN=dev-secret \
curl --fail --show-error --silent \
  -X POST \
  -H "Authorization: Bearer ${WIKI_SEARCH_SYNC_TOKEN}" \
  -H "Content-Type: application/json" \
  --data-binary @docs/es/reference/search-sync-example.json \
  "${WIKI_SEARCH_SYNC_URL}"
```

## Cache y consumidores

- La ingesta en Meilisearch es síncrona dentro del backend, así que la wiki, la Pokédex y la búsqueda
  de movimientos ven los datos frescos apenas termina el workflow.
- Las páginas de la wiki siguen incluyendo `lastUpdated` desde el frontmatter; los clientes pueden
  usar ese campo para decidir si purgan caches propios después de una sincronización.


