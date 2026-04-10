---
title: Pipeline de sincronizacion con el sitio
description: Como el workflow wiki-search publica payloads nuevos al backend del sitio.
tags:
  - reference
  - sync
lastUpdated: "2026-04-10"
status: beta
lang: es
toc: true
order: 1
---

## Resumen del flujo

1. Los cambios que afectan docs, contenido localizado, esquemas o tooling llegan a `main`.
2. El workflow de GitHub Actions `wiki-search` (`.github/workflows/search-index.yml`) corre en cada
   push a `main`, en despachos manuales y a las 06:00 UTC diariamente.
3. El workflow instala Node 20, ejecuta `npm ci` y luego `npm run build:search`.
4. `npm run build:search` genera `build/search-index.json`, `build/search-indices.json` y los
   manifiestos localizados bajo `build/content/<locale>/` para Pokémon, movimientos y aprendices.
5. Los artifacts siempre se suben para que los revisores puedan inspeccionar los payloads aunque no
   haya credenciales del backend.
6. Cuando los secrets estan configurados, el workflow envia el JSON multi-indice al backend del sitio
   para que actualice el cluster privado de Meilisearch.

## Contrato del sync con el backend

Cuando `WIKI_SEARCH_SYNC_URL` y `WIKI_SEARCH_SYNC_TOKEN` existen, se ejecuta el paso _Sync search
index via website backend_. La solicitud tiene el siguiente formato:

| Elemento | Valor |
| --- | --- |
| Metodo | `POST` |
| URL | Valor de `WIKI_SEARCH_SYNC_URL` |
| Headers | `Authorization: Bearer <WIKI_SEARCH_SYNC_TOKEN>`, `Content-Type: application/json` |
| Body | Contenido de `build/search-indices.json` (ver `docs/es/reference/webhook-example.json` para un ejemplo reducido) |

El backend valida el token bearer antes de retransmitir el payload hacia Meilisearch. Cada payload
incluye tres arreglos: `docs`, `pokemon` y `moves`. Cada entrada respeta el schema descrito en
[Indexacion de busqueda](./search-indexing.md), asi que el backend solo necesita importar los datos a
los indices `wiki-*` internos.

Cuando falta alguno de los secrets, el workflow deja un mensaje de sync omitido y aun asi publica los
artifacts. Esto permite correr en staging sin credenciales de escritura.

## Pruebas locales

1. Ejecuta `npm run build:search` para generar los payloads mas recientes en `build/`.
2. Usa `curl` (o `Invoke-WebRequest`) para imitar la solicitud desde GitHub Actions:

```bash
curl --fail --show-error --silent \
  -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  --data-binary @build/search-indices.json \
  https://api.pokebedrock.com/wiki/search-sync
```

Para pruebas rapidas sin reconstruir el dataset tambien puedes publicar el ejemplo recortado en
`docs/es/reference/webhook-example.json`.

## Rollback y reenvios

- Vuelve a ejecutar el workflow `wiki-search` contra el ultimo commit estable (o sube manualmente los
  artifacts) para regenerar los payloads de busqueda.
- Dispara un workflow manual una vez que el commit de rollback este en `main` para reenviar el payload
  al backend.
- Si Meilisearch necesita resembrarse sin docs nuevos, despacha el workflow e indica el SHA objetivo
  para que los revisores puedan rastrear que datos se importaron.


