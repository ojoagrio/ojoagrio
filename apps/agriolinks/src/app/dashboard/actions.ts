'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/db';
import { artists } from '@/db/schema';
import { auth, signOut } from '@/auth';
import type { ArtistLink } from '@/lib/types';
import type { SocialType } from '@ojoagrio/ui';

export interface SaveProfileState {
  error?: string;
  saved?: boolean;
}

const SOCIAL_TYPES: SocialType[] = ['instagram', 'tiktok', 'spotify', 'youtube'];
const BACKGROUND_EFFECTS = ['liquid', 'fog', 'cells', 'net', 'halo', 'globe'];

export async function saveProfile(_prevState: SaveProfileState, formData: FormData): Promise<SaveProfileState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Tenés que iniciar sesión de nuevo.' };
  }

  const displayName = String(formData.get('displayName') ?? '').trim();
  const bio = String(formData.get('bio') ?? '').trim();
  const backgroundEffect = String(formData.get('backgroundEffect') ?? 'liquid');

  if (!displayName) {
    return { error: 'El nombre no puede estar vacío.' };
  }
  if (!BACKGROUND_EFFECTS.includes(backgroundEffect)) {
    return { error: 'Fondo inválido.' };
  }

  const links: ArtistLink[] = [];
  for (const type of SOCIAL_TYPES) {
    const href = String(formData.get(`link_${type}_href`) ?? '').trim();
    if (!href) continue;
    const label = String(formData.get(`link_${type}_label`) ?? type);
    const sub = String(formData.get(`link_${type}_sub`) ?? '');
    links.push({ type, href, label, sub });
  }

  await getDb()
    .update(artists)
    .set({ displayName, bio, backgroundEffect, links })
    .where(eq(artists.userId, session.user.id));

  revalidatePath('/agriolinks/dashboard');
  return { saved: true };
}

export async function logout() {
  await signOut({ redirectTo: '/agriolinks' });
}
