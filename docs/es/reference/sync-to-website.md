---
title: Pipeline de sincronización con el sitio
description: Cómo los artefactos de búsqueda del wiki llegan al backend del sitio y al clúster de Meilisearch.
tags:
  - reference
  - sync
  - automation
lastUpdated: "2026-04-15"
status: stable
lang: es
toc: true
order: 1
---

## Flujo de automatización

1. Un cambio en docs o contenido se mergea en `main`, o se ejecuta el cron nocturno (`0 6 * * *`).
2. `.github/workflows/search-index.yml` (`wiki-search`) hace checkout del repo,
   instala dependencias de Node 20 y ejecuta `npm run build:search`.
3. El build escribe los artefactos bajo `build/` y registra un resumen en los logs
   para trazabilidad.
4. Cuando los secretos `WIKI_SEARCH_SYNC_URL` y `WIKI_SEARCH_SYNC_TOKEN` existen,
   el workflow envía por `POST` el payload `build/search-indices.json` al backend
   usando un token Bearer.
5. Si falta alguno de los secretos, el workflow deja un log explícito indicando
   que se omitió la sincronización para que el equipo sepa por qué el backend no
   se actualizó.
6. Independientemente del estado de sync, el workflow sube los artefactos de
   búsqueda y los manifiestos como un artifact llamado `search-index` para
   depuración.

### Salidas del build

`npm run build:search` ejecuta los scripts TypeScript bajo `build/scripts/` y escribe:

- `build/search-index.json`: dataset aplanado para QA local.
- `build/search-indices.json`: objeto JSON con los arreglos `{ docs, pokemon,
  moves }` consumido por Meilisearch y el endpoint de sync del backend.
- `build/content/<locale>/pokemon-manifest.json`: metadatos pre-ordenados de
  Pokémon para la navegación del frontend.
- `build/content/<locale>/moves-manifest.json`: metadatos de movimientos para consultas rápidas.
- `build/content/<locale>/move-learners-manifest.json`: tabla derivada
  Pokémon-por-movimiento usada en las páginas de detalle de movimientos.

Estos archivos están versionados en git, así que `npm run check:generated` (y el
CI) detectan cualquier desalineación.

## Contrato de sincronización con el backend

Cuando se ejecuta el paso de sync, GitHub Actions corre el equivalente a:

```bash
curl --fail-with-body --show-error --silent \
  -X POST \
  -H "Authorization: Bearer $WIKI_SEARCH_SYNC_TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary @build/search-indices.json \
  "$WIKI_SEARCH_SYNC_URL"
```

| Requisito | Detalles |
| --- | --- |
| Método | `POST` |
| URL | Secreto `WIKI_SEARCH_SYNC_URL` |
| Auth | `Authorization: Bearer ${WIKI_SEARCH_SYNC_TOKEN}` |
| Body | Contenido exacto de `build/search-indices.json` |
| Éxito | El backend responde `2xx`; el workflow registra la salida de `curl` |

El backend valida el token Bearer, ingiere los arreglos de
docs/movimientos/Pokémon y reemplaza los índices de Meilisearch
(`wiki-docs`, `wiki-pokemon`, `wiki-moves`). Una respuesta no-2xx falla el job
para que los mantenedores revisen los logs antes de reintentar.

## Ejemplo de cuerpo de solicitud

`docs/es/reference/search-sync-example.json` contiene un payload reducido con un
registro por índice. Úsalo para entender el esquema o para simular el backend en
local.

```bash
curl -X POST \
  -H "Authorization: Bearer dev-token" \
  -H "Content-Type: application/json" \
  --data @docs/es/reference/search-sync-example.json \
  https://dev.pokebedrock.com/wiki/search-sync
```

## Pruebas locales

1. `npm ci`
2. `npm run build:search`
3. Revisa `build/search-indices.json` para confirmar que los conteos de docs,
   Pokémon y movimientos se ven razonables.
4. (Opcional) Define `MEILISEARCH_URL` + `MEILISEARCH_KEY` para hacer push
   directo a una instancia de Meilisearch de staging.
5. Usa el comando `curl` anterior para reejecutar el payload contra un backend
   de staging. Esto replica el sync de GitHub Actions de extremo a extremo.

## Comportamiento ante fallos y reintentos

- Falta de secretos ⇒ el paso de sync registra que se omitió y la corrida sigue
  siendo exitosa.
- Backend responde con no-2xx ⇒ el workflow falla y debe reejecutarse una vez
  resuelto el problema.
- Para reponer una sync perdida, lanza `wiki-search` desde **Run workflow** en
  GitHub (`workflow_dispatch`). El job reconstruirá los artefactos y los
  reenviará usando el último commit de `main`.

## Expectativas de caché y búsqueda

- El backend importa el payload en su clúster privado de Meilisearch y lo sirve
  inmediatamente al sitio público.
- El frontend cachea los manifiestos derivados (Pokémon, movimientos,
  aprendices) en `localStorage`; los redeploys invalidan las llaves de caché
  cuando cambian los `lastUpdated`.
- Si es necesario hacer rollback, vuelve a ejecutar `wiki-search` apuntando al
  commit deseado para reemplazar Meilisearch con el dataset previo.
