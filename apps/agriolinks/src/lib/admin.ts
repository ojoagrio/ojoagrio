// Single-admin allowlist for Fase 0 — no admin roles table yet, just the
// account operating AgrioLinks itself.
const ADMIN_EMAILS = ['ojoagrio@gmail.com'];

export function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}
