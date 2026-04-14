---
title: Checklist de release de la wiki
description: Verificaciones de release para generacion del search-index y sincronizacion con el sitio.
tags:
  - reference
  - release
lastUpdated: "2026-04-14"
status: stable
lang: es
---

# Checklist de release de la wiki

## Pre-deploy

- `npm ci`
- `npm run ci`
- verificar que la validacion local pase mediante el gate estandar del repo (incluye checks de search/manifests generados)
- verificar que cambios en docs tengan frontmatter y media validos
- verificar que `MEILISEARCH_URL` y `MEILISEARCH_KEY` existan (archivo `.env` local o
  secrets de CI) para que `npm run build:search` pueda enviar datos nuevos a Meilisearch
  cuando sea necesario
- verificar que los secrets `WIKI_SEARCH_SYNC_URL` y `WIKI_SEARCH_SYNC_TOKEN` existan en
  GitHub si la sincronizacion con website-backend esta habilitada para el repo objetivo

## Publicacion / sincronizacion

1. Hacer merge de cambios de docs en `main`.
2. Ejecutar el workflow normal de CI.
3. Ejecutar el workflow de search-index si hace falta reconstruccion manual.
4. Confirmar que se generaron `build/search-index.json`, `build/search-indices.json` y los manifiestos de contenido del frontend bajo `build/content/<locale>/`.
5. Revisar los logs del workflow `search-index`: cuando `WIKI_SEARCH_SYNC_URL/TOKEN`
   estan configurados, el paso "Sync backend payload" debe reportar HTTP 2xx; si no lo
   estan, los logs deben indicar que se omitio la sincronizacion.
6. Si la sincronizacion con website-backend esta habilitada, confirmar que el endpoint de sync del backend acepto el nuevo payload.

## Post-publicacion

- verificar que las paginas de la wiki rendericen en el frontend
- verificar que la busqueda de la wiki devuelva docs actualizados
- verificar que existan manifiestos generados para pokemon, moves y move learners

## Rollback

- restaurar el ultimo commit estable conocido de la wiki
- volver a ejecutar el workflow de search-index
- verificar que los resultados de busqueda del backend coincidan con el contenido restaurado
