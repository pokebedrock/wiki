---
title: Pipeline de sincronización con el sitio
description: Cómo los pushes en GitHub generan el payload de búsqueda y lo envían al backend.
tags:
  - reference
  - sync
lastUpdated: "2026-04-07"
status: beta
lang: es
toc: true
order: 1
---

## Resumen

La wiki ya no envía webhooks genéricos `wiki.synced`. En su lugar, cada push a `main`
(o la ejecución nocturna) dispara `.github/workflows/search-index.yml`, que:

1. Hace checkout del repositorio e instala dependencias con `npm ci`.
2. Ejecuta `npm run build:search` para regenerar:
   - `build/search-index.json` (fallback combinado local)
   - `build/search-indices.json` (payload multi-índice para Meilisearch)
   - Los manifiestos del frontend bajo `build/content/<locale>/` para Pokémon, movimientos y aprendices.
3. Cuando existen los secretos `WIKI_SEARCH_SYNC_URL` y `WIKI_SEARCH_SYNC_TOKEN`, hace `POST`
   de `build/search-indices.json` al endpoint protegido del backend del sitio.
4. Sube los artefactos generados para poder depurar aunque el backend no esté sincronizando.

El backend valida el token bearer contra `WIKI_SEARCH_SYNC_TOKEN`, envía los datos a Meilisearch
(`wiki-docs`, `wiki-pokemon`, `wiki-moves`) y aplica la configuración compartida antes de reemplazar
los documentos existentes.

## Secretos y configuración

| Ubicación | Variable | Propósito |
| --- | --- | --- |
| GitHub Actions | `WIKI_SEARCH_SYNC_URL` | Endpoint HTTPS que expone el backend del sitio (ej. `https://api.pokebedrock.com/internal/wiki/search-index`). |
| GitHub Actions | `WIKI_SEARCH_SYNC_TOKEN` | Secreto compartido que se envía como token bearer al backend. |
| Backend del sitio | `WIKI_SEARCH_SYNC_TOKEN` | Valor esperado del token; debe coincidir con el secreto de GitHub. |
| Backend del sitio | `MEILI_URL`, `MEILI_KEY`/`MEILI_MASTER_KEY` | Conexión a Meilisearch usada para ingerir los índices. |

Si los secretos de GitHub están vacíos, el workflow registra que omitió la sincronización y aun así
adjunta los artefactos para inspección manual.

## Contrato de la solicitud

| Campo | Descripción |
| --- | --- |
| Método | `POST` |
| URL | `https://api.pokebedrock.com/internal/wiki/search-index` (o la URL específica del entorno). |
| Encabezados | `Authorization: Bearer <WIKI_SEARCH_SYNC_TOKEN>` y `Content-Type: application/json`. |
| Cuerpo | Documento JSON con arreglos `docs`, `pokemon` y `moves` generados por `scripts/build-search-index.ts`. Cada registro incluye `id`, `slug`, `title`, `description`, `tags`, `status`, `lang`, `order`, `lastUpdated` y (opcionalmente) `body`. |
| Respuesta exitosa | `{ "ok": true, "indices": { docs: { indexUid, documentCount, taskUid }, ... } }`. |
| Respuestas de error | `401` cuando falta o no coincide el token, `503` cuando Meilisearch o las credenciales no están configuradas, además de un payload Problem+JSON con detalles. |

## Payload de ejemplo

Consulta `docs/es/reference/webhook-example.json` para obtener un payload realista listo para pruebas locales.

## Prueba manual con curl

```bash
curl --fail-with-body --show-error --silent \
  -X POST \
  -H "Authorization: Bearer $WIKI_SEARCH_SYNC_TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary @docs/es/reference/webhook-example.json \
  "$WIKI_SEARCH_SYNC_URL"
```

## Solución de problemas

- **401 Unauthorized** – El secreto de GitHub y `WIKI_SEARCH_SYNC_TOKEN` del backend no coinciden. Rótalos en ambos lados al mismo tiempo.
- **503 Wiki search sync is not configured** – El backend no tiene configurados el token
  o las variables de Meilisearch. Despliega con `WIKI_SEARCH_SYNC_TOKEN`, `MEILI_URL`
  y `MEILI_KEY/MEILI_MASTER_KEY`.
- **Resultados de búsqueda obsoletos** – Ejecuta `workflow_dispatch` para `wiki-search`
  y vuelve a subir el payload una vez que el backend esté listo.
- **Necesitas inspeccionar el payload** – Descarga el artefacto del workflow para
  revisar los manifiestos generados y confirmar el diff antes de reintentar la
  sincronización.
