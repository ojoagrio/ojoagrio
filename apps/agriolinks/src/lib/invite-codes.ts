import { eq, and } from 'drizzle-orm';
import { getDb } from '@/db';
import { inviteCodes } from '@/db/schema';

/**
 * Atomically claims an unused invite code for `usedBy` (an email, before the
 * user row exists). Returns true if this call is the one that claimed it —
 * false if the code doesn't exist or was already used, so callers never
 * double-spend a code under concurrent signups.
 */
export async function claimInviteCode(code: string, usedBy: string): Promise<boolean> {
  const result = await getDb()
    .update(inviteCodes)
    .set({ status: 'used', usedBy, usedAt: new Date() })
    .where(and(eq(inviteCodes.code, code), eq(inviteCodes.status, 'unused')))
    .returning({ code: inviteCodes.code });

  return result.length > 0;
}
