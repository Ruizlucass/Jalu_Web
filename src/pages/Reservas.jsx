import Navbar from "../components/Navbar.jsx";
import { OrdersAndReservations } from "../components/Opciones.jsx";
import Footer from "../components/Footer.jsx";
import WspFlotante from "../components/WspFlotante.jsx";

export default function Reservas() {
  return (
    <main className="app page-shell">
      <Navbar />
      <section className="section reservation-hero">
        <span className="eyebrow">Pedidos y reservas</span>
        <h1 className="section-title">Elegis como vivir Jalu</h1>
        <p className="section-note">
          Pedidos por WhatsApp o apps, y reservas simples para venir con tu mesa lista.
        </p>
      </section>
      <OrdersAndReservations />
      <Footer />
      <WspFlotante />
    </main>
  );
}
