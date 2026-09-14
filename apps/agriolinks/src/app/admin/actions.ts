'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/db';
import { inviteCodes } from '@/db/schema';
import { auth } from '@/auth';
import { isAdminEmail } from '@/lib/admin';

export interface CreateCodeState {
  error?: string;
  created?: string;
}

/** Postgres unique_violation. */
function isUniqueViolation(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: string }).code === '23505';
}

export async function createInviteCode(_prevState: CreateCodeState, formData: FormData): Promise<CreateCodeState> {
  const session = await auth();
  if (!isAdminEmail(session?.user?.email)) {
    return { error: 'No autorizado.' };
  }

  const code = String(formData.get('code') ?? '')
    .trim()
    .toUpperCase();
  const maxUsesRaw = String(formData.get('maxUses') ?? '').trim();
  const trialDaysRaw = String(formData.get('trialDays') ?? '').trim();
  const note = String(formData.get('note') ?? '').trim() || null;

  if (!/^[A-Z0-9-]{3,32}$/.test(code)) {
    return { error: 'El código tiene que tener entre 3 y 32 caracteres: letras, números o guiones.' };
  }

  const trialDays = trialDaysRaw ? Number(trialDaysRaw) : 30;
  if (!Number.isInteger(trialDays) || trialDays <= 0) {
    return { error: 'Los días de prueba tienen que ser un número entero positivo.' };
  }

  let maxUses: number | null = 1;
  if (maxUsesRaw !== '') {
    const parsed = Number(maxUsesRaw);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return { error: 'El máximo de usos tiene que ser un número entero positivo, o vacío para ilimitado.' };
    }
    maxUses = parsed;
  } else {
    maxUses = null;
  }

  try {
    await getDb().insert(inviteCodes).values({ code, maxUses, trialDays, note });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { error: 'Ya existe un código con ese nombre.' };
    }
    throw err;
  }

  revalidatePath('/admin');
  return { created: code };
}
