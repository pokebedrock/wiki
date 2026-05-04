---
title: Pipeline de sincronizacion con el sitio
description: Como los builds del search-index hacen POST de manifests al backend del sitio y refrescan la cache publica.
tags:
  - reference
  - sync
lastUpdated: "2026-05-04"
status: beta
lang: es
toc: true
order: 1
---

## Resumen

1. Los docs o datasets de contenido se mergean a `main`.
2. `.github/workflows/search-index.yml` ejecuta `npm run build:search`.
3. El workflow hace `POST` de `build/search-indices.json` al backend del sitio cuando
   `WIKI_SEARCH_SYNC_URL` y `WIKI_SEARCH_SYNC_TOKEN` estan configurados.
4. El backend refresca el payload de busqueda consumido por el sitio publico.

## Contrato de sincronizacion

La sincronizacion actual es una subida JSON autenticada con bearer, no un webhook del repositorio.
El cuerpo de la request es el archivo generado `build/search-indices.json`.

| Parte | Descripcion |
| --- | --- |
| Header `Authorization` | `Bearer $WIKI_SEARCH_SYNC_TOKEN` |
| Header `Content-Type` | `application/json` |
| Request body | Payload raw de `build/search-indices.json` |
| URL destino | `WIKI_SEARCH_SYNC_URL` |

Ver `.github/workflows/search-index.yml` para la forma exacta de la request en CI.

## Pruebas locales

Construye el payload localmente y luego haz `POST` del artefacto generado al backend.

```bash
npm run build:search
curl --fail-with-body --show-error --silent \
  -X POST \
  -H "Authorization: Bearer $WIKI_SEARCH_SYNC_TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary @build/search-indices.json \
  "$WIKI_SEARCH_SYNC_URL"
```

## Comportamiento de cache

- `scripts/build-search-index.ts` regenera los payloads de busqueda combinados de docs,
  Pokemon y moves antes de cada sincronizacion.
- Si faltan las credenciales de sync del backend, el workflow igual sube los artefactos
  generados para que los maintainers puedan inspeccionar o reintentar el payload manualmente.
- El sitio publico lee el dataset de busqueda actualizado desde el website-backend en vez
  de obtener archivos markdown modificados directamente desde GitHub.



