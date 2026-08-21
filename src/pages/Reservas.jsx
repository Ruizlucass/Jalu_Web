import Navbar from "../components/Navbar.jsx";
import { OrdersAndReservations } from "../components/Opciones.jsx";
import Footer from "../components/Footer.jsx";
import WspFlotante from "../components/WspFlotante.jsx";

export default function Reservas() {
  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <Navbar />

      <section className="relative flex min-h-[62vh] items-center justify-center overflow-hidden px-6 pt-24 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[#e71921]/12 via-transparent to-[#080808]" />

        <div className="relative z-10 mx-auto max-w-4xl">
          <span className="mb-5 inline-block text-sm font-black uppercase tracking-[0.35em] text-[#e71921]">
            Pedidos y reservas
          </span>

          <h1 className="text-5xl font-black uppercase leading-none sm:text-6xl md:text-8xl">
            Elegis como vivir Jalu
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base font-bold leading-7 text-gray-300 sm:text-lg">
          Pedidos por WhatsApp o apps, y reservas simples para venir con tu mesa lista.
        </p>
        </div>
      </section>

      <OrdersAndReservations />
      <Footer />
      <WspFlotante />
    </main>
  );
}
