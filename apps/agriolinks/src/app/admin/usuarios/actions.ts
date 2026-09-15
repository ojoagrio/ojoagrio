'use server';

import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/db';
import { artists } from '@/db/schema';
import { auth } from '@/auth';
import { isAdminEmail } from '@/lib/admin';
import { claimInviteCode, releaseInviteCode } from '@/lib/invite-codes';

async function requireAdmin() {
  const session = await auth();
  if (!isAdminEmail(session?.user?.email)) {
    throw new Error('No autorizado');
  }
}

export async function toggleBlocked(formData: FormData) {
  await requireAdmin();

  const slug = String(formData.get('slug') ?? '');
  const blocked = formData.get('blocked') === 'true';
  if (!slug) return;

  await getDb().update(artists).set({ isBlocked: blocked }).where(eq(artists.slug, slug));
  revalidatePath('/admin/usuarios');
}

export async function redeemCodeForArtist(formData: FormData) {
  await requireAdmin();

  const slug = String(formData.get('slug') ?? '').trim();
  const code = String(formData.get('code') ?? '')
    .trim()
    .toUpperCase();
  if (!slug || !code) {
    redirect(`/admin/usuarios?error=${encodeURIComponent('Completá el código.')}`);
  }

  const claimed = await claimInviteCode(code);
  if (!claimed) {
    redirect(`/admin/usuarios?error=${encodeURIComponent('Ese código no es válido o ya fue usado.')}`);
  }

  const [artist] = await getDb().select().from(artists).where(eq(artists.slug, slug)).limit(1);
  if (!artist) {
    await releaseInviteCode(code);
    redirect(`/admin/usuarios?error=${encodeURIComponent('No se encontró ese artista.')}`);
  }

  // Top up rather than overwrite: stack the extra days on top of whatever's
  // left (or start from now if the trial had already run out), and never
  // shrink an existing higher product cap.
  const base = artist.trialEndsAt && artist.trialEndsAt.getTime() > Date.now() ? artist.trialEndsAt.getTime() : Date.now();
  const newTrialEndsAt = new Date(base + claimed.trialDays * 24 * 60 * 60 * 1000);
  const newMaxProducts = Math.max(artist.maxProducts, claimed.maxProducts);

  await getDb()
    .update(artists)
    .set({ trialEndsAt: newTrialEndsAt, maxProducts: newMaxProducts, isBlocked: false })
    .where(eq(artists.slug, slug));

  revalidatePath('/admin/usuarios');
  redirect('/admin/usuarios?ok=1');
}
