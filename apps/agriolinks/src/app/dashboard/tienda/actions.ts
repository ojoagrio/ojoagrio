'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/db';
import { artists } from '@/db/schema';
import { auth } from '@/auth';
import { isTrialExpired } from '@/lib/artists';
import type { Product } from '@/lib/types';

export interface SaveTiendaState {
  error?: string;
  /** Per-field messages, keyed e.g. "whatsappNumber" or "product_2_price" — lets the UI point at exactly which product/field failed instead of one generic message. */
  fieldErrors?: Record<string, string>;
  saved?: boolean;
}

function isValidPhotoUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname.endsWith('.public.blob.vercel-storage.com');
  } catch {
    return false;
  }
}

export async function saveTienda(_prevState: SaveTiendaState, formData: FormData): Promise<SaveTiendaState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Tenés que iniciar sesión de nuevo.' };
  }

  const [current] = await getDb()
    .select({ trialEndsAt: artists.trialEndsAt, maxProducts: artists.maxProducts })
    .from(artists)
    .where(eq(artists.userId, session.user.id))
    .limit(1);
  if (!current) {
    return { error: 'No encontramos tu perfil.' };
  }
  if (isTrialExpired(current.trialEndsAt)) {
    return { error: 'Tu mes gratis terminó — renová tu plan para seguir editando.' };
  }

  const fieldErrors: Record<string, string> = {};

  const whatsappRaw = String(formData.get('whatsappNumber') ?? '').trim();
  const whatsappDigits = whatsappRaw.replace(/\D/g, '');
  if (whatsappRaw && (whatsappDigits.length < 10 || whatsappDigits.length > 15)) {
    fieldErrors.whatsappNumber = 'Tiene que tener entre 10 y 15 dígitos, con código de país.';
  }

  const productCount = Number(formData.get('productCount') ?? 0);
  if (!Number.isInteger(productCount) || productCount < 0) {
    return { error: 'No pudimos leer tus productos. Intentá de nuevo.' };
  }
  if (productCount > current.maxProducts) {
    return { error: `Tu plan permite hasta ${current.maxProducts} productos.` };
  }

  // Validate every product before bailing, so the UI can point at every
  // failing product/field at once instead of just the first one found.
  const products: Product[] = [];
  for (let i = 0; i < productCount; i++) {
    const id = String(formData.get(`product_${i}_id`) ?? '').trim() || crypto.randomUUID();
    const name = String(formData.get(`product_${i}_name`) ?? '').trim();
    const priceRaw = String(formData.get(`product_${i}_price`) ?? '').trim();
    const availableRaw = String(formData.get(`product_${i}_available`) ?? '').trim();
    const description = String(formData.get(`product_${i}_description`) ?? '').trim();
    const photosRaw = String(formData.get(`product_${i}_photos`) ?? '[]');

    if (!name) {
      fieldErrors[`product_${i}_name`] = 'El producto necesita un nombre.';
    }

    const price = Number(priceRaw);
    if (!Number.isInteger(price) || price < 0) {
      fieldErrors[`product_${i}_price`] = 'Tiene que ser un número entero mayor o igual a 0.';
    }

    const available = Number(availableRaw);
    if (!Number.isInteger(available) || available < 0) {
      fieldErrors[`product_${i}_available`] = 'Tiene que ser un número entero mayor o igual a 0.';
    }

    let photos: unknown;
    try {
      photos = JSON.parse(photosRaw);
    } catch {
      photos = [];
    }
    if (!Array.isArray(photos) || !photos.every((p) => typeof p === 'string' && isValidPhotoUrl(p))) {
      fieldErrors[`product_${i}_photos`] = 'Las fotos no son válidas.';
      photos = [];
    }

    products.push({ id, name, price, available, description, photos: (photos as string[]).slice(0, 3) });
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  await getDb()
    .update(artists)
    .set({ whatsappNumber: whatsappDigits || null, products })
    .where(eq(artists.userId, session.user.id));

  revalidatePath('/dashboard/tienda');
  return { saved: true };
}
