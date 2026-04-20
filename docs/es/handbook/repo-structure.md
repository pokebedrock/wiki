---
title: Estructura del repositorio
description: Desglose de carpetas de la wiki, archivos de metadatos y como los consume el sitio web.
tags:
  - handbook
  - structure
lastUpdated: "2026-03-07"
status: stable
lang: es
toc: true
order: 2
---

## Arbol de docs

```text
docs/
  en/
    _meta.json            # Metadatos de categorias
    handbook/             # Gobernanza y docs de contribuidores
    guides/               # Tutoriales y guias
    reference/            # Especificaciones del sistema y automatizacion
    snippets/             # Fragmentos MDX reutilizables
    _partials/            # Includes compartidos de MDX/Markdown
  es/
    _meta.json            # Metadatos de categorias (espanol)
    ...misma estructura que en
```

Cada pagina necesita frontmatter valido y un slug estable. Los archivos pueden ser Markdown (`.md`) o
MDX (`.mdx`). Mantene slugs identicos entre idiomas, por ejemplo:
`docs/en/guides/getting-started.mdx` and `docs/es/guides/getting-started.mdx`.

## Assets

```text
assets/
  images/                 # exports webp/svg
  diagrams/               # archivos fuente (.drawio, .excalidraw, etc.)
```

Las imagenes referenciadas desde docs deben vivir bajo `assets/`. Los diagramas conservan
sus fuentes editables para que futuros contribuidores puedan revisarlos.

Los datasets upstream opcionales tambien se pueden dividir en archivos por idioma bajo
`assets/content/<locale>/{pokemon,moves}` cuando haga falta regenerar las entradas que
consumen la busqueda y los manifiestos. Esos directorios son inputs manejados por los
scripts, no parte fija del arbol versionado que siempre existe en el repo.

> ℹ️ Cuando lleguen drops monoliticos de contenido upstream, ejecuta
> `npm run content:split` para regenerar `assets/content/<locale>/pokemon/*.json`
> y `assets/content/<locale>/moves/*.json` antes de versionarlos.

## Schemas y scripts

- `schemas/frontmatter.schema.json` - JSON Schema usado por `npm run lint:frontmatter`.
- `scripts/validate-frontmatter.ts` - Garantiza consistencia de metadatos.
- `scripts/check-images.ts` - Valida formato, tamano y alt text.
- `scripts/build-search-index.ts` - Crea payloads de busqueda y manifiestos de contenido
  del frontend en `build/content/<locale>/`, y opcionalmente publica los indices de
  docs/pokemon/moves en Meilisearch.
- `scripts/split-content-data.ts` - Divide `wikiPokemon.json` y `wikiMoves.json`
  de upstream en directorios por idioma bajo
  `assets/content/<locale>/{pokemon,moves}` usando
  `npm run content:split`.

## Automatizacion de GitHub

```text
.github/
  ISSUE_TEMPLATE/         # Formularios de bug + solicitud de contenido
  workflows/
    ci.yml                # Ejecuta npm run ci + npm run audit:prod en push/PR
    search-index.yml      # Construye payloads de busqueda + manifests frontend
  PULL_REQUEST_TEMPLATE.md
CODEOWNERS
```

Este repositorio ahora contiene la wiki como proyecto independiente. Toda la automatizacion
vive en la raiz (`.github/workflows`, scripts de lint compartidos, CODEOWNERS), asi nada
depende de un monorepo externo. Los jobs downstream (indexado de busqueda, chequeo de links,
linting) solo miran archivos de este repo, lo que mantiene simples los alcances de CI y los
secrets requeridos.
