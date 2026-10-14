  import { useState } from "react";

  import Navbar from "../components/Navbar.jsx";
  import Footer from "../components/Footer.jsx";
  import WspFlotante from "../components/WspFlotante.jsx";
  import { trackEvent } from "../helpers/tracking.js";

  export default function ClubJalu() {
    const [form, setForm] = useState({
      nombre: "",
      email: "",
      whatsapp: "",
    });

    const handleChange = ({ target }) => {
      setForm({
        ...form,
        [target.name]: target.value,
      });
    };

    const handleSubmit = (e) => {
      e.preventDefault();

      trackEvent("registro_club_jalu");

      console.log("REGISTRO CLUB JALU:", form);

      alert(
        "¡Gracias por sumarte al Club Jalu! Próximamente vas a recibir nuestros beneficios."
      );

      setForm({
        nombre: "",
        email: "",
        whatsapp: "",
      });
    };

    const beneficios = [
      {
        titulo: "Descuentos",
        descripcion:
          "Accedé a descuentos especiales y beneficios exclusivos para miembros del Club Jalu.",
      },
      {
        titulo: "2x1",
        descripcion:
          "Disfrutá promociones 2x1 en productos y fechas seleccionadas.",
      },
      {
        titulo: "Promos exclusivas",
        descripcion:
          "Enterate antes que nadie de combos, lanzamientos y promociones especiales.",
      },
    ];

    const pasos = [
      {
        numero: "01",
        titulo: "Registrate",
        descripcion:
          "Dejanos tu email y WhatsApp para formar parte del Club Jalu.",
      },
      {
        numero: "02",
        titulo: "Recibí beneficios",
        descripcion:
          "Te avisamos cuando haya nuevos descuentos, promociones y 2x1.",
      },
      {
        numero: "03",
        titulo: "Disfrutá Jalu",
        descripcion:
          "Presentá o utilizá tu beneficio y disfrutá tus sabores favoritos.",
      },
    ];

    const irARegistro = () => {
      document
        .getElementById("registro-club")
        ?.scrollIntoView({
          behavior: "smooth",
        });
    };

    return (
      <main className="min-h-screen bg-[#080808] text-white">
        <Navbar />

        
        <section className="relative flex min-h-[75vh] items-center justify-center overflow-hidden px-6 pt-24 text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-[#e71921]/12 via-transparent to-[#080808]" />

          <div className="relative z-10 mx-auto max-w-4xl">
            <span className="mb-5 inline-block text-sm font-black uppercase tracking-[0.35em] text-[#e71921]">
              Beneficios Jalu
            </span>

            <h1 className="text-5xl font-black uppercase leading-none sm:text-6xl md:text-8xl">
              Club Jalu
            </h1>

            <p className="mt-5 text-2xl font-black uppercase text-[#e71921] sm:text-3xl">
              Beneficios para los que siempre vuelven
            </p>

            <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-gray-300 sm:text-lg">
              Sumate al Club Jalu y enterate de nuestros descuentos,
              promociones y beneficios exclusivos.
            </p>

            <button
              type="button"
              onClick={irARegistro}
              className="mt-9 rounded-lg bg-[#e71921] px-8 py-4 text-sm font-black uppercase tracking-wide text-white transition hover:-translate-y-1 hover:bg-[#ff2a33]"
            >
              Quiero ser parte
            </button>
          </div>
        </section>

        
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-12 text-center">
            <span className="text-sm font-black uppercase tracking-[0.3em] text-[#e71921]">
              Ser parte tiene beneficios
            </span>

            <h2 className="mt-3 text-4xl font-black uppercase md:text-5xl">
              Beneficios del club
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-gray-400">
              Registrate y accedé a promociones pensadas especialmente
              para nuestra comunidad.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {beneficios.map((beneficio) => (
              <article
                key={beneficio.titulo}
                className="rounded-2xl border border-white/10 bg-[#121212] p-8 transition duration-300 hover:-translate-y-1 hover:border-[#e71921]/50"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#e71921]/10 text-xl font-black text-[#e71921]">
                  +
                </div>

                <h3 className="text-2xl font-black uppercase">
                  {beneficio.titulo}
                </h3>

                <p className="mt-4 leading-7 text-gray-400">
                  {beneficio.descripcion}
                </p>
              </article>
            ))}
          </div>
        </section>

      
        <section className="border-y border-white/10 bg-[#101010] px-6 py-20">
          <div className="mx-auto max-w-5xl text-center">
            <span className="text-sm font-black uppercase tracking-[0.3em] text-[#e71921]">
              Beneficio destacado
            </span>

            <h2 className="mt-4 text-7xl font-black uppercase text-white md:text-9xl">
              2x1
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-7 text-gray-400">
              Los miembros del Club Jalu podrán acceder a promociones
              2x1 en productos, días y sucursales seleccionadas.
            </p>

            <p className="mt-4 text-sm text-gray-500">
              Promociones sujetas a disponibilidad, vigencia y
              condiciones particulares.
            </p>
          </div>
        </section>

      
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-12">
            <span className="text-sm font-black uppercase tracking-[0.3em] text-[#e71921]">
              Es muy simple
            </span>

            <h2 className="mt-3 text-4xl font-black uppercase md:text-5xl">
              ¿Cómo funciona?
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {pasos.map((paso) => (
              <article
                key={paso.numero}
                className="border-t border-white/20 py-7"
              >
                <span className="text-sm font-black text-[#e71921]">
                  {paso.numero}
                </span>

                <h3 className="mt-4 text-2xl font-black uppercase">
                  {paso.titulo}
                </h3>

                <p className="mt-3 leading-7 text-gray-400">
                  {paso.descripcion}
                </p>
              </article>
            ))}
          </div>
        </section>

        
        <section
          id="registro-club"
          className="bg-[#101010] px-6 py-24"
        >
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="text-sm font-black uppercase tracking-[0.3em] text-[#e71921]">
                Club Jalu
              </span>

              <h2 className="mt-4 text-4xl font-black uppercase md:text-5xl">
                Sumate al club
              </h2>

              <p className="mt-5 max-w-lg leading-7 text-gray-400">
                Registrate para recibir descuentos, promociones 2x1 y
                novedades de Jalu directamente por email o WhatsApp.
              </p>

              <div className="mt-8 space-y-3 text-gray-300">
                <p>✓ Descuentos exclusivos</p>
                <p>✓ Promociones 2x1</p>
                <p>✓ Novedades y lanzamientos</p>
                <p>✓ Beneficios para miembros</p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-white/10 bg-[#161616] p-7 sm:p-9"
            >
              <div className="mb-5">
                <label
                  htmlFor="club-nombre"
                  className="mb-2 block text-sm font-bold text-gray-300"
                >
                  Nombre
                </label>

                <input
                  id="club-nombre"
                  name="nombre"
                  type="text"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  required
                  className="w-full rounded-lg border border-white/10 bg-[#0d0d0d] px-4 py-3 text-white outline-none transition focus:border-[#e71921]"
                />
              </div>

              <div className="mb-5">
                <label
                  htmlFor="club-email"
                  className="mb-2 block text-sm font-bold text-gray-300"
                >
                  Email
                </label>

                <input
                  id="club-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="ejemplo@gmail.com"
                  required
                  className="w-full rounded-lg border border-white/10 bg-[#0d0d0d] px-4 py-3 text-white outline-none transition focus:border-[#e71921]"
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="club-whatsapp"
                  className="mb-2 block text-sm font-bold text-gray-300"
                >
                  WhatsApp
                </label>

                <input
                  id="club-whatsapp"
                  name="whatsapp"
                  type="tel"
                  value={form.whatsapp}
                  onChange={handleChange}
                  placeholder="381 000 0000"
                  required
                  className="w-full rounded-lg border border-white/10 bg-[#0d0d0d] px-4 py-3 text-white outline-none transition focus:border-[#e71921]"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-[#e71921] px-6 py-4 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#ff2a33]"
              >
                Unirme al Club Jalu
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-gray-500">
                Al registrarte aceptás recibir comunicaciones relacionadas
                con promociones y beneficios de Jalu.
              </p>
            </form>
          </div>
        </section>

        
        <section className="px-6 py-24 text-center">
          <div className="mx-auto max-w-3xl">
            <span className="text-sm font-black uppercase tracking-[0.3em] text-[#e71921]">
              Siempre hay algo nuevo
            </span>

            <h2 className="mt-4 text-4xl font-black uppercase md:text-6xl">
              Ser parte tiene beneficios
            </h2>

            <button
              type="button"
              onClick={irARegistro}
              className="mt-8 rounded-lg bg-[#e71921] px-9 py-4 text-sm font-black uppercase tracking-wide transition hover:-translate-y-1 hover:bg-[#ff2a33]"
            >
              Quiero sumarme
            </button>
          </div>
        </section>

        <Footer />
        <WspFlotante />
      </main>
    );
  }
