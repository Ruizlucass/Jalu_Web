import Navbar from "../components/Navbar.jsx";
import { OrdersAndReservations } from "../components/Opciones.jsx";
import WspFlotante from "../components/WspFlotante.jsx";

export default function Reservas() {
  return (
    <main className="app page-shell">
      <Navbar />
      <OrdersAndReservations />
      <WspFlotante />
    </main>
  );
}
