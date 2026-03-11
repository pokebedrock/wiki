---
title: Vision general de la wiki
description: Comprende los objetivos, alcance y estructura del repositorio wiki de PokéBedrock.
tags:
  - handbook
  - onboarding
lastUpdated: "2025-11-21"
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
- Workflows de GitHub para linting, validacion de links e indexado en Meilisearch.
- Plantillas para issues, PRs y revisiones de CODEOWNERS.

Consulta las otras paginas del handbook para profundizar en estructura, localizacion y versionado.



