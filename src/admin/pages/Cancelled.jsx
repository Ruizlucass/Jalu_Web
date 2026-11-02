import {
  useEffect,
  useState,
} from "react";

import {
  AdminSection,
  PageShell,
} from "../components/AdminUi.jsx";

import { supabase } from "../../supabase.js";

export default function Cancelled({
  panelType = "admin",
}) {
  const [pedidos, setPedidos] =
    useState([]);

  const [reservas, setReservas] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [eliminando, setEliminando] =
    useState(null);

  const [confirmarEliminar, setConfirmarEliminar] =
    useState(null);

  useEffect(() => {
    cargarCancelados();
  }, []);

  async function cargarCancelados() {
    setLoading(true);
    setError("");

    const [
      pedidosResponse,
      reservasResponse,
    ] = await Promise.all([
      supabase
        .from("pedidos")
        .select("*")
        .eq("estado", "cancelado")
        .order("cancelado_at", {
          ascending: false,
        }),

      supabase
        .from("reservas")
        .select("*")
        .eq("estado", "cancelado")
        .order("cancelado_at", {
          ascending: false,
        }),
    ]);

    if (
      pedidosResponse.error ||
      reservasResponse.error
    ) {
      console.error(
        pedidosResponse.error,
        reservasResponse.error
      );

      setError(
        "No se pudieron cargar los cancelados."
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

  async function eliminarDefinitivamente() {
    if (!confirmarEliminar) return;

    const {
      tipo,
      id,
    } = confirmarEliminar;

    const tabla =
      tipo === "pedido"
        ? "pedidos"
        : "reservas";

    setEliminando(
      `${tipo}-${id}`
    );

    const { error: deleteError } =
      await supabase
        .from(tabla)
        .delete()
        .eq("id", id)
        .eq("estado", "cancelado");

    setEliminando(null);

    if (deleteError) {
      console.error(deleteError);

      setError(
        "No se pudo eliminar definitivamente."
      );

      return;
    }

    setConfirmarEliminar(null);

    cargarCancelados();
  }

  function FechaCancelacion({
    fecha,
  }) {
    if (!fecha) {
      return "Sin fecha";
    }

    return new Date(
      fecha
    ).toLocaleString("es-AR");
  }

  return (
    <PageShell
      eyebrow="Historial"
      title="Cancelados"
    >
      <AdminSection
        eyebrow={panelType}
        title="Pedidos cancelados"
        action="Actualizar"
        onAction={cargarCancelados}
      >
        {loading && (
          <p className="text-sm text-neutral-500">
            Cargando...
          </p>
        )}

        {error && (
          <p className="mb-4 text-sm text-red-500">
            {error}
          </p>
        )}

        <div className="grid gap-3">
          {!loading &&
            pedidos.length === 0 && (
              <p className="text-sm text-neutral-500">
                No hay pedidos
                cancelados.
              </p>
            )}

          {pedidos.map(
            (pedido) => (
              <div
                key={pedido.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold">
                      Pedido #{pedido.id} -{" "}
                      {pedido.nombre}
                    </h3>

                    <p className="mt-1 text-sm text-neutral-400">
                      {pedido.sucursal} ·{" "}
                      {
                        pedido.tipo_entrega
                      }
                    </p>

                    <p className="mt-2 text-sm text-neutral-400">
                      Cancelado por:{" "}
                      {pedido.cancelado_por ||
                        "Sin especificar"}
                    </p>

                    <p className="text-xs text-neutral-500">
                      <FechaCancelacion
                        fecha={
                          pedido.cancelado_at
                        }
                      />
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setConfirmarEliminar(
                        {
                          tipo: "pedido",
                          id: pedido.id,
                        }
                      )
                    }
                    className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </AdminSection>

      <AdminSection
        eyebrow={panelType}
        title="Reservas canceladas"
      >
        <div className="grid gap-3">
          {!loading &&
            reservas.length ===
              0 && (
              <p className="text-sm text-neutral-500">
                No hay reservas
                canceladas.
              </p>
            )}

          {reservas.map(
            (reserva) => (
              <div
                key={reserva.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold">
                      Reserva #
                      {reserva.id} -{" "}
                      {reserva.nombre}
                    </h3>

                    <p className="mt-1 text-sm text-neutral-400">
                      {
                        reserva.sucursal
                      }{" "}
                      · {reserva.fecha} ·{" "}
                      {reserva.hora}
                    </p>

                    <p className="mt-2 text-sm text-neutral-400">
                      Cancelada por:{" "}
                      {reserva.cancelado_por ||
                        "Sin especificar"}
                    </p>

                    <p className="text-xs text-neutral-500">
                      <FechaCancelacion
                        fecha={
                          reserva.cancelado_at
                        }
                      />
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setConfirmarEliminar(
                        {
                          tipo:
                            "reserva",
                          id: reserva.id,
                        }
                      )
                    }
                    className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </AdminSection>

      {confirmarEliminar && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-black/80 px-4 py-4 sm:items-center sm:py-6">
          <div className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl border border-white/10 bg-[#111111] p-5 sm:max-h-[calc(100dvh-3rem)] sm:p-7">
            <h2 className="text-xl font-black">
              Eliminar definitivamente
            </h2>

            <p className="mt-3 text-sm text-neutral-400">
              Esta acción eliminará el
              registro de Supabase y no se
              puede deshacer.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setConfirmarEliminar(
                    null
                  )
                }
                className="rounded-xl border border-white/10 px-4 py-3 font-bold"
              >
                Volver
              </button>

              <button
                type="button"
                disabled={
                  eliminando !== null
                }
                onClick={
                  eliminarDefinitivamente
                }
                className="rounded-xl bg-red-600 px-4 py-3 font-black text-white disabled:opacity-50"
              >
                {eliminando
                  ? "Eliminando..."
                  : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
