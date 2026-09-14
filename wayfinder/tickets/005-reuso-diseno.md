---
id: 005
title: Decidir qué se reutiliza del diseño actual como paquete compartido
type: grilling
mode: HITL
status: open
assignee: null
blocked_by: []
---

## Question

Del diseño que ya existe en `apps/ojoagrio` (fondos Vanta.js, tipografías, paleta, animaciones `.reveal`), ¿qué se extrae a un paquete compartido (`packages/ui` o similar) para que `apps/agriolinks` lo reuse, y qué se deja duplicado a propósito porque va a divergir pronto (por ejemplo, el switcher de fondo va a terminar siendo por-artista, no global)?
