// TODO(paso 6 del plan): proteger esta ruta con la sesión de NextAuth y
// cargar/guardar la fila real de `artists` del usuario logueado.
export default function DashboardPage() {
  return (
    <main className="wrap">
      <h1 className="title display">Tu página</h1>
      <p className="bio">Acá vas a poder editar tu bio, tus links y elegir tu fondo animado.</p>
      <form className="links">
        <input className="link-btn" name="bio" placeholder="Bio" />
        <button className="link-btn" type="submit">
          Guardar
        </button>
      </form>
    </main>
  );
}
