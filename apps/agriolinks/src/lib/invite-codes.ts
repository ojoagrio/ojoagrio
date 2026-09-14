import { eq, and, isNull, or, lt, sql, gt } from 'drizzle-orm';
import { getDb } from '@/db';
import { inviteCodes } from '@/db/schema';

/**
 * Atomically claims one use of a code. Works for both single-use invites
 * (maxUses = 1, e.g. handed to one friend) and multi-use campaign codes
 * (maxUses = null, shared publicly in ads) — either way the increment is
 * conditioned on the row still having uses left, so concurrent signups can
 * never push usesCount past maxUses. Returns the trial length to grant, or
 * null if the code doesn't exist or is exhausted.
 */
export async function claimInviteCode(code: string): Promise<{ trialDays: number; maxProducts: number } | null> {
  const result = await getDb()
    .update(inviteCodes)
    .set({ usesCount: sql`${inviteCodes.usesCount} + 1` })
    .where(
      and(
        eq(inviteCodes.code, code),
        or(isNull(inviteCodes.maxUses), lt(inviteCodes.usesCount, inviteCodes.maxUses))
      )
    )
    .returning({ trialDays: inviteCodes.trialDays, maxProducts: inviteCodes.maxProducts });

  return result[0] ?? null;
}

/**
 * Reverses a successful claimInviteCode when the signup that used it fails
 * partway through (so the account never actually gets created), otherwise a
 * single-use code would be burned for nothing.
 */
export async function releaseInviteCode(code: string): Promise<void> {
  await getDb()
    .update(inviteCodes)
    .set({ usesCount: sql`${inviteCodes.usesCount} - 1` })
    .where(and(eq(inviteCodes.code, code), gt(inviteCodes.usesCount, 0)));
}
