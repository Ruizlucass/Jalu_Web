import { useEffect, useState } from "react";
import { panelConfigs } from "../data/adminData.js";
import { AdminSection, DetailCard, PageShell } from "../components/AdminUi.jsx";
import { supabase } from "../../supabase.js";

function formatDateTime(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatReservationDate(value) {
  if (!value) return "—";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("es-AR").format(
    new Date(year, month - 1, day, 12)
  );
}

function formatMoney(value) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default function Completed({ panelType = "admin" }) {
  const config = panelConfigs[panelType] || panelConfigs.admin;
  const [activeTab, setActiveTab] = useState("pedidos");
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarFinalizados();
  }, []);

  async function cargarFinalizados() {
    setLoading(true);
    setError("");

    const [ordersResult, reservationsResult] = await Promise.all([
      supabase
        .from("pedidos")
        .select("*")
        .eq("estado", "finalizado")
        .order("created_at", { ascending: false }),
      supabase
        .from("reservas")
        .select("*")
        .eq("estado", "finalizado")
        .order("created_at", { ascending: false }),
    ]);

    if (ordersResult.error || reservationsResult.error) {
      console.error(
        "Error cargando historial:",
        ordersResult.error || reservationsResult.error
      );
      setError("No se pudo cargar el historial de finalizados.");
      setLoading(false);
      return;
    }

    setOrders(ordersResult.data || []);
    setReservations(reservationsResult.data || []);
    setLoading(false);
  }

  const records = activeTab === "pedidos" ? orders : reservations;

  return (
    <PageShell
      eyebrow="Historial"
      title="Finalizados"
      description="Acá quedan guardados los pedidos entregados y las reservas completadas con todos sus detalles."
    >
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setActiveTab("pedidos")}
          className={`rounded-lg border px-4 py-3 text-xs font-black uppercase transition ${
            activeTab === "pedidos"
              ? "border-[#e71921] bg-[#e71921] text-white"
              : "border-white/10 bg-[#151515] text-[#b9b9b9] hover:text-white"
          }`}
        >
          Pedidos finalizados ({orders.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("reservas")}
          className={`rounded-lg border px-4 py-3 text-xs font-black uppercase transition ${
            activeTab === "reservas"
              ? "border-[#e71921] bg-[#e71921] text-white"
              : "border-white/10 bg-[#151515] text-[#b9b9b9] hover:text-white"
          }`}
        >
          Reservas finalizadas ({reservations.length})
        </button>
      </div>

      <AdminSection
        eyebrow={config.label}
        title={
          activeTab === "pedidos"
            ? "Detalle de pedidos finalizados"
            : "Detalle de reservas finalizadas"
        }
        action={loading ? "Actualizando..." : "Actualizar"}
        onAction={cargarFinalizados}
        actionDisabled={loading}
      >
        {loading && <p className="text-sm font-bold text-neutral-500">Cargando historial...</p>}

        {error && (
          <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-300">
            {error}
          </p>
        )}

        {!loading && records.length === 0 && (
          <p className="rounded-lg border border-white/5 bg-white/[0.03] p-5 text-sm font-bold text-neutral-500">
            Todavía no hay {activeTab} finalizados.
          </p>
        )}

        <div className="grid gap-4">
          {activeTab === "pedidos" &&
            orders.map((order) => (
              <DetailCard
                key={order.id}
                title={`Pedido #${String(order.id).slice(0, 8)} · ${order.nombre || "Cliente"}`}
                subtitle={`Finalizado: ${formatDateTime(
                  order.finalizado_at || order.created_at
                )}`}
                status="finalizado"
                fields={[
                  { label: "Teléfono", value: order.telefono },
                  { label: "Email", value: order.email },
                  { label: "Sucursal", value: order.sucursal },
                  {
                    label: "Entrega",
                    value: order.tipo_entrega === "delivery" ? "Delivery" : "Take Away",
                  },
                  {
                    label: "Dirección",
                    value:
                      order.tipo_entrega === "delivery"
                        ? order.direccion
                        : "Retiró en sucursal",
                  },
                  { label: "Total", value: formatMoney(order.total) },
                ]}
                descriptionLabel="Descripción del pedido y observaciones"
                description={
                  [order.descripcion, order.observaciones].filter(Boolean).join("\n\n") || null
                }
              />
            ))}

          {activeTab === "reservas" &&
            reservations.map((reservation) => (
              <DetailCard
                key={reservation.id}
                title={reservation.nombre || "Cliente"}
                subtitle={`Finalizada: ${formatDateTime(
                  reservation.finalizado_at || reservation.created_at
                )}`}
                status="finalizado"
                fields={[
                  {
                    label: "Fecha de reserva",
                    value: formatReservationDate(reservation.fecha),
                  },
                  { label: "Hora", value: reservation.hora?.slice(0, 5) },
                  {
                    label: "Personas",
                    value: `${reservation.personas || 0} personas`,
                  },
                  { label: "Sucursal", value: reservation.sucursal },
                  { label: "Teléfono", value: reservation.telefono },
                  { label: "Email", value: reservation.email },
                ]}
                descriptionLabel="Descripción y comentarios de la reserva"
                description={reservation.comentarios}
              />
            ))}
        </div>
      </AdminSection>
    </PageShell>
  );
}
