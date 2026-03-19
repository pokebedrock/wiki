---
title: Changelog de documentacion
description: Registro de lanzamientos importantes de documentacion alineados con actualizaciones del servidor.
tags:
  - reference
  - changelog
lastUpdated: "2026-03-19"
status: stable
lang: es
toc: true
order: 4
---

## [Unreleased]

- Entrada placeholder para proximas mejoras de la wiki.

## [v2.1.0] - 2026-03-19

### Agregado (v2.1.0)

- Guias, referencias y listas de verificacion traducidas al espanol que se
  mantienen sincronizadas con las versiones en ingles.
- Alias predeterminado `npm run build` para mantener las herramientas locales
  alineadas con los disparadores del flujo de indexacion de Meilisearch.

### Cambiado (v2.1.0)

- Las guias de onboarding y ejecucion local ahora priorizan `npm run ci` para
  garantizar lint, enlaces y verificacion de archivos generados antes del PR.
- Se actualizaron los documentos de estructura del repo y contribucion para
  explicar el arbol por locale y como CODEOWNERS controla las revisiones de
  localizacion.
- Se documentaron los requisitos de entorno del indice de busqueda y el webhook
  de sincronizacion para que operaciones sepa cuando definir
  `MEILISEARCH_URL/KEY` en reconstrucciones manuales.

### Corregido (v2.1.0)

- Se reparo el renderizado de bloques ShellBlock en MDX para que los comandos y
  avisos pasen lint en todos los idiomas.
- Se aclaro el orden de la lista de verificacion de lanzamientos para reducir
  falsos positivos en la deteccion de deriva del indice de busqueda.


## [v2.0.0] - 2025-11-21

### Agregado (v2.0.0)

- Estructura inicial de la wiki, linting y CI.
- Flujo de indexacion de busqueda orientado a Meilisearch.
- Guia del flujo de localizacion con ejemplo en espanol.



