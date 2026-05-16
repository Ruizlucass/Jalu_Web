import Navbar from "../components/Navbar.jsx";
import Hero from "../components/Hero.jsx";
import { Combos, MenuPreview, QuickAccess } from "../components/Cards.jsx";
import { ArabicFree, Club, FinalCta, OrdersAndReservations } from "../components/Opciones.jsx";
import Sucursales from "../components/Sucursales.jsx";
import Comentarios from "../components/Comentarios.jsx";
import Footer from "../components/Footer.jsx";
import WspFlotante from "../components/WspFlotante.jsx";

export default function Home() {
  return (
    <main className="app">
      <Navbar />
      <Hero />
      <QuickAccess />
      <ArabicFree />
      <MenuPreview />
      <Combos />
      <Sucursales />
      <Comentarios />
      <OrdersAndReservations />
      <FinalCta />
      <Footer />
      <WspFlotante />
    </main>
  );
}
