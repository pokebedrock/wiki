---
title: Changelog de documentacion
description: Registro de lanzamientos importantes de documentacion alineados con actualizaciones del servidor.
tags:
  - reference
  - changelog
lastUpdated: "2026-04-14"
status: draft
lang: es
toc: true
order: 4
---

## [Sin publicar]

- Entrada placeholder para proximas mejoras de la wiki.

## [v2.4.0] - 2026-04-14

- Se agrego una estrategia dedicada de versionado (EN + ES) para explicar cuando crear
  entradas del changelog, tags de release y reruns del indice de busqueda.
- Se amplio el checklist de release para exigir redactar el changelog, etiquetar la
  release (`wiki-vX.Y.Z`) y verificar los artefactos del workflow `wiki-search` antes de
  dar por finalizado un despliegue.
- Se aclaro el flujo de release enlazando la verificacion de sincronizacion con el
  backend, las entradas del changelog y la subida de payloads de busqueda para que el
  sitio procese el snapshot correcto.

## [v2.3.0] - 2026-03-28

- Guias de incorporacion actualizadas para alinearse con los pasos actuales del flujo CI.
- Comportamiento de variables de entorno del indice de busqueda clarificado en la documentacion de contribucion.
- Guia de contribucion alineada con el diseño de locales y el comando `npm run ci`.

## [v2.2.0] - 2026-03-09

- El CI ahora falla cuando los artefactos de busqueda generados difieren del estado confirmado.
- Activadores de rutas del flujo de busqueda ampliados para cubrir scripts compartidos y configuracion de build.
- Punto de entrada `npm run build` predeterminado agregado para el pipeline del indice de busqueda.
- Detalles del flujo de trabajo y referencias de automatizacion actualizados en la documentacion del repositorio.
- Estructura del repositorio wiki y documentacion del conjunto de datos de contenido clarificados.
- Instrucciones de instalacion actualizadas para usar `npm ci` para instalaciones reproducibles.

## [v2.1.0] - 2025-12-01

- Conjuntos de datos divididos en archivos JSON por elemento en `assets/content/pokemon/` y `assets/content/moves/`.
- La indexacion de busqueda ahora emite payloads separados de `docs`, `pokemon` y `moves` para Meilisearch.
- Manifiestos de frontend generados: `pokemon-manifest.json`, `moves-manifest.json`, `move-learners-manifest.json`.
- Documentacion de ShellBlock convertida al formato MDX.
- Flujo de sincronizacion de busqueda actualizado para enviar payload JSON al backend del sitio web.

## [v2.0.0] - 2025-11-21

- Estructura inicial de la wiki, linting y CI.
- Flujo de indexacion de busqueda orientado a Meilisearch.
- Guia del flujo de localizacion con ejemplo en espanol.
