import { useState } from "react";
import { supabase } from "../supabase.js";

import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import WspFlotante from "../components/WspFlotante.jsx";
import AuthModal from "../components/AuthModal.jsx";

export default function ArabeLibre() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const irAReserva = () => {
    window.location.href = "/reservas#reservas";
  };

  const handleReservar = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      irAReserva();
      return;
    }

    setAuthMode("login");
    setAuthOpen(true);
  };

  const handleAuthSuccess = () => {
    setAuthOpen(false);
    irAReserva();
  };

  const comidas = [
    {
      nombre: "Sfijas",
      descripcion:
        "Nuestra clásica masa artesanal con relleno especiado.",
    },
    {
      nombre: "Kipes",
      descripcion:
        "Tradicionales, crocantes por fuera y llenos de sabor.",
    },
    {
      nombre: "Shawarma",
      descripcion:
        "Carne condimentada, cocción lenta y todo el sabor de Jalu.",
    },
    {
      nombre: "Tablas",
      descripcion:
        "Una selección para compartir y probar un poco de todo.",
    },
    {
      nombre: "Hummus",
      descripcion:
        "Cremoso, suave y preparado con nuestra receta.",
    },
    {
      nombre: "Salsas",
      descripcion:
        "El acompañamiento perfecto para completar la experiencia.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <Navbar />

      
      <section className="relative flex min-h-[78vh] items-center justify-center overflow-hidden px-6 pt-24 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[#e71921]/12 via-transparent to-[#080808]" />

        <div className="relative z-10 mx-auto max-w-4xl">
          <span className="mb-5 inline-block text-sm font-black uppercase tracking-[0.35em] text-[#e71921]">
            La experiencia Jalu
          </span>

          <h1 className="text-5xl font-black uppercase leading-none sm:text-6xl md:text-8xl">
            Árabe Libre
          </h1>

          <p className="mt-4 text-2xl font-black uppercase text-[#e71921] sm:text-3xl">
            Vení con hambre
          </p>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-gray-300 sm:text-lg">
            Sentate, disfrutá y recorré nuestros sabores árabes en una
            experiencia pensada para compartir y comer sin apuro.
          </p>

          <button
            type="button"
            onClick={handleReservar}
            className="mt-9 rounded-lg bg-[#e71921] px-8 py-4 text-sm font-black uppercase tracking-wide text-white transition hover:-translate-y-1 hover:bg-[#ff2a33]"
          >
            Reservar mesa
          </button>
        </div>
      </section>

     
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <span className="text-sm font-black uppercase tracking-[0.3em] text-[#e71921]">
            Probá de todo
          </span>

          <h2 className="mt-3 text-4xl font-black uppercase md:text-5xl">
            ¿Qué incluye?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            Una selección de clásicos de nuestra cocina para vivir Jalu
            de principio a fin.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {comidas.map((comida) => (
            <article
              key={comida.nombre}
              className="rounded-2xl border border-white/10 bg-[#121212] p-7 transition duration-300 hover:-translate-y-1 hover:border-[#e71921]/50"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-[#e71921]/10 text-lg font-black text-[#e71921]">
                +
              </div>

              <h3 className="text-xl font-black uppercase">
                {comida.nombre}
              </h3>

              <p className="mt-3 leading-6 text-gray-400">
                {comida.descripcion}
              </p>
            </article>
          ))}
        </div>
      </section>

      
      <section className="border-y border-white/10 bg-[#101010] px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <span className="text-sm font-black uppercase tracking-[0.3em] text-[#e71921]">
            Precio
          </span>

          <h2 className="mt-4 text-5xl font-black md:text-6xl">
            $ XX.XXX
          </h2>

          <p className="mt-3 text-lg text-gray-400">
            por persona
          </p>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-6 text-gray-500">
            Consultá disponibilidad, días y horarios al momento de
            realizar tu reserva.
          </p>
        </div>
      </section>

     
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-start">
          <div>
            <span className="text-sm font-black uppercase tracking-[0.3em] text-[#e71921]">
              Antes de venir
            </span>

            <h2 className="mt-3 text-4xl font-black uppercase">
              Condiciones
            </h2>
          </div>

          <div className="space-y-3">
            {[
              "La experiencia es personal e intransferible.",
              "La disponibilidad está sujeta a días y horarios habilitados.",
              "La mesa debe reservarse previamente.",
              "Los alimentos incluidos corresponden a la modalidad vigente de Árabe Libre.",
              "Precios, productos y condiciones pueden variar según sucursal.",
            ].map((condicion, index) => (
              <div
                key={condicion}
                className="flex gap-4 rounded-xl border border-white/10 bg-[#121212] p-5"
              >
                <span className="font-black text-[#e71921]">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <p className="text-gray-300">
                  {condicion}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className="bg-[#101010] px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <span className="text-sm font-black uppercase tracking-[0.3em] text-[#e71921]">
              Así se vive
            </span>

            <h2 className="mt-3 text-4xl font-black uppercase md:text-5xl">
              Galería
            </h2>
          </div>

          <div className="grid auto-rows-[220px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="overflow-hidden rounded-2xl sm:row-span-2">
              <img
                src="/img/arabe-libre-1.jpg"
                alt="Experiencia Árabe Libre en Jalu"
                className="h-full w-full object-cover transition duration-500 hover:scale-105"
              />
            </div>

            <div className="overflow-hidden rounded-2xl">
              <img
                src="/img/arabe-libre-2.jpg"
                alt="Comida árabe de Jalu"
                className="h-full w-full object-cover transition duration-500 hover:scale-105"
              />
            </div>

            <div className="overflow-hidden rounded-2xl">
              <img
                src="/img/arabe-libre-3.jpg"
                alt="Mesa de Árabe Libre"
                className="h-full w-full object-cover transition duration-500 hover:scale-105"
              />
            </div>

            <div className="overflow-hidden rounded-2xl">
              <img
                src="/img/arabe-libre-4.jpg"
                alt="Platos de Jalu"
                className="h-full w-full object-cover transition duration-500 hover:scale-105"
              />
            </div>

            <div className="overflow-hidden rounded-2xl">
              <img
                src="/img/arabe-libre-5.jpg"
                alt="Experiencia Jalu"
                className="h-full w-full object-cover transition duration-500 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      
      <section className="px-6 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="text-sm font-black uppercase tracking-[0.3em] text-[#e71921]">
            Tu mesa te espera
          </span>

          <h2 className="mt-4 text-4xl font-black uppercase md:text-6xl">
            ¿Listo para venir?
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-gray-400">
            Reservá tu mesa y vení a disfrutar la experiencia Árabe Libre.
          </p>

          <button
            type="button"
            onClick={handleReservar}
            className="mt-8 rounded-lg bg-[#e71921] px-9 py-4 text-sm font-black uppercase tracking-wide transition hover:-translate-y-1 hover:bg-[#ff2a33]"
          >
            Reservar mesa
          </button>
        </div>
      </section>

      <Footer />
      <WspFlotante />

      <AuthModal
        open={authOpen}
        mode={authMode}
        setMode={setAuthMode}
        onClose={() => setAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </main>
  );
}