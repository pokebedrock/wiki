---
title: Pipeline de sincronizacion con el sitio
description: Como los pushes en GitHub disparan el webhook del backend y mantienen cacheado el sitio publico.
tags:
  - reference
  - sync
lastUpdated: "2026-03-20"
status: beta
lang: es
toc: true
order: 1
---

## Resumen

1. Los docs se mergean a `main`.
2. GitHub dispara un repository dispatch/webhook gestionado por el backend del sitio.
3. El backend obtiene archivos cambiados via GitHub Contents API usando ETags para cache-busting.
4. La salida renderizada en HTML/MDX se cachea en Redis con TTL de 15 minutos.

## Contrato del webhook

| Campo | Descripcion |
| --- | --- |
| `event` | Siempre `wiki.synced` |
| `commit` | SHA del commit mergeado |
| `files` | Arreglo de rutas de docs modificadas |
| `timestamp` | Timestamp ISO |

El backend valida el HMAC usando el secreto compartido `WIKI_WEBHOOK_SECRET`. Ver
`website-backend/src/http/routes/webhooks.ts` para detalles de implementacion.

## Pruebas locales

Usa el payload de ejemplo en `docs/es/reference/webhook-example.json` (o la versión
en inglés en `docs/en/reference/webhook-example.json`) con `curl` o
`Invoke-WebRequest`.

```powershell
Invoke-WebRequest `
  -Uri https://api.pokebedrock.com/wiki/webhook `
  -Headers @{ "X-Signature" = "<hmac>" } `
  -Body (Get-Content docs/es/reference/webhook-example.json -Raw) `
  -Method Post
```

## Cache busting

- El backend guarda el `ETag` devuelto por GitHub por archivo.
- En sincronizaciones siguientes, envia `If-None-Match`; el contenido sin cambios evita re-render.
- Cuando el sitio sirve una pagina, incluye `lastUpdated` del frontmatter en la respuesta
  para ayudar al cliente a decidir si debe pedir datos frescos.



