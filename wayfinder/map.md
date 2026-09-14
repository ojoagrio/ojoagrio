---
type: wayfinder-map
label: wayfinder:map
status: open
---

# AgrioLinks — Fase 0

## Destination

Repo convertido en monorepo (`apps/ojoagrio` + `apps/agriolinks`) con AgrioLinks funcionando como producto self-service real: artistas se registran (cuenta/auth), tienen un dashboard para editar su página (bio, links, fondo) y su página pública queda online en `agriolinks.ojoagrio.com/u/usuario`. Sin cobro real todavía — el acceso se controla con códigos/cupones en vez de Stripe. Fase 0 termina cuando un amigo artista puede registrarse, editar su propia página desde el dashboard y tenerla publicada, sin que vos toques código por él.

## Notes

- Dominio: link-in-bio para artistas independientes, con fondos animados (Vanta.js) como diferencial frente a Linktree/Beacons.
- Producto: **AgrioLinks**. Precio objetivo (fuera del alcance de esta fase): $250 MXN/mes.
- Skill a consultar al resolver tickets: `domain-modeling` (terminología del dominio "artista / página / fondo / plan").
- Sub-skills `grilling`, `prototype`, `research` del paquete wayfinder no están instalados en este repo — los tickets tipo grilling se resuelven como conversación directa hasta que se instalen (`/setup-matt-pocock-skills`).
- Tracker: local en markdown (esta carpeta), por decisión explícita — sin issue tracker externo por ahora.

## Decisions so far

- [Definir producto, precio y estructura de URLs](../../.. "resuelto en sesión previa, sin ticket formal"): AgrioLinks, $250 MXN/mes, `agriolinks.ojoagrio.com/u/usuario`, monorepo Astro SSR (público) + Next.js/next-forge (dashboard, fase futura), validar primero a mano con 2-3 amigos artistas.

## Not yet specified

- Cómo se ve el dashboard de self-service (auth, edición de fondos, cobros) — llega recién después de validar Fase 0 con amigos.
- Personalización de fondos por artista vía UI (hoy el switcher es global, no por usuario).
- Subdominios propios por artista (`usuario.agriolinks.com`) como upgrade premium.
- Cómo se migra el contenido manual de Fase 0 (JSON/archivos) a lo que use el dashboard cuando exista.

## Out of scope

- Cobro real con Stripe (suscripciones, checkout, facturación): queda para después de validar el producto. Fase 0 controla acceso con códigos/cupones, no con pagos.
- Subdominios propios por artista (`usuario.agriolinks.com`) y personalización de fondo por artista vía UI avanzada: quedan para después de esta Fase 0.
