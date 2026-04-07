---
title: Pipeline de sincronizacion con el sitio
description: Como los pushes en GitHub disparan el webhook del backend y mantienen cacheado el sitio publico.
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

1. Los docs se mergean a `main`.
2. El workflow `wiki-search` ejecuta `npm run build:search` para generar el payload completo de
   búsqueda y los manifiestos por locale.
3. El workflow siempre sube los artefactos. Cuando `WIKI_SEARCH_SYNC_URL` **y**
   `WIKI_SEARCH_SYNC_TOKEN` existen, también hace `POST` de `build/search-indices.json` al backend
   del sitio.
4. El backend autentica la petición, reemplaza los índices de Meilisearch (`wiki-docs`,
   `wiki-pokemon`, `wiki-moves`) y limpia las respuestas cacheadas para que el sitio público sirva
   el contenido nuevo.

Este flujo reemplaza el webhook legacy `wiki.synced`. Ahora los datos viajan en una sola dirección
(de CI al backend), así que los despliegues sólo necesitan credenciales de GitHub y el par
URL/token del backend.

## Contrato del endpoint

- **Método**: `POST`
- **URL**: `WIKI_SEARCH_SYNC_URL`
- **Headers**:
  - `Authorization: Bearer <WIKI_SEARCH_SYNC_TOKEN>`
  - `Content-Type: application/json`
- **Body**: el contenido completo de `build/search-indices.json`

El backend espera todo el dataset en cada llamada (no sólo los archivos cambiados) para poder
reemplazar los índices de Meilisearch de manera atómica.

## Esquema del payload

`build/search-indices.json` es un objeto con tres arreglos: `docs`, `pokemon` y `moves`. Cada
entrada sigue la estructura de registro que se detalla abajo.

| Campo | Descripción |
| --- | --- |
| `id` | Identificador estable (`en/reference/release-checklist`, `content/en/pokemon/pikachu`, etc.). |
| `slug` | Slug relativo a la raíz del wiki o al bucket de contenido. |
| `title` | Título renderizado usado para mostrar y rankear. |
| `description` | Resumen corto mostrado en resultados de búsqueda. |
| `tags` | Tags normalizados (`guide`, `content`, `electric`). |
| `lastUpdated` | Timestamp ISO del frontmatter cuando existe. |
| `status` | `draft`, `beta` o `stable`. |
| `lang` | Código de locale (`en`, `es`). |
| `order` | Peso numérico para el orden (docs primero, luego pokemon, luego moves). |
| `body` | Markdown/MDX o el resumen sintetizado para datasets de contenido. |

### Payload de ejemplo

Consulta `docs/es/reference/webhook-example.json` para un ejemplo truncado que respeta el esquema
sin subir todo el contenido del repo.

## Pruebas locales

```bash
curl --fail-with-body --show-error --silent \
  -X POST \
  -H "Authorization: Bearer $WIKI_SEARCH_SYNC_TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary @docs/es/reference/webhook-example.json \
  "$WIKI_SEARCH_SYNC_URL"
```

El backend debe responder con `200 OK`. Cualquier respuesta que no sea 2xx hace que el paso de
GitHub Actions falle y la corrida aparezca en CI.

## Manejo de fallos y reintentos

- Las respuestas **4xx** casi siempre indican que el token Bearer es inválido o falta. Rota
  `WIKI_SEARCH_SYNC_TOKEN` y vuelve a ejecutar el workflow.
- Las respuestas **5xx** vienen del backend o de Meilisearch. Repite el job cuando el servicio se
  recupere; el workflow regenerará el payload antes de reintentar.
- **Timeouts**: GitHub cancela la petición después de ~360 segundos. El backend debe emitir logs de
  progreso para que los fallos incluyan suficiente contexto.

## Cache busting

- Después de un sync exitoso el backend actualiza Meilisearch y vuelve a calentar las caches del
  wiki para los slugs afectados.
- El frontend usa `lastUpdated` en las respuestas de la API para decidir si debe pedir Markdown
  fresco.
- Cuando un sync falla, los datos indexados previamente se mantienen; el workflow nunca deja los
  índices en un estado parcial.

