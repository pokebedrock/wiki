---
title: Pipeline de sincronización con el sitio
description: Cómo el workflow wiki-search entrega los payloads de búsqueda al backend del sitio.
tags:
  - reference
  - sync
lastUpdated: "2026-04-11"
status: stable
lang: es
toc: true
order: 1
---

## Resumen

El sitio ya no consulta GitHub para detectar cambios en Markdown. Ahora el workflow
`wiki-search` (`.github/workflows/search-index.yml`) compila el payload de búsqueda
y los manifiestos del frontend y los envía directamente al backend del sitio.

Disparadores del workflow:

1. Pushes a `main` que tocan docs, esquemas, scripts o configuración de build.
2. Ejecuciones manuales (`workflow_dispatch`) para hotfixes.
3. Un cron nocturno (`0 6 * * *`) para mantener Meilisearch fresco aunque no haya commits.

Cada ejecución realiza:

| Paso | Descripción |
| --- | --- |
| Instalación | `npm ci` sobre Node 20 aprovechando la caché de npm. |
| Build | `npm run build:search` genera `build/search-indices.json`, los manifiestos por locale en `build/content/<locale>/` y el fallback `build/search-index.json`. |
| Sincronización | Cuando existen los secretos, el job hace POST de `build/search-indices.json` al backend vía HTTPS. |
| Artefacto | Los JSON crudos se suben como artifact de Actions para auditoría y replays manuales. |

## Secretos requeridos

| Secreto | Descripción |
| --- | --- |
| `WIKI_SEARCH_SYNC_URL` | Endpoint HTTPS expuesto por el backend (por ejemplo `https://api.pokebedrock.com/wiki/search-sync`). |
| `WIKI_SEARCH_SYNC_TOKEN` | Token Bearer que el backend valida antes de aceptar un payload. |

Si algún secreto está vacío, el workflow igual construye los artefactos pero deja un log indicando que se omitió la sincronización.

## Contrato HTTP

El paso de sync ejecuta:

```bash
curl --fail-with-body --silent --show-error \
  -X POST \
  -H "Authorization: Bearer $WIKI_SEARCH_SYNC_TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary @build/search-indices.json \
  "$WIKI_SEARCH_SYNC_URL"
```

- `Content-Type` debe permanecer en `application/json`.
- La cabecera Authorization usa el token en claro (sin HMAC). Rota el token en ambos repos cuando cambie el acceso.
- El cuerpo es exactamente el contenido de `build/search-indices.json`.

## Forma del payload

`docs/es/reference/webhook-example.json` refleja un payload reducido. Las claves de primer nivel representan los índices de Meilisearch:

| Clave | Índice |
| --- | --- |
| `docs` | Documentos Markdown/MDX renderizados para búsqueda. |
| `pokemon` | Entradas generadas del Pokédex derivadas de `assets/content`. |
| `moves` | Entradas generadas de movimientos derivadas de `assets/content`. |

Cada entrada incluye los metadatos de búsqueda (`id`, `slug`, `title`, `description`,
`tags`, `status`, `lang`, `order`, `body`). El backend transmite el payload al
clúster privado de Meilisearch reemplazando cada índice completo en cada corrida.

## Caché e invalidación del sitio

Después de ingerir el payload el backend:

1. Reconstruye los índices `wiki-docs`, `wiki-pokemon` y `wiki-moves` dentro de Meilisearch.
2. Invalida la caché del sitio para los docs afectados, lo que obliga al frontend a pedir resultados frescos.
3. Expone el artifact combinado `build/search-index.json` al frontend como fallback cuando Meilisearch no está disponible.

Este flujo elimina el polling legacy del GitHub Contents API y mantiene el sitio público alineado con el mismo data set que validó el CI.

