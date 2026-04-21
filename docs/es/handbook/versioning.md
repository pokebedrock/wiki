---
title: Estrategia de versionado de docs
description: Guia para versionar y mantener changelog de actualizaciones mayores de documentacion.
tags:
  - handbook
  - versioning
lastUpdated: "2026-04-21"
status: stable
lang: es
toc: true
order: 5
---

## Filosofia

Versionamos docs cuando la experiencia de juego o las APIs publicas cambian de forma
incompatible. Las ediciones de texto rutinarias permanecen en la version activa.

## Tipos de version

| Version | Disparador | Almacenamiento |
| --- | --- | --- |
| `current` | Rama por defecto | Raiz de `docs/` en `main` |
| `vX.Y` | Actualizacion mayor de gameplay | Tag/release anotado de git que apunta al commit snapshot |
| `legacy` | Contenido sin soporte | Rama archivada, tag de git o export zip |

## Flujo de release

1. Preparar cambios bajo `docs/` en `main`.
2. Cuando la actualizacion salga, crear un tag de release para el commit
   que debe representar el snapshot congelado de docs (por ejemplo `v2.4.0`).
3. Actualizar `docs/es/reference/changelog.md` con puntos clave y links al
   release tageado cuando corresponda.
4. Asegurar que el indexado de busqueda mantenga actualizadas las docs vivas
   de `main`, e indexar snapshots historicos por separado solo si algun
   consumidor lo necesita explicitamente.

## Changelog

Usar encabezados semanticos:

```text
## [v2.0.0] - 2025-11-21
### Added
- ...
```

El archivo `docs/es/reference/changelog.md` mantiene el registro publico sincronizado con los lanzamientos del juego.



