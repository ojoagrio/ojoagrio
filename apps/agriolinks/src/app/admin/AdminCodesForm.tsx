'use client';

import { useActionState, useRef, useEffect } from 'react';
import { createInviteCode, type CreateCodeState } from './actions';

const initialState: CreateCodeState = {};

export function AdminCodesForm() {
  const [state, formAction, pending] = useActionState(createInviteCode, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.created) formRef.current?.reset();
  }, [state.created]);

  return (
    <form className="dash-card" action={formAction} ref={formRef}>
      <h2 className="dash-section-title">Crear código de invitación</h2>

      <div className="dash-field">
        <label className="dash-label" htmlFor="code">
          Código
        </label>
        <input className="dash-input" id="code" name="code" placeholder="AMIGX2026" required />
      </div>

      <div className="dash-field">
        <label className="dash-label" htmlFor="maxUses">
          Máximo de usos (vacío = ilimitado, para un código de campaña)
        </label>
        <input className="dash-input" id="maxUses" name="maxUses" type="number" min={1} placeholder="1" />
      </div>

      <div className="dash-field">
        <label className="dash-label" htmlFor="trialDays">
          Días de prueba gratis
        </label>
        <input className="dash-input" id="trialDays" name="trialDays" type="number" min={1} defaultValue={30} />
      </div>

      <div className="dash-field">
        <label className="dash-label" htmlFor="maxProducts">
          Máximo de productos en la tienda
        </label>
        <input className="dash-input" id="maxProducts" name="maxProducts" type="number" min={0} defaultValue={6} />
      </div>

      <div className="dash-field">
        <label className="dash-label" htmlFor="note">
          Nota (para vos, no la ve el artista)
        </label>
        <input className="dash-input" id="note" name="note" placeholder="Ej: para tal amigo" />
      </div>

      {state.error && <p className="dash-message error">{state.error}</p>}
      {state.created && <p className="dash-message success">Código {state.created} creado ✅</p>}

      <div className="dash-actions">
        <button className="dash-btn-primary" type="submit" disabled={pending}>
          {pending ? 'Creando…' : 'Crear código'}
        </button>
      </div>
    </form>
  );
}
