---
title: Checklist de publicación de la wiki
description: Verificaciones de publicación para la generación del search-index y la sincronización con el sitio.
tags:
  - reference
  - release
lastUpdated: "2026-04-22"
status: stable
lang: es
---

# Checklist de publicación de la wiki

## Antes del despliegue

- `npm ci`
- `npm run ci`
- verificar que la validación local pase mediante el gate estándar del repo (incluye checks del search-index y manifiestos generados)
- verificar que los cambios en docs tengan frontmatter y media válidos
- verificar que los secrets de CI de search-index existan si la sincronización con website-backend está habilitada para el repo objetivo

## Publicación / sincronización

1. Hacer merge de cambios de docs en `main`.
2. Ejecutar el workflow normal de CI.
3. Ejecutar el workflow de search-index si hace falta reconstrucción manual.
4. Confirmar que se generaron `build/search-index.json`, `build/search-indices.json` y los manifiestos de contenido del frontend bajo `build/content/<locale>/`.
5. Si la sincronización con website-backend está habilitada, confirmar que el endpoint de sync del backend aceptó el nuevo payload.

## Después de la publicación

- verificar que las páginas de la wiki rendericen en el frontend
- verificar que la búsqueda de la wiki devuelva docs actualizados
- verificar que existan manifiestos generados para pokemon, moves y move learners

## Reversión

- restaurar el último commit estable conocido de la wiki
- volver a ejecutar el workflow de search-index
- verificar que los resultados de búsqueda del backend coincidan con el contenido restaurado
