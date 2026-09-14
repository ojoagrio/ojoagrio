'use client';

import { useActionState } from 'react';
import { signup, type SignupState } from './actions';

const initialState: SignupState = {};

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signup, initialState);

  return (
    <main className="wrap">
      <h1 className="title display">Crear cuenta</h1>
      <p className="bio">
        Necesitás un código de invitación para registrarte — por ahora AgrioLinks se prueba a
        puertas cerradas con un puñado de artistas.
      </p>
      <form className="links" action={formAction}>
        <input className="link-btn" name="code" placeholder="Código de invitación" required />
        <input className="link-btn" name="email" type="email" placeholder="Email" required />
        <input
          className="link-btn"
          name="password"
          type="password"
          placeholder="Contraseña (mínimo 8 caracteres)"
          minLength={8}
          required
        />
        {state.error && <p className="bio">{state.error}</p>}
        <button className="link-btn" type="submit" disabled={pending}>
          {pending ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>
    </main>
  );
}
