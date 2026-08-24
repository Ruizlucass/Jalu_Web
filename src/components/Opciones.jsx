import Button from "./Button.jsx";
import { branches, whatsappBase } from "../utils/siteData.js";
import { trackEvent } from "../helpers/tracking.js";

export function ArabicFree() {
  return (
    <section id="arabe-libre" className="arabic-free">
      <div
        className="arabic-free-media"
        aria-label="Mesa con comida árabe"
      />

      <div className="arabic-free-content featured-section-copy">
        <span className="eyebrow">
          La experiencia Jalu
        </span>

        <h2>¿Venís con hambre?</h2>

        <p>
          Descubrí Árabe Libre: una experiencia para sentarte,
          compartir y disfrutar nuestros sabores árabes.
        </p>

        <Button
          variant="dark"
          href="/arabe-libre"
          onClick={() => trackEvent("click_ver_arabe_libre")}
        >
          Ver Árabe Libre
        </Button>
      </div>
    </section>
  );
}

export function OrdersAndReservations() {
  return (
    <section className="section split-grid">
      <div id="pedidos" className="order-panel">
        <h2 className="panel-title">
          Pedidos
        </h2>

        <p>
          UX simple: elegís sucursal, elegís canal y salís a
          WhatsApp, PedidosYa o Rappi.
        </p>

        <div className="form-grid">
          <select
            className="field"
            defaultValue=""
          >
            <option value="" disabled>
              Elegir sucursal
            </option>

            {branches.map((branch) => (
              <option key={branch.name}>
                {branch.name}
              </option>
            ))}
          </select>

          <Button
            href={whatsappBase}
            onClick={() => trackEvent("click_pedido_whatsapp")}
          >
            Pedir por WhatsApp
          </Button>

          <Button
            variant="outline"
            href="#"
            onClick={() => trackEvent("click_pedido_apps")}
          >
            Ver apps
          </Button>
        </div>
      </div>

      <div
        id="reservas"
        className="reserve-panel"
      >
        <h2 className="panel-title">
          Reservas
        </h2>

        <p>
          Formulario corto y botón directo a WhatsApp para
          confirmar mesa.
        </p>

        <div className="form-grid">
          <input
            className="field"
            placeholder="Nombre"
          />

          <input
            className="field"
            placeholder="Teléfono"
          />

          <input
            className="field"
            placeholder="Cantidad de personas"
          />

          <input
            className="field"
            type="date"
          />

          <input
            className="field"
            type="time"
          />

          <Button
            href={whatsappBase}
            onClick={() => trackEvent("click_reserva_form")}
          >
            Reservar por WhatsApp
          </Button>
        </div>
      </div>
    </section>
  );
}

export function Club() {
  const beneficios = [
    {
      icono: "%",
      titulo: "Descuentos",
      texto: "Beneficios especiales para miembros",
    },
    {
      icono: "2X1",
      titulo: "Promociones",
      texto: "Promos seleccionadas durante el mes",
    },
    {
      icono: "★",
      titulo: "Exclusivos",
      texto: "Novedades y beneficios antes que nadie",
    },
  ];

  return (
    <section
      id="club"
      className="relative overflow-hidden bg-[#080808] px-4 py-16 sm:px-6 md:py-24"
    >
      <div className="pointer-events-none absolute -right-40 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-[#e71921]/10 blur-[130px]" />

      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[28px] border border-white/10 bg-[#111111]">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-14 xl:p-16">
            <div>
              <span className="inline-flex rounded-md bg-[#e71921] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-white sm:text-[11px]">
                Promos / Club Jalu
              </span>
            </div>

            <h2 className="mt-6 max-w-2xl text-4xl font-black uppercase leading-[0.95] text-white sm:text-5xl lg:text-6xl">
              Ser parte
              <span className="block text-[#e71921]">
                tiene beneficios
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-sm leading-6 text-gray-400 sm:text-lg sm:leading-7">
              Sumate al Club Jalu y accedé a descuentos,
              promociones especiales y beneficios exclusivos
              para los que siempre vuelven.
            </p>

            <div className="mt-9 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {beneficios.map((beneficio) => (
                <div
                  key={beneficio.titulo}
                  className="group rounded-xl border border-white/10 bg-white/[0.03] p-4 transition duration-300 hover:-translate-y-1 hover:border-[#e71921]/40 hover:bg-white/[0.05]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e71921]/10 text-xs font-black text-[#e71921] transition group-hover:bg-[#e71921] group-hover:text-white">
                    {beneficio.icono}
                  </div>

                  <h3 className="mt-4 text-sm font-black uppercase text-white">
                    {beneficio.titulo}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    {beneficio.texto}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-9">
              <Button
                href="/club-jalu"
                onClick={() =>
                  trackEvent("click_ver_club_jalu")
                }
              >
                Conocer Club Jalu →
              </Button>
            </div>
          </div>

          <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden border-t border-white/10 bg-[#0b0b0b] p-5 sm:min-h-[430px] sm:p-8 lg:min-h-[530px] lg:border-l lg:border-t-0">
            <div className="absolute left-10 top-10 h-24 w-24 rounded-full bg-[#e71921]/10 blur-3xl sm:h-32 sm:w-32" />

            <div className="absolute bottom-10 right-10 h-28 w-28 rounded-full bg-[#e71921]/10 blur-3xl sm:h-40 sm:w-40" />

            <span className="pointer-events-none absolute select-none text-[6rem] font-black leading-none text-white/[0.018] sm:text-[9rem] lg:text-[13rem]">
              2X1
            </span>

            <div className="group relative w-full max-w-[430px] rotate-0 overflow-hidden rounded-[20px] border border-white/15 bg-gradient-to-br from-[#252525] via-[#141414] to-[#080808] p-5 shadow-2xl transition duration-500 sm:rounded-[24px] sm:p-7 lg:-rotate-2 lg:p-9 lg:hover:rotate-0 lg:hover:scale-[1.02]">
              <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#e71921]/20 blur-[60px] sm:h-52 sm:w-52" />

              <div className="relative">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.25em] text-[#e71921] sm:text-[10px] sm:tracking-[0.3em]">
                      Beneficios exclusivos
                    </p>

                    <h3 className="mt-2 text-2xl font-black uppercase text-white sm:text-3xl">
                      Club Jalu
                    </h3>
                  </div>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e71921] text-sm font-black text-white shadow-[0_0_30px_rgba(231,25,33,0.35)] sm:h-12 sm:w-12 sm:text-lg">
                    J
                  </div>
                </div>

                <div className="my-6 h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent sm:my-8" />

                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-gray-500 sm:text-[10px] sm:tracking-[0.25em]">
                  Beneficio destacado
                </p>

                <div className="mt-3">
                  <span className="text-5xl font-black leading-none text-white sm:text-7xl lg:text-8xl">
                    2X1
                  </span>
                </div>

                <p className="mt-4 max-w-xs text-xs leading-5 text-gray-400 sm:mt-5 sm:text-sm sm:leading-6">
                  Accedé a promociones especiales en productos,
                  días y sucursales seleccionadas.
                </p>

                <div className="mt-7 flex items-center justify-between gap-3 border-t border-white/10 pt-4 sm:mt-9 sm:pt-5">
                  <span className="text-[7px] font-black uppercase tracking-[0.18em] text-gray-500 sm:text-[9px] sm:tracking-[0.25em]">
                    Miembro Club Jalu
                  </span>

                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-[7px] font-bold uppercase tracking-wider text-gray-500 sm:text-[9px]">
                      Activo
                    </span>

                    <span className="h-2 w-2 rounded-full bg-[#e71921] shadow-[0_0_15px_rgba(231,25,33,0.9)] sm:h-2.5 sm:w-2.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="section final-cta">
      <div>
        <h2>
          ¿Qué vas a comer hoy?
        </h2>
      </div>
    </section>
  );
}