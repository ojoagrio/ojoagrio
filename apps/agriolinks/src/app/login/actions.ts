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
    await signIn('credentials', { email, password, redirectTo: '/agriolinks/dashboard' });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: 'Email o contraseña incorrectos.' };
    }
    throw err;
  }

  return {};
}
