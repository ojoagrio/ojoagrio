import { eq, sql } from 'drizzle-orm';
import { getDb } from '@/db';
import { artists } from '@/db/schema';
import type { ArtistProfile, ArtistLink, Product } from './types';

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
    products: row.products as Product[],
    whatsappNumber: row.whatsappNumber,
    maxProducts: row.maxProducts,
    trialEndsAt: row.trialEndsAt,
  };
}

export interface OwnArtistProfile extends ArtistProfile {
  backgroundEffect: string;
  viewCount: number;
  buyClickCount: number;
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
    products: row.products as Product[],
    whatsappNumber: row.whatsappNumber,
    maxProducts: row.maxProducts,
    backgroundEffect: row.backgroundEffect,
    trialEndsAt: row.trialEndsAt,
    viewCount: row.viewCount,
    buyClickCount: row.buyClickCount,
  };
}

/** True once trialEndsAt has passed. An artist with no tracked trial (null) never expires. */
export function isTrialExpired(trialEndsAt: Date | null): boolean {
  return trialEndsAt !== null && trialEndsAt.getTime() < Date.now();
}

/** Own, no-third-party page-view counter — best-effort: a failure here should never break the page render. */
export async function incrementViewCount(slug: string): Promise<void> {
  try {
    await getDb()
      .update(artists)
      .set({ viewCount: sql`${artists.viewCount} + 1` })
      .where(eq(artists.slug, slug));
  } catch {
    // analytics is not worth failing a page render over
  }
}

/** Own, no-third-party "Comprar por WhatsApp" click counter. */
export async function incrementBuyClickCount(slug: string): Promise<void> {
  try {
    await getDb()
      .update(artists)
      .set({ buyClickCount: sql`${artists.buyClickCount} + 1` })
      .where(eq(artists.slug, slug));
  } catch {
    // analytics is not worth failing the request over
  }
}
