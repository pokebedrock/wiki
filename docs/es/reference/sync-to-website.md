---
title: Pipeline de sincronización con el sitio
description: Cómo el frontend monta el repositorio del wiki y mantiene el contenido fresco.
tags:
  - reference
  - sync
lastUpdated: "2026-04-11"
status: beta
lang: es
toc: true
order: 1
---

## Resumen

El sitio público ya no espera webhooks `wiki.synced`. El frontend de Next.js
mantiene un checkout local de `pokebedrock/wiki` junto a la app y renderiza el
Markdown directamente desde disco (ver `website-frontend/src/lib/wiki.ts`). El
flujo actual es:

1. Los despliegues clonan (o montan) el repositorio del wiki al lado de
   `website-frontend`, normalmente como `/srv/pokebedrock/wiki`, y definen
   `POKEBEDROCK_WIKI_PATH` si la ruta por defecto (`../wiki`) cambia.
2. Los handlers llaman a `getWikiDoc()`/`getWikiNav()` para leer archivos
   Markdown/MDX directamente, compilarlos con `compileMDX` y servir el árbol
   de React resultante.
3. Las solicitudes en español (`es`) caen al contenido en inglés cuando falta
   una traducción, igual que `resolveDocPath()`.
4. `cache()` de React memoriza la navegación y los slugs por proceso. Reiniciar
   la app invalida esa caché.

Al servirse desde disco, los cambios entran en producción tan pronto como los
servidores hacen `git pull` del wiki y se reinicia Next.js. Ya no existe Redis
ni HMACs.

## Cómo actualizar contenido en producción

1. Conéctate al host del sitio y actualiza el checkout del wiki:

   ```bash
   cd /srv/pokebedrock/wiki
   git fetch origin
   git reset --hard origin/main
   ```

2. Reinicia el frontend para limpiar las cachés en proceso (`systemctl restart
   website-frontend`, despliegue rolling, etc.).
3. Ejecuta el workflow de search index del wiki si necesitas que Meilisearch
   tenga el nuevo contenido (`docs/en/reference/search-indexing.md`).

## Variables de entorno

| Variable | Descripción |
| --- | --- |
| `POKEBEDROCK_WIKI_PATH` | Ruta absoluta opcional al checkout del wiki. Por defecto `../wiki` relativo al frontend. |
| `WIKI_EDIT_BASE_URL` | URL opcional para los enlaces de "Editar esta página". Por defecto `https://github.com/pokebedrock/wiki/blob/main`. |

Deja `POKEBEDROCK_WIKI_PATH` sin definir cuando el wiki vive como carpeta
hermana. Defínela cuando el repo esté en otra ubicación (por ejemplo dentro de
una imagen única).

## Comportamiento de caché

- `getWikiNav()` y `getAllDocSlugs()` usan `cache()` de React para evitar leer
  el sistema de archivos más de una vez por arranque.
- `getWikiDoc()` lee el Markdown en cada solicitud; no existe capa Redis.
- Reiniciar la app (deploy rolling, `pm2/systemd`, etc.) es la forma soportada de
  limpiar la caché de navegación.

## Búsqueda y sincronización

El backend ahora sólo expone endpoints de búsqueda. Para refrescar la búsqueda:

1. Corre `npm run build:search` (o `npm run check:generated`) y confirma que los
   artefactos se actualizan.
2. Haz push a `main` y deja que `.github/workflows/search-index.yml` cargue
   `build/search-indices.json`.
3. Cuando `WIKI_SEARCH_SYNC_URL`/`WIKI_SEARCH_SYNC_TOKEN` están configurados en
   el backend, el workflow hace `POST` a `/internal/wiki/search-index` para que
   el backend reinyecte los índices dentro del clúster.


