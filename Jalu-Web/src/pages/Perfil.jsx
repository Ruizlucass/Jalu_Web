import Navbar from "../components/Navbar.jsx";

export default function Perfil() {
  return (
    <main className="app page-shell">
      <Navbar />
      <section className="section page-panel">
        <span className="eyebrow">Mi perfil</span>
        <h1>Beneficios activos</h1>
        <p className="section-note">Acá se muestran puntos, promos, historial de pedidos y datos del usuario.</p>
      </section>
    </main>
  );
}
