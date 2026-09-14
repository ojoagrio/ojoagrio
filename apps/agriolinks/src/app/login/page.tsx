'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { login, type LoginState } from './actions';

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <main className="wrap">
      <h1 className="title display">Iniciar sesión</h1>
      <form className="links" action={formAction}>
        <input className="link-btn" name="email" type="email" placeholder="Email" required />
        <input className="link-btn" name="password" type="password" placeholder="Contraseña" required />
        {state.error && <p className="bio">{state.error}</p>}
        <button className="link-btn" type="submit" disabled={pending}>
          {pending ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
      <p className="bio">
        ¿Todavía no tenés cuenta? <Link href="/signup">Creala acá</Link>
      </p>
      <Link className="section-label" href="/">
        ← Volver al inicio
      </Link>
    </main>
  );
}
