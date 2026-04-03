---
title: Pipeline de sincronizacion con el sitio
description: Como el workflow de search-index envia payloads generados al backend del sitio.
tags:
  - reference
  - sync
lastUpdated: "2026-04-03"
status: beta
lang: es
toc: true
order: 1
---

## Resumen

1. Los cambios de docs o contenido estructurado llegan a `main`.
2. `.github/workflows/search-index.yml` instala dependencias y ejecuta
   `npm run build:search`.
3. El workflow sube artifacts generados para debugging e inspeccion manual.
4. Si los secrets de sync del backend estan configurados, el workflow hace `POST`
   de `build/search-indices.json` al backend del sitio.
5. El backend reindexa la instancia privada de Meilisearch a partir de ese payload JSON.

## Que envia el workflow

El paso de sync del backend envia el contenido exacto de `build/search-indices.json` con:

- `Authorization: Bearer $WIKI_SEARCH_SYNC_TOKEN`
- `Content-Type: application/json`

Ese payload contiene los documentos generados para `wiki-docs`, `wiki-pokemon` y
`wiki-moves`, construidos desde los docs del repo y los datasets bajo
`assets/content/<locale>/`.

## Secrets de CI requeridos

| Secret | Descripcion |
| --- | --- |
| `WIKI_SEARCH_SYNC_URL` | Endpoint HTTPS publico expuesto por el backend del sitio para importar search |
| `WIKI_SEARCH_SYNC_TOKEN` | Token bearer compartido que el backend valida antes de aceptar el payload |

Si falta alguno de los secrets, el workflow omite el sync del backend y aun asi sube
los artifacts generados para que maintainers puedan inspeccionar los payloads.

## Pruebas locales

Puedes probar el sync estilo produccion de forma local despues de generar los payloads:

```bash
npm ci
npm run build:search
curl --fail-with-body --show-error --silent \
  -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  --data-binary @build/search-indices.json \
  https://api.pokebedrock.com/wiki/search/sync
```

Reemplaza la URL y el token por los del entorno del backend objetivo.

## Artifacts que produce el workflow

El workflow sube estos archivos generados incluso cuando el sync del backend se omite:

- `build/search-index.json`
- `build/search-indices.json`
- `build/content/en/pokemon-manifest.json`
- `build/content/en/moves-manifest.json`
- `build/content/en/move-learners-manifest.json`
- `build/content/es/pokemon-manifest.json`
- `build/content/es/moves-manifest.json`
- `build/content/es/move-learners-manifest.json`

Estos artifacts hacen mas facil comparar datos generados de search sin exponer
Meilisearch privado directamente.
