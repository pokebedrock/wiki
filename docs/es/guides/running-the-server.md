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
3. Ejecuta `npm run ci` y luego `npm run audit:prod`.
4. Abre un PR, explica que se trata de una traducción al español y solicita
   revisión de `@pokebedrock/wiki-maintainers`.

`npm run ci` cubre linting, revisión de links y drift de los artifacts generados de
search/manifests. Antes de abrir una PR, ejecuta también `npm run audit:prod` para que tu
rama coincida con la misma auditoría de dependencias de producción que GitHub Actions
exige en pushes y pull requests.

## Revisión

- Mantén `lang: es` en el frontmatter y deja `status: beta` hasta que otra
  persona revise la traducción.
- Describe cualquier contexto de localización (términos nuevos, capturas, etc.)
  en la descripción del PR para que los revisores tengan el mismo contexto.



