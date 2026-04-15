---
title: Checklist de release de la wiki
description: Verificaciones de release para generacion del search-index y sincronizacion con el sitio.
tags:
  - reference
  - release
lastUpdated: "2026-04-14"
status: stable
lang: es
---

# Checklist de release de la wiki

## Pre-deploy

- `npm ci`
- `npm run ci`
- verificar que la validacion local pase mediante el gate estandar del repo (incluye checks de search/manifests generados)
- verificar que cambios en docs tengan frontmatter y media validos
- verificar que los secrets de CI de search-index existan si la sincronizacion con website-backend esta habilitada para el repo objetivo
- agregar/actualizar la entrada en `docs/es/reference/changelog.md` (y las copias
  localizadas) con la version, fecha y puntos destacados de la release
- definir el nombre del tag de release (`wiki-vX.Y.Z`) y anotarlo en el changelog antes
  del merge

## Publicacion / sincronizacion

1. Hacer merge de cambios de docs en `main`.
2. Ejecutar el workflow normal de CI.
3. Ejecutar (o despachar manualmente) el workflow `wiki-search` para el commit de la
   release y reconstruir los payloads de Meilisearch/manifiestos.
4. Confirmar que se generaron `build/search-index.json`, `build/search-indices.json` y
   los manifiestos de contenido del frontend bajo `build/content/<locale>/`.
5. Si la sincronizacion con website-backend esta habilitada, confirmar que el endpoint de sync del backend acepto el nuevo payload.
6. Crear/subir el tag definido en el changelog (por ejemplo `wiki-v2.4.0`) y publicar o
   actualizar la release de GitHub con link al changelog.

## Post-publicacion

- verificar que las paginas de la wiki rendericen en el frontend
- verificar que la busqueda de la wiki devuelva docs actualizados
- verificar que existan manifiestos generados para pokemon, moves y move learners
- verificar que el tag y la release de GitHub apunten a la entrada correcta del changelog

## Rollback

- restaurar el ultimo commit estable conocido de la wiki
- volver a ejecutar el workflow de search-index
- verificar que los resultados de busqueda del backend coincidan con el contenido restaurado
- volver a etiquetar la release (o recrear el tag/release en GitHub) para que el
  historial señale el commit restaurado
