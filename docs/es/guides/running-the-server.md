---
title: Ejecutar la Wiki Localmente
description: Guía en español para instalar dependencias y validar la wiki.
tags:
  - guide
  - localization
  - es
lastUpdated: "2026-04-17"
status: beta
lang: es
toc: true
order: 3
---

## Requisitos

- Node.js 20+
- npm 10+

## Pasos

1. `npm ci`
2. Edita los archivos en `docs/`.
3. Ejecuta `npm run ci`.
4. Abre un PR, explica que se trata de una traducción al español y solicita
   revisión de `@pokebedrock/wiki-maintainers`.

## Revisión

- Mantén `lang: es` en el frontmatter y deja `status: beta` hasta que otra
  persona revise la traducción.
- Describe cualquier contexto de localización (términos nuevos, capturas, etc.)
  en la descripción del PR para que los revisores tengan el mismo contexto.

## Preview

Este repo no trae un servidor de docs dedicado. Para el trabajo diario:

- Usa el preview Markdown/MDX de tu editor (VS Code, Obsidian, etc.) para revisar
  texto, encabezados y callouts.
- Ejecuta `npm run build:search` si necesitas regenerar los payloads de búsqueda y
  los manifiestos del frontend después de cambios grandes de contenido.
- Usa el repo del website frontend para validar el render completo del sitio; seguí
  la documentación actual de ese repo para apuntarlo a esta copia de la wiki, en vez
  de asumir que acá existe una app de preview propia.

