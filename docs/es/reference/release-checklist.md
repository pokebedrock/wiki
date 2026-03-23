---
title: Checklist de release de la wiki
description: Verificaciones de release para generacion del search-index y sincronizacion con el sitio.
tags:
  - reference
  - release
lastUpdated: "2026-03-23"
status: stable
lang: es
---

# Checklist de release de la wiki

## Pre-deploy

- `npm ci`
- `npm run ci`
- verificar que cambios en docs tengan frontmatter y media validos
- verificar que los secrets de CI de search-index existan en el repo objetivo

## Publicacion / sincronizacion

1. Hacer merge de cambios de docs en `main`.
2. Ejecutar el workflow normal de CI.
3. Ejecutar el workflow de search-index si hace falta reconstruccion manual.
4. Confirmar que se generaron `build/search-index.json` y `build/search-indices.json`.
5. Confirmar que el endpoint de sync del backend acepto el nuevo payload.

## Post-publicacion

- verificar que las paginas de la wiki rendericen en el frontend
- verificar que la busqueda de la wiki devuelva docs actualizados
- verificar que existan manifiestos generados para pokemon, moves y move learners

## Rollback

- restaurar el ultimo commit estable conocido de la wiki
- volver a ejecutar el workflow de search-index
- verificar que los resultados de busqueda del backend coincidan con el contenido restaurado
