---
title: Flujo de localizacion
description: Como estructurar documentacion traducida, coordinar traductores y revisar cambios localizados.
tags:
  - handbook
  - localization
lastUpdated: "2026-03-06"
status: stable
lang: es
toc: true
order: 4
---

## Estructura de archivos

- Pagina base en ingles: `docs/en/<category>/<slug>.md(x)`; usa `.mdx` cuando el doc
  necesite componentes MDX.
- Pagina traducida: `docs/<lang>/<category>/<slug>.md(x)`
- Ejemplo: `docs/en/guides/running-the-server.mdx` + `docs/es/guides/running-the-server.md`

Mantene los slugs iguales entre idiomas para que el mapeo de rutas y los alternates sean estables.

## Flujo

1. **Abri un issue**: usa la plantilla "Content Request" y marcala como tarea de traduccion.
2. **Crea una rama**: `docs/<lang>/<slug>`.
3. **Sincroniza con ingles**: compara contra `docs/en/...` para incluir cambios recientes.
4. **Ejecuta linting**: `npm run lint`.
5. **Pedi revision**: etiqueta a un maintainer que hable el idioma (si existe) y al owner del tema.

## Metadatos de idioma

Inclui la propiedad `lang` en el frontmatter junto con el campo `status`. Ejemplo:

```yaml
lang: es
status: beta
```

Usa `draft` o `beta` para traducciones que todavia necesiten revision nativa.

## Glosario

Manten consistencia terminologica usando el glosario compartido en
`docs/es/reference/localization-glossary.md` (se completa a medida que crecen las traducciones).
Cuando introduzcas un termino nuevo, anotarlo en la PR para que otros actualicen el glosario.



