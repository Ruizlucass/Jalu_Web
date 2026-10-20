import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AuthModal from "../components/AuthModal";
import { supabase } from "../supabase";

// ================================
// TIEMPOS DE CANCELACIÓN
// ================================

// Pedidos: 5 minutos
const PEDIDO_CANCELACION_SEGUNDOS = 5 * 60;

// Reservas: 1 hora
const RESERVA_CANCELACION_SEGUNDOS = 60 * 60;

function segundosParaCancelar(createdAt, tipo) {
  if (!createdAt) return 0;

  const fechaCreacion =
    new Date(createdAt).getTime();

  if (Number.isNaN(fechaCreacion)) {
    return 0;
  }

  const limiteSegundos =
    tipo === "reserva"
      ? RESERVA_CANCELACION_SEGUNDOS
      : PEDIDO_CANCELACION_SEGUNDOS;

  const limite =
    fechaCreacion +
    limiteSegundos * 1000;

  const restante = Math.ceil(
    (limite - Date.now()) / 1000
  );

  return Math.max(0, restante);
}

function formatearTiempo(segundos) {
  if (segundos <= 0) {
    return "0:00";
  }

  const horas = Math.floor(
    segundos / 3600
  );

  const minutos = Math.floor(
    (segundos % 3600) / 60
  );

  const segundosRestantes =
    segundos % 60;

  if (horas > 0) {
    return `${horas}:${String(
      minutos
    ).padStart(2, "0")}:${String(
      segundosRestantes
    ).padStart(2, "0")}`;
  }

  return `${minutos}:${String(
    segundosRestantes
  ).padStart(2, "0")}`;
}

export default function MisSolicitudes() {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] =
    useState(true);

  const [pedidos, setPedidos] = useState([]);
  const [reservas, setReservas] =
    useState([]);
  const solicitudesLoadId = useRef(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [ahora, setAhora] =
    useState(Date.now());

  const [authOpen, setAuthOpen] =
    useState(false);

  const [authMode, setAuthMode] =
    useState("login");

  const [cancelando, setCancelando] =
    useState(null);

  const [
    confirmarCancelacion,
    setConfirmarCancelacion,
  ] = useState(null);

  useEffect(() => {
    cargarSesion();

    const {
      data: { subscription },
    } =
      supabase.auth.onAuthStateChange(
        (_event, nuevaSession) => {
          setSession(nuevaSession);

          if (nuevaSession?.user) {
            cargarSolicitudes(
              nuevaSession.user.id
            );
          } else {
            setPedidos([]);
            setReservas([]);
            setLoading(false);
          }
        }
      );

    return () =>
      subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAhora(Date.now());
    }, 1000);

    return () =>
      clearInterval(interval);
  }, []);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return undefined;
    let lastRefreshAt = 0;

    const actualizarAlVolver = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastRefreshAt < 1000) return;
      lastRefreshAt = Date.now();
      cargarSolicitudes(userId);
    };

    window.addEventListener("focus", actualizarAlVolver);
    document.addEventListener("visibilitychange", actualizarAlVolver);

    return () => {
      window.removeEventListener("focus", actualizarAlVolver);
      document.removeEventListener("visibilitychange", actualizarAlVolver);
    };
  }, [session?.user?.id]);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return undefined;

    const channel = supabase
      .channel(`mis-solicitudes-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "pedidos" }, () => {
        cargarSolicitudes(userId);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "reservas" }, () => {
        cargarSolicitudes(userId);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  async function cargarSesion() {
    const {
      data: { session },
    } =
      await supabase.auth.getSession();

    setSession(session);
    setLoadingSession(false);

    if (session?.user) {
      cargarSolicitudes(
        session.user.id
      );
    } else {
      setLoading(false);
    }
  }

  async function cargarSolicitudes(
    userId
  ) {
    const loadId = solicitudesLoadId.current + 1;
    solicitudesLoadId.current = loadId;
    setLoading(true);
    setError("");

    const [
      pedidosResponse,
      reservasResponse,
    ] = await Promise.all([
      supabase
        .from("pedidos")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", {
          ascending: false,
        }),

      supabase
        .from("reservas")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", {
          ascending: false,
        }),
    ]);

    // Evita que una consulta más vieja vuelva a mostrar filas que otra
    // consulta reciente ya confirmó como eliminadas.
    if (loadId !== solicitudesLoadId.current) return;

    if (
      pedidosResponse.error ||
      reservasResponse.error
    ) {
      console.error(
        pedidosResponse.error,
        reservasResponse.error
      );

      setError(
        "No pudimos cargar tus solicitudes."
      );

      setLoading(false);
      return;
    }

    setPedidos(
      pedidosResponse.data || []
    );

    setReservas(
      reservasResponse.data || []
    );

    setLoading(false);
  }

  function tiempoRestante(
    item,
    tipo
  ) {
    // Hace que React actualice el contador
    // cada segundo.
    void ahora;

    if (
      item.estado !== "pendiente"
    ) {
      return 0;
    }

    return segundosParaCancelar(
      item.created_at,
      tipo
    );
  }

  function puedeCancelar(
    item,
    tipo
  ) {
    return (
      item.estado === "pendiente" &&
      tiempoRestante(
        item,
        tipo
      ) > 0
    );
  }

  async function cancelarSolicitud() {
    if (!confirmarCancelacion) {
      return;
    }

    const { tipo, item } =
      confirmarCancelacion;

    // Comprobamos también en frontend
    // que todavía esté dentro del tiempo.
    if (!puedeCancelar(item, tipo)) {
      setConfirmarCancelacion(null);

      setError(
        tipo === "reserva"
          ? "La hora disponible para cancelar esta reserva ya finalizó."
          : "Los 5 minutos disponibles para cancelar este pedido ya finalizaron."
      );

      return;
    }

    setCancelando(
      `${tipo}-${item.id}`
    );

    setError("");

    const nombreFuncion =
      tipo === "pedido"
        ? "cancelar_mi_pedido"
        : "cancelar_mi_reserva";

    const parametros =
      tipo === "pedido"
        ? {
            p_pedido_id:
              String(item.id),
          }
        : {
            p_reserva_id:
              String(item.id),
          };

    const { error: cancelError } =
      await supabase.rpc(
        nombreFuncion,
        parametros
      );

    setCancelando(null);

    if (cancelError) {
      console.error(
        cancelError
      );

      setConfirmarCancelacion(
        null
      );

      setError(
        cancelError.message ||
          "No se pudo cancelar la solicitud."
      );

      await cargarSolicitudes(
        session.user.id
      );

      return;
    }

    setConfirmarCancelacion(null);

    await cargarSolicitudes(
      session.user.id
    );
  }

  function Estado({ estado }) {
    const clases = {
      pendiente:
        "border-yellow-500/20 bg-yellow-500/10 text-yellow-300",

      confirmado:
        "border-green-500/20 bg-green-500/10 text-green-300",

      preparando:
        "border-blue-500/20 bg-blue-500/10 text-blue-300",

      listo:
        "border-green-500/20 bg-green-500/10 text-green-300",

      entregado:
        "border-green-500/20 bg-green-500/10 text-green-300",

      finalizado:
        "border-green-500/20 bg-green-500/10 text-green-300",

      cancelado:
        "border-red-500/20 bg-red-500/10 text-red-300",
    };

    return (
      <span
        className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${
          clases[estado] ||
          "border-white/10 bg-white/5 text-gray-300"
        }`}
      >
        {estado}
      </span>
    );
  }

  function BotonCancelar({
    item,
    tipo,
  }) {
    const segundos =
      tiempoRestante(
        item,
        tipo
      );

    if (
      item.estado === "cancelado"
    ) {
      return (
        <p className="text-sm text-red-400">
          Esta solicitud fue
          cancelada.
        </p>
      );
    }

    if (
      item.estado !== "pendiente"
    ) {
      return (
        <p className="text-sm text-gray-500">
          Esta solicitud ya no
          puede cancelarse.
        </p>
      );
    }

    if (segundos <= 0) {
      return (
        <p className="text-sm text-gray-500">
          La ventana de
          cancelación finalizó.
        </p>
      );
    }

    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-gray-400">
            {tipo === "reserva"
              ? "Podés cancelar la reserva durante "
              : "Podés cancelar el pedido durante "}
            <span className="font-black text-white">
              {formatearTiempo(
                segundos
              )}
            </span>
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {tipo === "reserva"
              ? "La reserva puede cancelarse durante 1 hora desde que fue realizada."
              : "El pedido puede cancelarse durante 5 minutos desde que fue realizado."}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setConfirmarCancelacion({
              tipo,
              item,
            })
          }
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-300 transition hover:bg-red-500/20"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#090909] px-6 pb-24 pt-36 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#e71921]">
                Mi cuenta
              </p>

              <h1 className="mt-3 text-4xl font-black sm:text-5xl">
                Mis solicitudes
              </h1>

              <p className="mt-4 max-w-2xl text-gray-400">
                Consultá el estado de
                tus pedidos y reservas.
              </p>
            </div>
            {session?.user && (
              <button
                type="button"
                onClick={() => cargarSolicitudes(session.user.id)}
                disabled={loading}
                className="min-h-10 rounded-xl border border-white/15 px-4 text-xs font-black uppercase text-gray-300 transition hover:border-[#e71921]/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Actualizando..." : "Actualizar solicitudes"}
              </button>
            )}
          </div>

          {!loadingSession &&
            !session && (
              <div className="mt-10 rounded-3xl border border-white/10 bg-[#111111] p-8">
                <h2 className="text-2xl font-black">
                  Iniciá sesión
                </h2>

                <p className="mt-3 text-gray-400">
                  Necesitás iniciar
                  sesión para consultar
                  tus pedidos y
                  reservas.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(
                      "login"
                    );

                    setAuthOpen(
                      true
                    );
                  }}
                  className="mt-5 rounded-xl bg-[#e71921] px-6 py-3 font-bold"
                >
                  Iniciar sesión
                </button>
              </div>
            )}

          {error && (
            <div className="mt-8 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
              {error}
            </div>
          )}

          {session && (
            <>
              {/* =========================
                  PEDIDOS
              ========================== */}
              <section className="mt-12">
                <h2 className="text-3xl font-black">
                  Mis pedidos
                </h2>

                <div className="mt-6 space-y-4">
                  {!loading &&
                    pedidos.length ===
                      0 && (
                      <p className="text-gray-500">
                        Todavía no
                        realizaste
                        pedidos.
                      </p>
                    )}

                  {pedidos.map(
                    (pedido) => (
                      <article
                        key={
                          pedido.id
                        }
                        className="rounded-3xl border border-white/10 bg-[#111111] p-6"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              Pedido #
                              {
                                pedido.id
                              }
                            </p>

                            <h3 className="mt-1 text-xl font-black">
                              {
                                pedido.sucursal
                              }
                            </h3>
                          </div>

                          <Estado
                            estado={
                              pedido.estado
                            }
                          />
                        </div>

                        <div className="mt-5 space-y-2 text-sm text-gray-400">
                          <p>
                            <strong className="text-gray-200">
                              Entrega:
                            </strong>{" "}
                            {pedido.tipo_entrega ===
                            "delivery"
                              ? "Delivery"
                              : "Take Away"}
                          </p>

                          <p>
                            <strong className="text-gray-200">
                              Pedido:
                            </strong>{" "}
                            {
                              pedido.descripcion
                            }
                          </p>
                        </div>

                        <div className="mt-6 border-t border-white/10 pt-5">
                          <BotonCancelar
                            item={
                              pedido
                            }
                            tipo="pedido"
                          />
                        </div>
                      </article>
                    )
                  )}
                </div>
              </section>

              {/* =========================
                  RESERVAS
              ========================== */}
              <section className="mt-16">
                <h2 className="text-3xl font-black">
                  Mis reservas
                </h2>

                <div className="mt-6 space-y-4">
                  {!loading &&
                    reservas.length ===
                      0 && (
                      <p className="text-gray-500">
                        Todavía no
                        realizaste
                        reservas.
                      </p>
                    )}

                  {reservas.map(
                    (reserva) => (
                      <article
                        key={
                          reserva.id
                        }
                        className="rounded-3xl border border-white/10 bg-[#111111] p-6"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              Reserva #
                              {
                                reserva.id
                              }
                            </p>

                            <h3 className="mt-1 text-xl font-black">
                              {
                                reserva.sucursal
                              }
                            </h3>
                          </div>

                          <Estado
                            estado={
                              reserva.estado
                            }
                          />
                        </div>

                        <div className="mt-5 space-y-2 text-sm text-gray-400">
                          <p>
                            <strong className="text-gray-200">
                              Fecha:
                            </strong>{" "}
                            {
                              reserva.fecha
                            }
                          </p>

                          <p>
                            <strong className="text-gray-200">
                              Hora:
                            </strong>{" "}
                            {
                              reserva.hora
                            }
                          </p>

                          <p>
                            <strong className="text-gray-200">
                              Personas:
                            </strong>{" "}
                            {
                              reserva.personas
                            }
                          </p>
                        </div>

                        <div className="mt-6 border-t border-white/10 pt-5">
                          <BotonCancelar
                            item={
                              reserva
                            }
                            tipo="reserva"
                          />
                        </div>
                      </article>
                    )
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      <Footer />

      {/* MODAL CONFIRMAR CANCELACIÓN */}
      {confirmarCancelacion && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111111] p-7 text-white">

            <h2 className="text-2xl font-black">
              ¿Cancelar{" "}
              {confirmarCancelacion.tipo ===
              "pedido"
                ? "pedido"
                : "reserva"}
              ?
            </h2>

            <p className="mt-3 leading-6 text-gray-400">
              Esta acción marcará
              la solicitud como
              cancelada.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setConfirmarCancelacion(
                    null
                  )
                }
                className="rounded-xl border border-white/10 py-3 font-bold"
              >
                Volver
              </button>

              <button
                type="button"
                disabled={
                  cancelando !== null
                }
                onClick={
                  cancelarSolicitud
                }
                className="rounded-xl bg-[#e71921] py-3 font-black disabled:opacity-50"
              >
                {cancelando
                  ? "Cancelando..."
                  : "Sí, cancelar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <AuthModal
        open={authOpen}
        mode={authMode}
        setMode={setAuthMode}
        onClose={() =>
          setAuthOpen(false)
        }
        onSuccess={() => {
          setAuthOpen(false);
          cargarSesion();
        }}
      />
    </>
  );
}
