import Footer from "../components/Footer.jsx";
import Navbar from "../components/Navbar.jsx";
import WspFlotante from "../components/WspFlotante.jsx";
import { branches } from "../utils/siteData.js";

export default function SobreNosotros() {
  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <Navbar />

      <section className="px-4 pb-12 pt-28 min-[960px]:px-[52px] min-[960px]:pt-32">
        <div className="mx-auto grid max-w-6xl gap-10 min-[960px]:grid-cols-[1.05fr_0.95fr] min-[960px]:items-end">
          <div>
            <span className="mb-4 inline-flex w-fit rounded bg-[#e71921] px-3 py-2 text-xs font-black uppercase">
              Sobre nosotros
            </span>
            <h1 className="max-w-4xl text-5xl font-black uppercase leading-none min-[720px]:text-7xl">
              Sabor arabe con identidad tucumana
            </h1>
          </div>

          <p className="max-w-xl text-base font-bold leading-7 text-[#b9b9b9] min-[960px]:justify-self-end">
            Jalu nacio como una cocina familiar dedicada a compartir recetas arabes
            simples, abundantes y llenas de caracter. Hoy seguimos preparando cada
            plato con la misma idea: comida honesta, buen producto y un servicio
            cercano para comer en el local, pedir delivery o reunirse con amigos.
          </p>
        </div>
      </section>

      <section className="px-4 py-10 min-[960px]:px-[52px]">
        <div className="mx-auto grid max-w-6xl gap-5 min-[760px]:grid-cols-3">
          <article className="rounded-lg border border-white/10 bg-[#151515] p-6">
            <span className="text-3xl font-black text-[#e71921]">01</span>
            <h2 className="mt-4 text-xl font-black uppercase">Nuestra cocina</h2>
            <p className="mt-3 font-bold leading-6 text-[#b9b9b9]">
              Trabajamos con masas frescas, especias seleccionadas y preparaciones
              que buscan mantener el sabor tradicional con una mirada urbana.
            </p>
          </article>

          <article className="rounded-lg border border-white/10 bg-[#151515] p-6">
            <span className="text-3xl font-black text-[#e71921]">02</span>
            <h2 className="mt-4 text-xl font-black uppercase">Nuestra gente</h2>
            <p className="mt-3 font-bold leading-6 text-[#b9b9b9]">
              Cada sucursal esta pensada para atender rapido, cuidar los detalles y
              hacer que la experiencia sea calida desde el primer pedido.
            </p>
          </article>

          <article className="rounded-lg border border-white/10 bg-[#151515] p-6">
            <span className="text-3xl font-black text-[#e71921]">03</span>
            <h2 className="mt-4 text-xl font-black uppercase">Nuestra ciudad</h2>
            <p className="mt-3 font-bold leading-6 text-[#b9b9b9]">
              Crecimos en Tucuman y queremos estar cerca de cada barrio con locales
              practicos, buen horario y platos que se disfrutan todos los dias.
            </p>
          </article>
        </div>
      </section>

      <section className="px-4 py-12 min-[960px]:px-[52px]">
        <div className="mx-auto max-w-6xl">
          <div className="mb-7 flex flex-col gap-4 min-[760px]:flex-row min-[760px]:items-end min-[760px]:justify-between">
            <div>
              <span className="inline-flex w-fit rounded bg-[#e71921] px-3 py-2 text-xs font-black uppercase">
                Sucursales
              </span>
              <h2 className="mt-4 text-4xl font-black uppercase leading-none min-[720px]:text-6xl">
                Donde encontrarnos
              </h2>
            </div>
            <p className="max-w-md font-bold leading-6 text-[#b9b9b9]">
              Estos datos son de prueba para que la pagina no quede vacia. Despues
              podes reemplazar direcciones, horarios y enlaces reales.
            </p>
          </div>

          <div className="grid gap-4 min-[640px]:grid-cols-2 min-[960px]:grid-cols-3">
            {branches.slice(0, 6).map((branch) => (
              <article key={branch.name} className="grid gap-4 rounded-lg border border-white/10 bg-[#151515] p-5">
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
