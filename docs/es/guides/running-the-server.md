---
title: Ejecutar la Wiki Localmente
description: Guía en español para instalar dependencias y validar la wiki.
tags:
  - guide
  - localization
  - es
lastUpdated: "2026-03-19"
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



