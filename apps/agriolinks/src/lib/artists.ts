import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { artists } from '@/db/schema';
import type { ArtistProfile, ArtistLink } from './types';

export async function getArtistBySlug(slug: string): Promise<ArtistProfile | null> {
  const rows = await getDb().select().from(artists).where(eq(artists.slug, slug)).limit(1);
  const row = rows[0];
  if (!row) return null;

  return {
    slug: row.slug,
    displayName: row.displayName,
    bio: row.bio,
    avatarUrl: row.avatarUrl,
    links: row.links as ArtistLink[],
    trialEndsAt: row.trialEndsAt,
  };
}

export interface OwnArtistProfile extends ArtistProfile {
  backgroundEffect: string;
}

export async function getArtistByUserId(userId: string): Promise<OwnArtistProfile | null> {
  const rows = await getDb().select().from(artists).where(eq(artists.userId, userId)).limit(1);
  const row = rows[0];
  if (!row) return null;

  return {
    slug: row.slug,
    displayName: row.displayName,
    bio: row.bio,
    avatarUrl: row.avatarUrl,
    links: row.links as ArtistLink[],
    backgroundEffect: row.backgroundEffect,
    trialEndsAt: row.trialEndsAt,
  };
}

/** True once trialEndsAt has passed. An artist with no tracked trial (null) never expires. */
export function isTrialExpired(trialEndsAt: Date | null): boolean {
  return trialEndsAt !== null && trialEndsAt.getTime() < Date.now();
}
