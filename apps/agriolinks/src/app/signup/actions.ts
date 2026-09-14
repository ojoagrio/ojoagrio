'use server';

import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { users, artists } from '@/db/schema';
import { claimInviteCode } from '@/lib/invite-codes';
import { signIn } from '@/auth';

export interface SignupState {
  error?: string;
}

function slugFromEmail(email: string) {
  return email
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'artista';
}

async function uniqueSlug(base: string) {
  const db = getDb();
  let slug = base;
  let n = 1;
  // Small tables, small n — a loop is fine for Fase 0 volumes.
  while ((await db.select({ slug: artists.slug }).from(artists).where(eq(artists.slug, slug)).limit(1)).length) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

export async function signup(_prevState: SignupState, formData: FormData): Promise<SignupState> {
  const code = String(formData.get('code') ?? '').trim();
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!code || !email || !password) {
    return { error: 'Completá el código, el email y la contraseña.' };
  }
  if (password.length < 8) {
    return { error: 'La contraseña tiene que tener al menos 8 caracteres.' };
  }

  const db = getDb();

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length) {
    return { error: 'Ya existe una cuenta con ese email.' };
  }

  const claimed = await claimInviteCode(code);
  if (!claimed) {
    return { error: 'Ese código de invitación no es válido o ya fue usado.' };
  }

  const userId = crypto.randomUUID();
  const passwordHash = await hash(password, 10);
  const slug = await uniqueSlug(slugFromEmail(email));
  const trialEndsAt = new Date(Date.now() + claimed.trialDays * 24 * 60 * 60 * 1000);

  await db.insert(users).values({ id: userId, email, passwordHash });
  await db.insert(artists).values({
    id: crypto.randomUUID(),
    userId,
    slug,
    displayName: slugFromEmail(email),
    bio: '',
    links: [],
    backgroundEffect: 'liquid',
    trialEndsAt,
  });

  await signIn('credentials', { email, password, redirectTo: '/dashboard' });
  return {};
}
