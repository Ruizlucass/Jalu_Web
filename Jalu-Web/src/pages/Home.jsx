import Navbar from "../components/Navbar.jsx";
import Hero from "../components/Hero.jsx";
import ClubJaluHome from "../components/ClubJaluHome.jsx";
import { Combos, QuickAccess } from "../components/Cards.jsx";
import {
  ArabicFree,
  Club,
  FinalCta,
} from "../components/Opciones.jsx";
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

      <Combos />

      <Club />

      <Sucursales />

      <Comentarios />

      <FinalCta />

      <Footer />

      <WspFlotante />
    </main>
  );
}