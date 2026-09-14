# Pendientes de AgrioLinks

Puntos identificados en el análisis de implementación que quedaron fuera del alcance porque necesitan infraestructura nueva o una decisión de negocio, no un simple fix de código.

## 1. Recuperación de contraseña

Hoy no hay forma de resetear una contraseña olvidada salvo editando la base de datos a mano. Requiere un servicio de envío de emails (ej. Resend) que todavía no está provisionado en el proyecto.

## 2. Rate limiting en login / signup / canje de códigos

No hay ningún límite de intentos — deja la puerta abierta a fuerza bruta de contraseñas o a probar muchos códigos de invitación seguidos. Se resuelve con Upstash Redis vía Vercel Marketplace (integración nueva a provisionar).

## 3. Límite o fecha de corte para el código `AGRIOFREE`

Es de uso ilimitado para siempre (`maxUses: null`). El panel de admin (`/admin`) ya permite crear códigos nuevos con límite de usos o desactivar el actual, pero decidir el número de usos o la fecha de corte de la campaña sigue siendo una decisión de negocio pendiente.

## 4. Analítica en la landing (`/agriolinks`)

No hay forma de medir cuánta gente entra, cuántos clickean el CTA o completan el signup — importante antes de invertir en campañas pagas. Se resolvería sumando Vercel Analytics u otra integración, a pedido explícito.
