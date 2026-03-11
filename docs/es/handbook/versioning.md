---
title: Estrategia de versionado de docs
description: Guia para versionar y mantener changelog de actualizaciones mayores de documentacion.
tags:
  - handbook
  - versioning
lastUpdated: "2025-11-21"
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
| `current` | Rama por defecto | Raiz de `docs/` |
| `vX.Y` | Actualizacion mayor de gameplay | `versions/vX.Y/` (misma estructura) |
| `legacy` | Contenido sin soporte | Rama archivada o export zip |

## Flujo de release

1. Preparar cambios bajo `docs/`.
2. Cuando la actualizacion salga, copiar la carpeta a `versions/vX.Y/` y congelar.
3. Actualizar `docs/reference/changelog.md` con puntos clave y links.
4. Asegurar que el indexado de busqueda excluya versiones archivadas salvo que se solicite explicitamente (configurar filtro en Meilisearch).

## Changelog

Usar encabezados semanticos:

```text
## [v2.0.0] - 2025-11-21
### Added
- ...
```

El archivo `docs/reference/changelog.md` mantiene el registro publico sincronizado con los lanzamientos del juego.



