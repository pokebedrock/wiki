---
title: Estrategia de versionado de docs
description: Guia para versionar y mantener changelog de actualizaciones mayores de documentacion.
tags:
  - handbook
  - versioning
lastUpdated: "2026-04-14"
status: stable
lang: es
toc: true
order: 5
---

## Filosofia

Versionamos docs cuando la experiencia de juego o las APIs publicas cambian de forma
incompatible. Las ediciones de texto rutinarias permanecen en la version activa.

## Superficies de version

| Superficie | Disparador | Almacenamiento |
| --- | --- | --- |
| `current` | Rama por defecto | El arbol compartido `docs/` en `main` |
| Snapshot de release | Actualizacion mayor de gameplay | Tag de Git/GitHub release para el merge + entrada en `docs/es/reference/changelog.md` |

> ℹ️ Ya no se duplica la documentacion en `versions/`.
> El historial de Git, los tags de release y el changelog son la referencia canonical.

## Flujo de release

1. Preparar cambios bajo `docs/` en una rama feature.
2. Hacer merge en `main` cuando la actualizacion este en vivo o programada.
3. Agregar la seccion `## [vX.Y.Z] - YYYY-MM-DD` a `docs/es/reference/changelog.md` con los puntos clave y links.
4. Crear o actualizar el tag/release correspondiente (por ejemplo, `wiki-v2.4.0`) para dejar un puntero permanente al commit.
5. Verificar que el workflow `search-index` haya finalizado sobre ese commit etiquetado para que Meilisearch y los manifiestos reflejen la release.

## Acceso a releases anteriores

- Usar `git checkout <tag>` (o la UI de GitHub) para navegar un snapshot.
- Linkear directamente el tag/commit en respuestas de soporte cuando se describa comportamiento legado.
- Si se exporta una copia offline, basarla en el commit etiquetado para mantener consistencia con el changelog.

## Changelog

Usar encabezados semanticos:

```text
## [v2.0.0] - 2025-11-21
### Added
- ...
```

El archivo `docs/es/reference/changelog.md` mantiene el registro publico sincronizado con los lanzamientos del juego.

