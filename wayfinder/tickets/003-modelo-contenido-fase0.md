---
id: 003
title: Definir cómo se modela el contenido de cada artista en Fase 0
type: grilling
mode: HITL
status: open
assignee: null
blocked_by: []
---

## Question

Sin dashboard ni base de datos todavía, ¿cómo se representa la página de cada artista (bio, links, fondo elegido)? Por ejemplo: un archivo por artista (JSON o front-matter de un `.astro`/`.md`) leído por una ruta dinámica `[usuario].astro`, versionado a mano en el repo.

Esto fija el "molde" que después migraría al dashboard cuando exista, así que conviene que sea simple pero no descartable.
