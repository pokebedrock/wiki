---
title: Changelog de documentacion
description: Registro de lanzamientos importantes de documentacion alineados con actualizaciones del servidor.
tags:
  - reference
  - changelog
lastUpdated: "2026-03-21"
status: draft
lang: es
toc: true
order: 4
---

## [Pendiente]

### Agregado

- Deteccion de cambios no confirmados en el indice de busqueda en CI
  (`check:generated`) para que los artefactos generados desactualizados
  fallen automaticamente en el pipeline.
- Alias `npm run build` para facilitar el desarrollo local.
- Paso `npm audit` en CI para detectar vulnerabilidades en dependencias.
- Documentacion de configuracion del bot renderizada como MDX con el
  componente `ShellBlock`.

### Corregido

- Guias de incorporacion alineadas con el flujo de trabajo actual de
  `npm run ci`.
- Rutas de localizacion y comando de CI en CONTRIBUTING.md actualizados
  para coincidir con la estructura del repositorio.
- DOCUMENTATION.md actualizado con el mapa preciso del repositorio y
  referencias al flujo de busqueda.
- Documentacion de variables de entorno del indice de busqueda corregida.
- Instrucciones obsoletas sobre etiquetas de traduccion eliminadas de la
  plantilla de PR en espanol.
- Filtros de rutas de CI `wiki-search` ampliados para cubrir cambios en
  scripts y configuracion de compilacion.

## [v2.0.0] — 2025-11-21

- Estructura inicial de la wiki, linting y CI.
- Flujo de indexacion de busqueda orientado a Meilisearch.
- Guia del flujo de localizacion con ejemplo en espanol.
