import Footer from "../components/Footer.jsx";
import Navbar from "../components/Navbar.jsx";
import WspFlotante from "../components/WspFlotante.jsx";
import { branches } from "../utils/siteData.js";

export default function SobreNosotros() {
  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <Navbar />

      <section className="relative flex min-h-[62vh] items-center justify-center overflow-hidden px-6 pt-24 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[#e71921]/12 via-transparent to-[#080808]" />

        <div className="relative z-10 mx-auto max-w-4xl">
          <span className="mb-5 inline-block text-sm font-black uppercase tracking-[0.35em] text-[#e71921]">
            Sobre nosotros
          </span>

          <h1 className="text-5xl font-black uppercase leading-none sm:text-6xl md:text-8xl">
            Sabor arabe con identidad tucumana
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base font-bold leading-7 text-gray-300 sm:text-lg">
            Jalu nacio como una cocina familiar dedicada a compartir recetas arabes
            simples, abundantes y llenas de caracter. Hoy seguimos preparando cada
            plato con la misma idea: comida honesta, buen producto y un servicio
            cercano para comer en el local, pedir delivery o reunirse con amigos.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <span className="text-sm font-black uppercase tracking-[0.3em] text-[#e71921]">
            Nuestra esencia
          </span>

          <h2 className="mt-3 text-4xl font-black uppercase md:text-5xl">
            Lo que nos mueve
          </h2>
        </div>

        <div className="grid gap-5 min-[760px]:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-[#121212] p-7 transition duration-300 hover:-translate-y-1 hover:border-[#e71921]/50">
            <span className="text-3xl font-black text-[#e71921]">01</span>
            <h2 className="mt-4 text-xl font-black uppercase">Nuestra cocina</h2>
            <p className="mt-3 font-bold leading-6 text-[#b9b9b9]">
              Trabajamos con masas frescas, especias seleccionadas y preparaciones
              que buscan mantener el sabor tradicional con una mirada urbana.
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#121212] p-7 transition duration-300 hover:-translate-y-1 hover:border-[#e71921]/50">
            <span className="text-3xl font-black text-[#e71921]">02</span>
            <h2 className="mt-4 text-xl font-black uppercase">Nuestra gente</h2>
            <p className="mt-3 font-bold leading-6 text-[#b9b9b9]">
              Cada sucursal esta pensada para atender rapido, cuidar los detalles y
              hacer que la experiencia sea calida desde el primer pedido.
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#121212] p-7 transition duration-300 hover:-translate-y-1 hover:border-[#e71921]/50">
            <span className="text-3xl font-black text-[#e71921]">03</span>
            <h2 className="mt-4 text-xl font-black uppercase">Nuestra ciudad</h2>
            <p className="mt-3 font-bold leading-6 text-[#b9b9b9]">
              Crecimos en Tucuman y queremos estar cerca de cada barrio con locales
              practicos, buen horario y platos que se disfrutan todos los dias.
            </p>
          </article>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#101010] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col gap-4 text-center min-[760px]:items-center">
            <div>
              <span className="text-sm font-black uppercase tracking-[0.3em] text-[#e71921]">
                Sucursales
              </span>
              <h2 className="mt-3 text-4xl font-black uppercase leading-none min-[720px]:text-6xl">
                Donde encontrarnos
              </h2>
            </div>
            <p className="mx-auto max-w-2xl font-bold leading-6 text-[#b9b9b9]">
              Estos datos son de prueba para que la pagina no quede vacia. Despues
              podes reemplazar direcciones, horarios y enlaces reales.
            </p>
          </div>

          <div className="grid gap-4 min-[640px]:grid-cols-2 min-[960px]:grid-cols-3">
            {branches.slice(0, 6).map((branch) => (
              <article key={branch.name} className="grid gap-4 rounded-2xl border border-white/10 bg-[#121212] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#e71921]/50">
                <span className="text-sm font-black uppercase text-[#e71921]">{branch.zone}</span>
                <h3 className="text-xl font-black uppercase">{branch.name}</h3>
                <p className="font-bold leading-6 text-[#b9b9b9]">
                  {branch.address}
                  <br />
                  Todos los dias de 12:00 a 00:00
                </p>
                <a
                  className="inline-flex min-h-10 items-center justify-center rounded-md border border-white/10 px-4 text-xs font-black uppercase transition duration-200 hover:-translate-y-px hover:border-white/25 hover:bg-white/10"
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Como llegar
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <WspFlotante />
    </main>
  );
}
