import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AuthModal from "../components/AuthModal";
import { supabase } from "../supabase";

export default function Pedidos() {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    sucursal: "",
    tipo_entrega: "retiro",
    direccion: "",
    descripcion: "",
    observaciones: "",
  });

  useEffect(() => {
    cargarSesion();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, nuevaSession) => {
        setSession(nuevaSession);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function cargarSesion() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setSession(session);
    setLoadingSession(false);
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((actual) => ({
      ...actual,
      [name]: value,
    }));
  }

  function abrirLogin() {
    setAuthMode("login");
    setAuthOpen(true);
  }

  async function guardarPedido(e) {
    e.preventDefault();

    setError("");
    setMensaje("");

    if (!session?.user) {
      abrirLogin();
      return;
    }

    if (
      !form.nombre ||
      !form.telefono ||
      !form.sucursal ||
      !form.descripcion.trim()
    ) {
      setError("Completá todos los campos obligatorios.");
      return;
    }

    if (
      form.tipo_entrega === "delivery" &&
      !form.direccion.trim()
    ) {
      setError(
        "Ingresá la dirección para realizar el delivery."
      );
      return;
    }

    setEnviando(true);

    const { error: supabaseError } = await supabase
      .from("pedidos")
      .insert({
        user_id: session.user.id,

        nombre: form.nombre,
        email: session.user.email,
        telefono: form.telefono,

        sucursal: form.sucursal,

        tipo_entrega: form.tipo_entrega,

        direccion:
          form.tipo_entrega === "delivery"
            ? form.direccion
            : null,

        descripcion: form.descripcion.trim(),

        observaciones:
          form.observaciones || null,

        total: 0,

        estado: "pendiente",
      });

    setEnviando(false);

    if (supabaseError) {
      console.error(
        "Error registrando pedido:",
        supabaseError
      );

      setError(
        "No pudimos registrar el pedido. Intentá nuevamente."
      );

      return;
    }

    setMensaje(
      "¡Pedido registrado! Quedó pendiente de confirmación."
    );

    setForm({
      nombre: "",
      telefono: "",
      sucursal: "",
      tipo_entrega: "retiro",
      direccion: "",
      descripcion: "",
      observaciones: "",
    });
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#090909] text-white">

        {/* HERO */}
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#e71921]/20 via-transparent to-transparent" />

          <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-40 sm:pt-32 lg:px-8 lg:pb-24 lg:pt-36">
            <span className="text-sm font-bold uppercase tracking-[0.35em] text-[#e71921]">
              Jalu Comidas Árabes
            </span>

            <h1 className="mt-4 max-w-3xl text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              Pedí Jalu
              <span className="text-[#e71921]">.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-400">
              Elegí cómo querés recibir tu pedido y
              disfrutá Jalu donde quieras.
            </p>
          </div>
        </section>

        {/* OPCIONES */}
        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="mb-10">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#e71921]">
              Elegí tu forma de pedir
            </p>

            <h2 className="mt-3 text-4xl font-black">
              Fácil, rápido y rico.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-[#111111] p-7 transition hover:-translate-y-1 hover:border-[#e71921]/40">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e71921] text-2xl">
                🛍️
              </div>

              <h3 className="text-2xl font-black">
                Take Away
              </h3>

              <p className="mt-3 text-gray-400">
                Hacé tu pedido y retiralo directamente
                por la sucursal seleccionada.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#111111] p-7 transition hover:-translate-y-1 hover:border-[#e71921]/40">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e71921] text-2xl">
                🛵
              </div>

              <h3 className="text-2xl font-black">
                Delivery
              </h3>

              <p className="mt-3 text-gray-400">
                Elegí delivery y recibí tu pedido
                directamente en tu domicilio.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#111111] p-7 transition hover:-translate-y-1 hover:border-[#e71921]/40">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e71921] text-2xl">
                🍽️
              </div>

              <h3 className="text-2xl font-black">
                Mirá el menú
              </h3>

              <p className="mt-3 text-gray-400">
                Consultá nuestros platos antes de
                realizar tu pedido.
              </p>

              <a
                href="/menu"
                className="mt-5 inline-block font-bold text-[#e71921] transition hover:text-red-400"
              >
                Ver menú →
              </a>
            </div>
          </div>
        </section>

        {/* PEDIDO */}
        <section className="border-t border-white/10 bg-[#0c0c0c]">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:px-8 lg:py-24">

            {/* INFORMACIÓN */}
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#e71921]">
                Pedido online
              </p>

              <h2 className="mt-3 text-4xl font-black">
                Pedir nunca fue
                <br />
                tan simple.
              </h2>

              <p className="mt-5 max-w-md text-gray-400">
                Iniciá sesión, elegí la sucursal y
                cómo querés recibir tu pedido.
              </p>

              <div className="mt-10 space-y-4">
                {[
                  ["01", "Iniciá sesión"],
                  ["02", "Elegí una sucursal"],
                  ["03", "Delivery o Take Away"],
                  ["04", "Confirmá tu pedido"],
                ].map(([numero, texto]) => (
                  <div
                    key={numero}
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e71921] font-black">
                      {numero}
                    </span>

                    <span className="font-semibold">
                      {texto}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-[#e71921]/20 bg-[#e71921]/5 p-5">
                <p className="font-bold">
                  Próximamente
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Vamos a conectar el menú directamente
                  con esta sección para que puedas
                  agregar productos a un carrito y
                  calcular automáticamente el total.
                </p>
              </div>
            </div>

            {/* FORMULARIO */}
            <div className="rounded-3xl border border-white/10 bg-[#111111] p-6 shadow-2xl sm:p-8 lg:p-10">
              <div className="mb-8">
                <p className="text-sm font-bold text-[#e71921]">
                  NUEVO PEDIDO
                </p>

                <h3 className="mt-2 text-3xl font-black">
                  Datos de tu pedido
                </h3>
              </div>

              {!loadingSession && !session && (
                <div className="mb-6 rounded-xl border border-[#e71921]/30 bg-[#e71921]/10 p-4">
                  <p className="font-semibold">
                    Necesitás iniciar sesión para
                    realizar un pedido.
                  </p>

                  <button
                    onClick={abrirLogin}
                    type="button"
                    className="mt-3 text-sm font-bold text-[#e71921] transition hover:text-red-400"
                  >
                    Iniciar sesión →
                  </button>
                </div>
              )}

              <form
                onSubmit={guardarPedido}
                className="space-y-5"
              >
                {/* NOMBRE */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-300">
                    Nombre y apellido
                  </label>

                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Lucas Ruiz"
                    className="w-full rounded-xl border border-white/10 bg-[#090909] px-4 py-3.5 outline-none transition focus:border-[#e71921]"
                  />
                </div>

                {/* TELÉFONO */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-300">
                    Teléfono
                  </label>

                  <input
                    type="tel"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    placeholder="381..."
                    className="w-full rounded-xl border border-white/10 bg-[#090909] px-4 py-3.5 outline-none transition focus:border-[#e71921]"
                  />
                </div>

                {/* SUCURSAL */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-300">
                    Sucursal
                  </label>

                  <select
                    name="sucursal"
                    value={form.sucursal}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-[#090909] px-4 py-3.5 outline-none transition focus:border-[#e71921]"
                  >
                    <option value="">
                      Seleccionar sucursal
                    </option>

                    <option value="Yerba Buena">
                      Yerba Buena
                    </option>

                    <option value="Centro">
                      Centro
                    </option>

                    <option value="Otra">
                      Otra sucursal
                    </option>
                  </select>
                </div>

                {/* TIPO ENTREGA */}
                <div>
                  <label className="mb-3 block text-sm font-semibold text-gray-300">
                    ¿Cómo querés recibirlo?
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setForm((actual) => ({
                          ...actual,
                          tipo_entrega: "retiro",
                        }))
                      }
                      className={`rounded-xl border p-4 text-left transition ${
                        form.tipo_entrega === "retiro"
                          ? "border-[#e71921] bg-[#e71921]/10"
                          : "border-white/10 bg-[#090909] hover:border-white/20"
                      }`}
                    >
                      <span className="block text-xl">
                        🛍️
                      </span>

                      <span className="mt-2 block font-bold">
                        Take Away
                      </span>

                      <span className="mt-1 block text-xs text-gray-500">
                        Retirar en sucursal
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setForm((actual) => ({
                          ...actual,
                          tipo_entrega: "delivery",
                        }))
                      }
                      className={`rounded-xl border p-4 text-left transition ${
                        form.tipo_entrega === "delivery"
                          ? "border-[#e71921] bg-[#e71921]/10"
                          : "border-white/10 bg-[#090909] hover:border-white/20"
                      }`}
                    >
                      <span className="block text-xl">
                        🛵
                      </span>

                      <span className="mt-2 block font-bold">
                        Delivery
                      </span>

                      <span className="mt-1 block text-xs text-gray-500">
                        Recibir en domicilio
                      </span>
                    </button>
                  </div>
                </div>

                {/* DIRECCIÓN */}
                {form.tipo_entrega === "delivery" && (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-300">
                      Dirección
                    </label>

                    <input
                      type="text"
                      name="direccion"
                      value={form.direccion}
                      onChange={handleChange}
                      placeholder="Calle, número, barrio..."
                      className="w-full rounded-xl border border-white/10 bg-[#090909] px-4 py-3.5 outline-none transition focus:border-[#e71921]"
                    />
                  </div>
                )}

                {/* DESCRIPCIÓN DEL PEDIDO */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-300">
                    Descripción del pedido
                  </label>

                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    rows="4"
                    required
                    placeholder="Ej: 2 shawarmas completos, 6 sfijas y una gaseosa..."
                    className="w-full resize-none rounded-xl border border-white/10 bg-[#090909] px-4 py-3.5 outline-none transition focus:border-[#e71921]"
                  />

                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    Escribí qué productos querés pedir. Este detalle se verá completo en el panel.
                  </p>
                </div>

                {/* OBSERVACIONES */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-300">
                    Observaciones
                    <span className="font-normal text-gray-500">
                      {" "}
                      (opcional)
                    </span>
                  </label>

                  <textarea
                    name="observaciones"
                    value={form.observaciones}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Ej: tocar timbre, sin cebolla, aclaraciones del pedido..."
                    className="w-full resize-none rounded-xl border border-white/10 bg-[#090909] px-4 py-3.5 outline-none transition focus:border-[#e71921]"
                  />
                </div>

                {/* ERROR */}
                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                    {error}
                  </div>
                )}

                {/* ÉXITO */}
                {mensaje && (
                  <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-300">
                    {mensaje}
                  </div>
                )}

                {/* BOTÓN */}
                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full rounded-xl bg-[#e71921] px-6 py-4 font-black text-white transition hover:bg-[#ff252d] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {enviando
                    ? "Registrando pedido..."
                    : "Confirmar pedido"}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* CANALES */}
        <section className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-6 py-16 text-center lg:px-8">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#e71921]">
              También podés pedir
            </p>

            <h2 className="mt-3 text-3xl font-black">
              Elegí tu canal favorito
            </h2>

            <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-[#111111] p-5">
                <p className="text-2xl">💬</p>
                <p className="mt-2 font-bold">
                  WhatsApp
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#111111] p-5">
                <p className="text-2xl">🛵</p>
                <p className="mt-2 font-bold">
                  PedidosYa
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#111111] p-5">
                <p className="text-2xl">🥡</p>
                <p className="mt-2 font-bold">
                  Rappi
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <AuthModal
        open={authOpen}
        mode={authMode}
        setMode={setAuthMode}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => {
          setAuthOpen(false);
          cargarSesion();
        }}
      />
    </>
  );
}
