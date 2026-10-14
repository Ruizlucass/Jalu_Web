export default function ClubJaluHome() {
  return (
    <section
      id="club"
      className="relative overflow-hidden bg-[#080808] px-4 py-16 sm:px-6 md:py-24"
    >
      
      <div className="pointer-events-none absolute -right-32 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-[#e71921]/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[28px] border border-white/10 bg-[#111111]">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">

          
          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14 xl:p-16">
            <div>
              <span className="inline-flex rounded-md bg-[#e71921] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.15em] text-white">
                Promos / Club Jalu
              </span>
            </div>

            <h2 className="mt-6 max-w-2xl text-4xl font-black uppercase leading-[0.95] text-white sm:text-5xl lg:text-6xl">
              Ser parte
              <span className="block text-[#e71921]">
                tiene beneficios
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-base leading-7 text-gray-400 sm:text-lg">
              Sumate al Club Jalu y accedé a descuentos, promociones
              especiales y beneficios exclusivos para los que siempre vuelven.
            </p>

           
            <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">

              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e71921]/15 text-sm font-black text-[#e71921]">
                  %
                </div>

                <span className="text-sm font-bold text-gray-200">
                  Descuentos
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e71921]/15 text-xs font-black text-[#e71921]">
                  2X1
                </div>

                <span className="text-sm font-bold text-gray-200">
                  Promociones
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e71921]/15 text-lg font-black text-[#e71921]">
                  ★
                </div>

                <span className="text-sm font-bold text-gray-200">
                  Exclusivos
                </span>
              </div>

            </div>

            <div className="mt-9">
              <a
                href="/club-jalu"
                className="inline-flex items-center justify-center gap-3 rounded-lg bg-[#e71921] px-7 py-4 text-sm font-black uppercase tracking-wide text-white shadow-[0_10px_35px_rgba(231,25,33,0.20)] transition duration-300 hover:-translate-y-1 hover:bg-[#ff2a33]"
              >
                Conocer Club Jalu

                <span
                  aria-hidden="true"
                  className="text-lg transition-transform duration-300"
                >
                  →
                </span>
              </a>
            </div>
          </div>

         
          <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden border-t border-white/10 bg-[#0c0c0c] p-8 lg:min-h-[540px] lg:border-l lg:border-t-0">

            
            <div className="absolute left-10 top-10 h-32 w-32 rounded-full bg-[#e71921]/10 blur-3xl" />

            <div className="absolute bottom-10 right-10 h-40 w-40 rounded-full bg-[#e71921]/10 blur-3xl" />

           
            <span className="pointer-events-none absolute text-[10rem] font-black leading-none text-white/[0.015] sm:text-[13rem] lg:text-[15rem]">
              2X1
            </span>

            
            <div className="relative w-full max-w-[440px] rotate-[-2deg] rounded-[24px] border border-white/15 bg-gradient-to-br from-[#242424] via-[#141414] to-[#090909] p-7 shadow-2xl transition duration-500 hover:rotate-0 hover:scale-[1.02] sm:p-9">

            
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[24px]">
                <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#e71921]/20 blur-3xl" />
              </div>

              <div className="relative">

               
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-[#e71921]">
                      Beneficios
                    </p>

                    <h3 className="mt-2 text-3xl font-black uppercase text-white">
                      Club Jalu
                    </h3>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e71921] text-lg font-black text-white shadow-[0_0_30px_rgba(231,25,33,0.35)]">
                    J
                  </div>
                </div>

                <div className="my-8 h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

                
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">
                  Beneficio destacado
                </p>

                <div className="mt-2 flex items-end gap-3">
                  <span className="text-7xl font-black leading-none text-white sm:text-8xl">
                    2X1
                  </span>
                </div>

                <p className="mt-4 max-w-xs text-sm leading-6 text-gray-400">
                  Promociones especiales para miembros en productos y fechas
                  seleccionadas.
                </p>

                <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                    Miembro Club Jalu
                  </span>

                  <span className="h-2.5 w-2.5 rounded-full bg-[#e71921] shadow-[0_0_15px_rgba(231,25,33,0.8)]" />
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}