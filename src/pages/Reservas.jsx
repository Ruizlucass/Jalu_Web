import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AuthModal from "../components/AuthModal";
import { supabase } from "../supabase";

function fechaActual() {
  const ahora = new Date();
  const offset = ahora.getTimezoneOffset();

  return new Date(
    ahora.getTime() - offset * 60 * 1000
  )
    .toISOString()
    .split("T")[0];
}

export default function Reservas() {
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
    personas: 2,
    fecha: "",
    hora: "",
    comentarios: "",
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
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error obteniendo sesión:", error);
      }

      setSession(session);
    } catch (error) {
      console.error("Error obteniendo sesión:", error);
    } finally {
      setLoadingSession(false);
    }
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

  async function guardarReserva(e) {
    e.preventDefault();

    setError("");
    setMensaje("");

    if (!session?.user) {
      abrirLogin();
      return;
    }

    const personas = Number(form.personas);

    if (
      !form.nombre.trim() ||
      !form.telefono.trim() ||
      !form.sucursal ||
      !form.fecha ||
      !form.hora
    ) {
      setError("Completá todos los campos obligatorios.");
      return;
    }

    if (personas < 1) {
      setError(
        "La cantidad de personas debe ser mayor a 0."
      );
      return;
    }

    if (personas > 50) {
      setError(
        "Para reservas de más de 50 personas necesitamos coordinar directamente por WhatsApp."
      );
      return;
    }

    if (form.fecha < fechaActual()) {
      setError(
        "No podés seleccionar una fecha anterior a hoy."
      );
      return;
    }

    setEnviando(true);

    try {
      const { error: supabaseError } = await supabase
        .from("reservas")
        .insert({
          user_id: session.user.id,
          nombre: form.nombre.trim(),
          email: session.user.email,
          telefono: form.telefono.trim(),
          sucursal: form.sucursal,
          personas,
          fecha: form.fecha,
          hora: form.hora,
          comentarios:
            form.comentarios.trim() || null,
          estado: "pendiente",
        });

      if (supabaseError) {
        console.error(
          "Error registrando reserva:",
          supabaseError
        );

        setError(
          "No pudimos registrar la reserva. Intentá nuevamente."
        );

        return;
      }

      setMensaje(
        "¡Reserva enviada! Quedó registrada y está pendiente de confirmación."
      );

      setForm({
        nombre: "",
        telefono: "",
        sucursal: "",
        personas: 2,
        fecha: "",
        hora: "",
        comentarios: "",
      });
    } catch (error) {
      console.error(
        "Error inesperado registrando reserva:",
        error
      );

      setError(
        "Ocurrió un error inesperado. Intentá nuevamente."
      );
    } finally {
      setEnviando(false);
    }
  }

  const masDe50 = Number(form.personas) > 50;

  const mensajeWhatsapp = encodeURIComponent(
    `Hola Jalu, quisiera consultar por una reserva para ${
      form.personas || ""
    } personas.`
  );

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#090909] text-white">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#e71921]/20 via-transparent to-transparent" />

          <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-28 lg:px-8 lg:pb-24 lg:pt-36">
            <span className="text-sm font-bold uppercase tracking-[0.35em] text-[#e71921]">
              Jalu Comidas Árabes
            </span>

            <h1 className="mt-4 max-w-3xl text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              Reservá tu mesa
              <span className="text-[#e71921]">
                .
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-400">
              Elegí tu sucursal, fecha y horario.
              Nosotros nos encargamos del resto.
            </p>
          </div>
        </section>

        {/* CONTENIDO */}
        <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:px-8 lg:py-24">
          {/* INFORMACIÓN */}
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#e71921]">
              Tu mesa te espera
            </p>

            <h2 className="mt-3 text-4xl font-black">
              Una reserva,
              <br />
              cero complicaciones.
            </h2>

            <p className="mt-5 max-w-md text-gray-400">
              Completá tus datos y tu reserva quedará
              registrada en nuestro sistema.
            </p>

            <div className="mt-10 space-y-4">
              {[
                ["01", "Elegí la sucursal"],
                [
                  "02",
                  "Seleccioná fecha y horario",
                ],
                [
                  "03",
                  "Indicá cuántas personas son",
                ],
                [
                  "04",
                  "Esperá la confirmación",
                ],
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
                ¿Son más de 50 personas?
              </p>

              <p className="mt-2 text-sm text-gray-400">
                Las reservas grandes se coordinan
                personalmente con nuestro equipo.
              </p>
            </div>
          </div>

          {/* FORMULARIO */}
          <div className="rounded-3xl border border-white/10 bg-[#111111] p-6 shadow-2xl sm:p-8 lg:p-10">
            <div className="mb-8">
              <p className="text-sm font-bold text-[#e71921]">
                RESERVA ONLINE
              </p>

              <h3 className="mt-2 text-3xl font-black">
                Datos de tu reserva
              </h3>
            </div>

            {/* AVISO LOGIN */}
            {!loadingSession && !session && (
              <div className="mb-6 rounded-xl border border-[#e71921]/30 bg-[#e71921]/10 p-4">
                <p className="font-semibold">
                  Necesitás iniciar sesión para
                  reservar.
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  Tu reserva quedará asociada a tu
                  cuenta.
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

            {/* SESIÓN ACTIVA */}
            {!loadingSession && session?.user && (
              <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/5 p-4">
                <p className="text-sm text-green-300">
                  Sesión iniciada como{" "}
                  <span className="font-bold">
                    {session.user.email}
                  </span>
                </p>
              </div>
            )}

            <form
              onSubmit={guardarReserva}
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
                  placeholder="Nombre completo"
                  autoComplete="name"
                  className="w-full rounded-xl border border-white/10 bg-[#090909] px-4 py-3.5 text-white outline-none transition placeholder:text-gray-600 focus:border-[#e71921]"
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
                  autoComplete="tel"
                  className="w-full rounded-xl border border-white/10 bg-[#090909] px-4 py-3.5 text-white outline-none transition placeholder:text-gray-600 focus:border-[#e71921]"
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
                  className="w-full rounded-xl border border-white/10 bg-[#090909] px-4 py-3.5 text-white outline-none transition focus:border-[#e71921]"
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

              {/* FECHA Y HORA */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-300">
                    Fecha
                  </label>

                  <input
                    type="date"
                    name="fecha"
                    min={fechaActual()}
                    value={form.fecha}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-[#090909] px-4 py-3.5 text-white outline-none transition focus:border-[#e71921]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-300">
                    Hora
                  </label>

                  <input
                    type="time"
                    name="hora"
                    value={form.hora}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-[#090909] px-4 py-3.5 text-white outline-none transition focus:border-[#e71921]"
                  />
                </div>
              </div>

              {/* PERSONAS */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-300">
                  Cantidad de personas
                </label>

                <input
                  type="number"
                  min="1"
                  name="personas"
                  value={form.personas}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-[#090909] px-4 py-3.5 text-white outline-none transition focus:border-[#e71921]"
                />

                {masDe50 && (
                  <div className="mt-3 rounded-xl border border-[#e71921]/20 bg-[#e71921]/10 p-4">
                    <p className="text-sm font-semibold text-[#e71921]">
                      Para grupos de más de 50 personas
                      coordinamos directamente por
                      WhatsApp.
                    </p>
                  </div>
                )}
              </div>

              {/* COMENTARIOS */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-300">
                  Comentarios
                  <span className="font-normal text-gray-500">
                    {" "}
                    (opcional)
                  </span>
                </label>

                <textarea
                  name="comentarios"
                  value={form.comentarios}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Cumpleaños, ubicación de mesa, observaciones..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#090909] px-4 py-3.5 text-white outline-none transition placeholder:text-gray-600 focus:border-[#e71921]"
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
              {masDe50 ? (
                <a
                  href={`https://wa.me/?text=${mensajeWhatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full rounded-xl bg-[#25D366] px-6 py-4 text-center font-black text-black transition hover:scale-[1.01] hover:bg-[#2ee66f]"
                >
                  Coordinar por WhatsApp
                </a>
              ) : (
                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full rounded-xl bg-[#e71921] px-6 py-4 font-black text-white transition hover:bg-[#ff252d] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {enviando
                    ? "Registrando..."
                    : "Reservar mesa"}
                </button>
              )}
            </form>
          </div>
        </section>
      </main>

      <Footer />

      <AuthModal
        open={authOpen}
        mode={authMode}
        setMode={setAuthMode}
        onClose={() => setAuthOpen(false)}
        onSuccess={async () => {
          setAuthOpen(false);
          await cargarSesion();
        }}
      />
    </>
  );
}