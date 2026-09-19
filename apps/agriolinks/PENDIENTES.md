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

## 5. Analytics de admin: lo que depende de terceros o de un modelo de pagos

`/admin/analytics` ya cubre lo que se puede medir con datos propios (estados, embudo de activación, registros por semana, por vencer, tendencia diaria de 30 días, rendimiento por canal). Queda fuera:

- **Embudo de la landing** (visitas → clic en CTA → signup): mismo requisito que el punto 4 — necesita Vercel Analytics u otro servicio.
- **Conversión trial → pago y MRR**: hoy no existe un estado de "pagó" (un artista que pagó y uno al que se le regaló un cupón son indistinguibles). Conviene definir `paidUntil` (o similar) junto con el cobro real.
- **Filtrar bots en el conteo de visitas** (crawlers, previews de WhatsApp al compartir el link): decisión abierta; hoy toda request a la página suma una visita.
- Los datos diarios y la atribución por canal cuentan **desde el deploy** — los registros anteriores figuran como «Sin dato».
