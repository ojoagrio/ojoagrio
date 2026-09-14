// TODO(paso 5 del plan): reemplazar por el formulario real con NextAuth
// Credentials + validación de código de invitación contra la tabla
// `invite_codes`. Este placeholder solo valida la ruta y el diseño.
export default function SignupPage() {
  return (
    <main className="wrap">
      <h1 className="title display">Crear cuenta</h1>
      <p className="bio">
        Necesitás un código de invitación para registrarte — por ahora AgrioLinks se prueba a
        puertas cerradas con un puñado de artistas.
      </p>
      <form className="links">
        <input className="link-btn" name="code" placeholder="Código de invitación" required />
        <input className="link-btn" name="email" type="email" placeholder="Email" required />
        <input className="link-btn" name="password" type="password" placeholder="Contraseña" required />
        <button className="link-btn" type="submit">
          Crear cuenta
        </button>
      </form>
    </main>
  );
}
