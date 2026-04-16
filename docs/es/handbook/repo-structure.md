---
title: Estructura del repositorio
description: Desglose de las carpetas de la wiki, los archivos de metadatos y como los consume el sitio web.
tags:
  - handbook
  - structure
lastUpdated: "2026-04-16"
status: stable
lang: es
toc: true
order: 2
---

## Arbol de documentacion

```text
docs/
  en/
    _meta.json            # Metadatos de categorias
    handbook/             # Gobernanza y docs para contribuidores
    guides/               # Tutoriales y guias
    reference/            # Especificaciones del sistema y automatizacion
    snippets/             # Fragmentos MDX reutilizables
    _partials/            # Inclusiones compartidas de MDX/Markdown
  es/
    _meta.json            # Metadatos de categorias (espanol)
    ...misma estructura que en
```

Cada pagina necesita frontmatter valido y un slug estable. Los archivos pueden ser Markdown (`.md`) o
MDX (`.mdx`). Mantene slugs identicos entre idiomas, por ejemplo:
`docs/en/guides/getting-started.mdx` y `docs/es/guides/getting-started.mdx`.

## Assets

```text
assets/
  images/                 # exportaciones webp/svg
  diagrams/               # archivos fuente (.drawio, .excalidraw, etc.)
  content/                # datasets JSON normalizados de Pokemon y movimientos
    en/
      pokemon/            # un archivo por Pokemon, generado por content:split
      moves/              # un archivo por movimiento, generado por content:split
    es/
      pokemon/            # espejo del dataset en espanol (hoy copiado desde en)
      moves/              # espejo del dataset en espanol (hoy copiado desde en)
```

Las imagenes referenciadas desde la documentacion deben vivir bajo `assets/`. Los diagramas conservan
sus fuentes editables para que futuros contribuidores puedan revisarlos. Los datasets
estructurados de Pokemon y movimientos tambien viven en `assets/content/` para que el indexado
de busqueda y el frontend puedan comparar entradas individuales.

> ℹ️ Las actualizaciones de contenido upstream llegan como `assets/content/wikiPokemon.json` y
> `assets/content/wikiMoves.json`. Ejecuta `npm run content:split` para regenerar
> los archivos por entrada versionados en git.

## Schemas y scripts

- `schemas/frontmatter.schema.json` - JSON Schema usado por `npm run lint:frontmatter`.
- `scripts/validate-frontmatter.ts` - Garantiza consistencia de metadatos.
- `scripts/check-images.ts` - Valida formato, tamano y texto alternativo.
- `scripts/build-search-index.ts` - Crea payloads de busqueda y manifiestos de contenido
  del frontend en `build/content/<locale>/`, y opcionalmente publica los indices de
  documentacion/Pokemon/movimientos en Meilisearch.
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
depende de un monorepo externo. Los trabajos posteriores (indexado de busqueda, chequeo de enlaces,
linting) solo miran archivos de este repo, lo que mantiene simples los alcances de CI y los
secretos requeridos.
