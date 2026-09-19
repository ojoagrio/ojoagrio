'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/db';
import { artists } from '@/db/schema';
import { auth, signOut } from '@/auth';
import { isSuspended } from '@/lib/artists';
import { parseLinks } from '@/lib/links';
import { isValidBlobUrl } from '@/lib/validators';

export interface SaveProfileState {
  error?: string;
  /** Per-field messages, keyed by field name (e.g. "displayName", "link_instagram") — shown next to the field instead of a single generic message. */
  fieldErrors?: Record<string, string>;
  saved?: boolean;
}

const BACKGROUND_EFFECTS = ['liquid', 'fog', 'cells', 'net', 'halo', 'globe'];

export async function saveProfile(_prevState: SaveProfileState, formData: FormData): Promise<SaveProfileState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Tenés que iniciar sesión de nuevo.' };
  }

  const [current] = await getDb()
    .select({ trialEndsAt: artists.trialEndsAt, isBlocked: artists.isBlocked })
    .from(artists)
    .where(eq(artists.userId, session.user.id))
    .limit(1);
  if (current && isSuspended(current)) {
    return { error: 'Tu cuenta no puede editarse ahora — renová tu plan o contactá soporte.' };
  }

  const displayName = String(formData.get('displayName') ?? '').trim();
  const bio = String(formData.get('bio') ?? '').trim();
  const backgroundEffect = String(formData.get('backgroundEffect') ?? 'liquid');
  const avatarUrl = String(formData.get('avatarUrl') ?? '').trim() || null;

  const fieldErrors: Record<string, string> = {};

  if (!displayName) {
    fieldErrors.displayName = 'El nombre no puede estar vacío.';
  }
  if (!BACKGROUND_EFFECTS.includes(backgroundEffect)) {
    fieldErrors.backgroundEffect = 'Fondo inválido.';
  }
  if (avatarUrl && !isValidBlobUrl(avatarUrl)) {
    fieldErrors.avatarUrl = 'Foto de perfil inválida.';
  }

  const { links, fieldErrors: linkErrors } = parseLinks(formData);
  Object.assign(fieldErrors, linkErrors);

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  await getDb()
    .update(artists)
    .set({ displayName, bio, backgroundEffect, avatarUrl, links })
    .where(eq(artists.userId, session.user.id));

  revalidatePath('/dashboard');
  return { saved: true };
}

export async function logout() {
  // signOut()'s redirectTo is not basePath-aware — needs /agriolinks written
  // out or it 404s on ojoagrio.com/ instead of landing on the AgrioLinks home.
  await signOut({ redirectTo: '/agriolinks' });
}
