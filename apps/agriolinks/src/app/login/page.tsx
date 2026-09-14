// TODO(paso 5 del plan): reemplazar por el login real con NextAuth Credentials.
export default function LoginPage() {
  return (
    <main className="wrap">
      <h1 className="title display">Iniciar sesión</h1>
      <form className="links">
        <input className="link-btn" name="email" type="email" placeholder="Email" required />
        <input className="link-btn" name="password" type="password" placeholder="Contraseña" required />
        <button className="link-btn" type="submit">
          Entrar
        </button>
      </form>
    </main>
  );
}
