---
title: Estructura del repositorio
description: Desglose de carpetas de la wiki, archivos de metadatos y como los consume el sitio web.
tags:
  - handbook
  - structure
lastUpdated: "2026-04-09"
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
  content/                # datasets JSON normalizados de Pokemon + moves
    en/
      pokemon/            # un archivo por Pokémon, editado manualmente (fuente en inglés)
      moves/              # un archivo por move, editado manualmente (fuente en inglés)
    es/
      pokemon/            # espejo del dataset en español (hoy copiado desde en)
      moves/              # espejo del dataset en español (hoy copiado desde en)
```

Las imágenes referenciadas desde docs deben vivir bajo `assets/`. Los diagramas conservan
sus fuentes editables para que futuros contribuidores puedan revisarlos. Los datasets
estructurados de Pokémon y moves también viven en `assets/content/` para que el indexado
de búsqueda y el frontend puedan comparar entradas individuales.

Los JSON en inglés ubicados en `assets/content/en/{pokemon,moves}` son la fuente
canónica. Actualiza esos archivos por entrada cuando haya cambios y luego copia
las mismas modificaciones en `assets/content/es/**` hasta que existan traducciones
propias. Ya no existe la automatización `content:split`: después de editar los
datasets ejecuta `npm run build:search` (o `npm run check:generated`) para
reconstruir los manifiestos y asegurarte de que CI detecte los nuevos payloads de
búsqueda.

## Schemas y scripts

- `schemas/frontmatter.schema.json` - JSON Schema usado por `npm run lint:frontmatter`.
- `scripts/validate-frontmatter.ts` - Garantiza consistencia de metadatos.
- `scripts/check-images.ts` - Valida formato, tamano y alt text.
- `scripts/build-search-index.ts` - Crea payloads de busqueda y manifiestos de contenido
  del frontend en `build/content/<locale>/`, y opcionalmente publica los indices de
  docs/pokemon/moves en Meilisearch.

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
