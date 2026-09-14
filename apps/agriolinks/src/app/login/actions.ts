'use server';

import { AuthError } from 'next-auth';
import { signIn } from '@/auth';

export interface LoginState {
  error?: string;
}

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { error: 'Completá el email y la contraseña.' };
  }

  try {
    // signIn()'s redirectTo is not basePath-aware like redirect()/next/link —
    // needs /agriolinks written out or it 404s on ojoagrio.com/dashboard.
    await signIn('credentials', { email, password, redirectTo: '/agriolinks/dashboard' });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: 'Email o contraseña incorrectos.' };
    }
    throw err;
  }

  return {};
}
