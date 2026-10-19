import { useEffect, useState } from "react";
import { panelConfigs } from "../data/adminData.js";
import { AdminSection, DetailCard, PageShell } from "../components/AdminUi.jsx";
import { supabase } from "../../supabase.js";
import { FaBan, FaCalendarAlt, FaShoppingBag } from "react-icons/fa";
import {
  ActivityDateFilter,
  activityRangeBounds,
  useActivityDate,
} from "../components/ActivityDateFilter.jsx";

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
  const [cancelledOrders, setCancelledOrders] = useState([]);
  const [cancelledReservations, setCancelledReservations] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activityDate, setActivityDate, activityPeriod, setActivityPeriod] = useActivityDate();

  useEffect(() => {
    cargarFinalizados();
  }, []);

  async function cargarFinalizados() {
    setLoading(true);
    setError("");

    const [
      ordersResult,
      cancelledOrdersResult,
      reservationsResult,
      cancelledReservationsResult,
    ] = await Promise.all([
      supabase
        .from("pedidos")
        .select("*")
        .eq("estado", "finalizado")
        .order("created_at", { ascending: false }),
      supabase
        .from("pedidos")
        .select("*")
        .eq("estado", "cancelado")
        .order("cancelado_at", { ascending: false }),
      supabase
        .from("reservas")
        .select("*")
        .eq("estado", "finalizado")
        .order("created_at", { ascending: false }),
      supabase
        .from("reservas")
        .select("*")
        .eq("estado", "cancelado")
        .order("cancelado_at", { ascending: false }),
    ]);

    if (
      ordersResult.error ||
      cancelledOrdersResult.error ||
      reservationsResult.error ||
      cancelledReservationsResult.error
    ) {
      console.error(
        "Error cargando historial:",
        ordersResult.error ||
          cancelledOrdersResult.error ||
          reservationsResult.error ||
          cancelledReservationsResult.error
      );
      setError("No se pudo cargar el historial de finalizados.");
      setLoading(false);
      return;
    }

    setOrders(ordersResult.data || []);
    setCancelledOrders(cancelledOrdersResult.data || []);
    setReservations(reservationsResult.data || []);
    setCancelledReservations(cancelledReservationsResult.data || []);
    setLoading(false);
  }

  const { start, end } = activityRangeBounds(activityPeriod, activityDate);
  const filteredOrders = orders.filter((order) => {
    const completedAt = order.finalizado_at || order.created_at;
    return completedAt && completedAt >= start && completedAt < end;
  });
  const filteredCancelledOrders = cancelledOrders.filter((order) => {
    const cancelledAt = order.cancelado_at || order.created_at;
    return cancelledAt && cancelledAt >= start && cancelledAt < end;
  });
  const filteredCancelledReservations = cancelledReservations.filter((reservation) => {
    const cancelledAt = reservation.cancelado_at || reservation.created_at;
    return cancelledAt && cancelledAt >= start && cancelledAt < end;
  });
  const filteredReservations = reservations.filter((reservation) => {
    const completedAt = reservation.finalizado_at || reservation.created_at;
    return completedAt && completedAt >= start && completedAt < end;
  });
  const records =
    activeTab === "pedidos"
      ? filteredOrders
      : activeTab === "cancelados"
        ? [...filteredCancelledOrders, ...filteredCancelledReservations]
        : filteredReservations;

  return (
    <PageShell
      eyebrow="Historial"
      title="Finalizados"
      description="Consultá pedidos y reservas finalizados o cancelados por fecha."
    >
      <ActivityDateFilter
        date={activityDate}
        onChange={setActivityDate}
        period={activityPeriod}
        onPeriodChange={setActivityPeriod}
      />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button
          type="button"
          aria-pressed={activeTab === "pedidos"}
          onClick={() => setActiveTab("pedidos")}
          className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-black uppercase transition duration-200 hover:-translate-y-0.5 ${
            activeTab === "pedidos"
              ? "bg-gradient-to-r from-[#e71921] to-[#b90e16] text-white shadow-[0_10px_25px_rgba(231,25,33,0.2)]"
              : "border border-white/[0.08] bg-white/[0.035] text-[#aaa] hover:border-white/15 hover:bg-white/[0.07] hover:text-white"
          }`}
        >
          <FaShoppingBag aria-hidden="true" />
          <span>Pedidos finalizados</span>
          <span className="rounded-full bg-black/20 px-2 py-1 text-[10px]">{filteredOrders.length}</span>
        </button>

        <button
          type="button"
          aria-pressed={activeTab === "reservas"}
          onClick={() => setActiveTab("reservas")}
          className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-black uppercase transition duration-200 hover:-translate-y-0.5 ${
            activeTab === "reservas"
              ? "bg-gradient-to-r from-[#e71921] to-[#b90e16] text-white shadow-[0_10px_25px_rgba(231,25,33,0.2)]"
              : "border border-white/[0.08] bg-white/[0.035] text-[#aaa] hover:border-white/15 hover:bg-white/[0.07] hover:text-white"
          }`}
        >
          <FaCalendarAlt aria-hidden="true" />
          <span>Reservas finalizadas</span>
          <span className="rounded-full bg-black/20 px-2 py-1 text-[10px]">{filteredReservations.length}</span>
        </button>

        <button
          type="button"
          aria-pressed={activeTab === "cancelados"}
          onClick={() => setActiveTab("cancelados")}
          className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-black uppercase transition duration-200 hover:-translate-y-0.5 ${
            activeTab === "cancelados"
              ? "bg-gradient-to-r from-[#e71921] to-[#b90e16] text-white shadow-[0_10px_25px_rgba(231,25,33,0.2)]"
              : "border border-white/[0.08] bg-white/[0.035] text-[#aaa] hover:border-white/15 hover:bg-white/[0.07] hover:text-white"
          }`}
        >
          <FaBan aria-hidden="true" />
          <span>Cancelados</span>
          <span className="rounded-full bg-black/20 px-2 py-1 text-[10px]">{filteredCancelledOrders.length + filteredCancelledReservations.length}</span>
        </button>
      </div>

      <AdminSection
        eyebrow={config.label}
        title={
          activeTab === "pedidos"
            ? "Detalle de pedidos finalizados"
            : activeTab === "cancelados"
              ? "Pedidos y reservas cancelados"
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
            {activeTab === "cancelados"
              ? "Todavía no hay pedidos ni reservas cancelados para esta fecha."
              : `Todavía no hay ${activeTab} finalizados para esta fecha.`}
          </p>
        )}

        <div className="grid gap-4">
          {activeTab === "pedidos" &&
            filteredOrders.map((order) => (
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

          {activeTab === "cancelados" &&
            filteredCancelledOrders.map((order) => (
              <DetailCard
                key={order.id}
                title={`Pedido #${String(order.id).slice(0, 8)} · ${order.nombre || "Cliente"}`}
                subtitle={`Cancelado: ${formatDateTime(
                  order.cancelado_at || order.created_at
                )}`}
                status="cancelado"
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
                        : "Retiro en sucursal",
                  },
                  { label: "Total", value: formatMoney(order.total) },
                  { label: "Cancelado por", value: order.cancelado_por },
                ]}
                descriptionLabel="Descripción del pedido y observaciones"
                description={
                  [order.descripcion, order.observaciones].filter(Boolean).join("\n\n") || null
                }
              />
            ))}

          {activeTab === "cancelados" &&
            filteredCancelledReservations.map((reservation) => (
              <DetailCard
                key={`reserva-${reservation.id}`}
                title={`Reserva · ${reservation.nombre || "Cliente"}`}
                subtitle={`Cancelada: ${formatDateTime(
                  reservation.cancelado_at || reservation.created_at
                )}`}
                status="cancelado"
                fields={[
                  { label: "Fecha de reserva", value: formatReservationDate(reservation.fecha) },
                  { label: "Hora", value: reservation.hora?.slice(0, 5) },
                  { label: "Personas", value: `${reservation.personas || 0} personas` },
                  { label: "Sucursal", value: reservation.sucursal },
                  { label: "Teléfono", value: reservation.telefono },
                  { label: "Email", value: reservation.email },
                  { label: "Cancelada por", value: reservation.cancelado_por },
                ]}
                descriptionLabel="Comentarios de la reserva"
                description={reservation.comentarios}
              />
            ))}

          {activeTab === "reservas" &&
            filteredReservations.map((reservation) => (
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
