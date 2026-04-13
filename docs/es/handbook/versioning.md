---
title: Estrategia de versionado de docs
description: Guia para versionar y mantener changelog de actualizaciones mayores de documentacion.
tags:
  - handbook
  - versioning
lastUpdated: "2026-04-13"
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
| `vX.Y` | Actualizacion mayor de gameplay | Tag anotado de git (`wiki-vX.Y`) |
| `legacy` | Contenido sin soporte | Rama archivada o zip exportado desde el tag |

> Ya no copiamos los docs a carpetas `versions/`. Los tags inmutables evitan
> duplicar el arbol y eliminan merges extra.

## Flujo de release

1. Preparar y fusionar cambios bajo `docs/`.
2. Etiquetar el commit con un tag anotado: `git tag -a wiki-vX.Y -m "Wiki vX.Y"`.
3. Publicar el tag (`git push origin wiki-vX.Y`).
4. Actualizar `docs/es/reference/changelog.md` con puntos clave e issues/PRs relacionados.
5. Si alguien necesita un artefacto estatico, exportar el tag: `git archive --format=zip --output wiki-vX.Y.zip wiki-vX.Y docs/`.
6. El indexado de busqueda apunta a `main`; para revisar contenido historico, usa `git checkout wiki-vX.Y` en lugar de reejecutar la canalizacion.

## Changelog

Usar encabezados semanticos:

```text
## [v2.0.0] - 2025-11-21
### Added
- ...
```

El archivo `docs/es/reference/changelog.md` mantiene el registro publico sincronizado con los lanzamientos del juego.


