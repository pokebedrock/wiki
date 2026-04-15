---
title: Vision general de la wiki
description: Comprende los objetivos, alcance y estructura del repositorio wiki de PokéBedrock.
tags:
  - handbook
  - onboarding
lastUpdated: "2026-04-15"
status: stable
lang: es
toc: true
order: 1
---

La wiki de PokéBedrock centraliza toda la documentacion publica del proyecto. Este repositorio cumple tres objetivos:

1. Dar a los contribuidores un lugar predecible para proponer cambios de docs.
2. Proveer puntos de automatizacion (linting, chequeo de links, indexado de busqueda).
3. Alimentar el sitio publico mediante un pipeline de sincronizacion.

## Principios clave

- **Fuente de verdad**: trata `main` como el estado canonico del contenido.
- **Automatizacion primero**: toda regla que valga documentar deberia aplicarse con script o job de CI.
- **Autoría inclusiva**: Markdown por defecto, MDX cuando sea necesario y soporte de localizacion que crece con la comunidad.

## Puntos destacados del repo

- Arbol estructurado de `docs/` con `_meta.json` para orden.
- Carpeta compartida `assets/` con guia de LFS para binarios grandes.
- Frontmatter validado por JSON Schema para mantener metadatos consistentes.
- Payloads de busqueda generados (`build/search-index.json`, `build/search-indices.json` y los manifiestos bajo `build/content/<locale>/`)
  versionados en git para que `npm run check:generated` detecte drift antes del merge.
- Workflows de GitHub para linting, validacion de links e indexado en Meilisearch.
- Plantillas para issues, PRs y revisiones de CODEOWNERS.

## Automatizacion y releases

- `npm run check:generated` reconstruye los payloads/manifiestos anteriores y falla el CI cuando las copias confirmadas quedan fuera de
  sync, evitando que llegue contenido viejo al sitio.
- El workflow `wiki-search` se ejecuta tras cada merge en `main` (y de forma nocturna) para publicar el mismo conjunto de payloads. Cuando
  `WIKI_SEARCH_SYNC_URL` + `WIKI_SEARCH_SYNC_TOKEN` estan configurados, el job tambien hace POST del payload combinado al backend del sitio
  para mantener Meilisearch alineado con el snapshot del repo.
- Las entradas del changelog mas los tags `wiki-vX.Y.Z` documentan cada release y le dan a soporte un puntero estable que coincide con lo
  que se indexo.

Consulta las otras paginas del handbook para profundizar en estructura, localizacion, versionado y gobernanza de releases.



