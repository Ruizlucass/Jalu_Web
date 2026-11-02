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

const PAGE_SIZE = 10;

function matchesDish(record, search) {
  const normalize = (value) => String(value || "")
    .toLocaleLowerCase("es-AR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const normalizedSearch = normalize(search.trim());
  if (!normalizedSearch) return true;

  const dishes = String(record.descripcion || "")
    .split(/\r?\n/)
    .map((line) => line.match(/^\s*\d+\s*x\s+(.+?)(?:\s+—\s+|$)/i)?.[1])
    .filter(Boolean);
  return dishes.some((dish) => normalize(dish).includes(normalizedSearch));
}

function Pagination({ page, pageCount, onPageChange }) {
  if (pageCount <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-3 pt-2" aria-label="Paginación de reportes">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="min-h-10 rounded-lg border border-white/10 px-4 text-xs font-black uppercase text-white transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Anterior
      </button>
      <span className="text-xs font-bold text-neutral-400" aria-live="polite">
        Página {page} de {pageCount}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page === pageCount}
        className="min-h-10 rounded-lg border border-white/10 px-4 text-xs font-black uppercase text-white transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Siguiente
      </button>
    </nav>
  );
}

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
  const [dishSearch, setDishSearch] = useState("");
  const [page, setPage] = useState(1);
  const [activityDate, setActivityDate, activityPeriod, setActivityPeriod, activityEndDate, setActivityEndDate] = useActivityDate();
  const [periodReferenceDate, setPeriodReferenceDate] = useState(activityDate);

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

  const { start, end, startDate, endDate } = activityRangeBounds(
    activityPeriod,
    activityDate,
    activityEndDate
  );
  const filteredOrders = orders.filter((order) => {
    const completedAt = order.finalizado_at || order.created_at;
    return completedAt && completedAt >= start && completedAt < end && matchesDish(order, dishSearch);
  });
  const filteredCancelledOrders = cancelledOrders.filter((order) => {
    const cancelledAt = order.cancelado_at || order.created_at;
    return cancelledAt && cancelledAt >= start && cancelledAt < end && matchesDish(order, dishSearch);
  });
  const filteredCancelledReservations = cancelledReservations.filter((reservation) => {
    const cancelledAt = reservation.cancelado_at || reservation.created_at;
    return !dishSearch.trim() && cancelledAt && cancelledAt >= start && cancelledAt < end;
  });
  const filteredReservations = reservations.filter((reservation) => {
    // Las reservas antiguas pueden no tener finalizado_at. En ese caso,
    // la fecha reservada es la referencia útil (created_at puede ser de otro día).
    const completedAt = reservation.finalizado_at || reservation.fecha || reservation.created_at;
    if (!completedAt) return false;

    if (/^\d{4}-\d{2}-\d{2}$/.test(completedAt)) {
      return completedAt >= startDate && completedAt < endDate;
    }

    const completedDate = new Date(completedAt);
    return completedDate >= new Date(start) && completedDate < new Date(end);
  });
  const records =
    activeTab === "pedidos"
      ? filteredOrders
      : activeTab === "cancelados"
        ? [...filteredCancelledOrders, ...filteredCancelledReservations]
        : filteredReservations;
  const completedOrderTotal = filteredOrders.reduce(
    (total, order) => total + (Number(order.total) || 0),
    0
  );
  const cancelledOrderTotal = filteredCancelledOrders.reduce(
    (total, order) => total + (Number(order.total) || 0),
    0
  );
  const reservationPeople = filteredReservations.reduce(
    (total, reservation) => total + (Number(reservation.personas) || 0),
    0
  );
  const totals =
    activeTab === "pedidos"
      ? [
          { label: "Pedidos finalizados", value: filteredOrders.length },
          { label: "Total vendido", value: formatMoney(completedOrderTotal) },
        ]
      : activeTab === "reservas"
        ? [
            { label: "Reservas finalizadas", value: filteredReservations.length },
            { label: "Personas", value: reservationPeople },
          ]
        : [
            { label: "Cancelaciones", value: records.length },
            { label: "Pedidos cancelados", value: filteredCancelledOrders.length },
            { label: "Reservas canceladas", value: filteredCancelledReservations.length },
            { label: "Importe de pedidos cancelados", value: formatMoney(cancelledOrderTotal) },
          ];
  const pageCount = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const paginatedReservations = filteredReservations.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [activeTab, activityDate, activityEndDate, activityPeriod, dishSearch]);

  useEffect(() => {
    if (activityPeriod === "day") setPeriodReferenceDate(activityDate);
  }, [activityDate, activityPeriod]);

  function changeActivityPeriod(period, rangeStart = activityDate, rangeEnd = activityEndDate) {
    if (period === "range") {
      setActivityDate(rangeStart);
      setActivityEndDate(rangeEnd);
      setPeriodReferenceDate(rangeStart);
      setActivityPeriod("range");
      return;
    }

    const bounds = activityRangeBounds(period, periodReferenceDate);
    setActivityDate(bounds.startDate);
    setActivityEndDate(bounds.throughDate);
    setActivityPeriod(period);
  }

  return (
    <PageShell
      eyebrow="Reportes"
      title="Reportes"
    >
      <ActivityDateFilter
        fromDate={activityDate}
        toDate={activityEndDate}
        period={activityPeriod}
        onPeriodChange={changeActivityPeriod}
      />

      <label className="grid gap-2 text-xs font-black uppercase tracking-wider text-[#b9b9b9]">
        Buscar por nombre de plato
        <input
          type="search"
          value={dishSearch}
          onChange={(event) => setDishSearch(event.target.value)}
          placeholder="Ej. Shawarma"
          disabled={activeTab === "reservas"}
          className="min-h-11 w-full rounded-lg border border-white/10 bg-[#0f0f0f] px-3 text-sm font-bold normal-case tracking-normal text-white placeholder:text-neutral-600 focus:border-[#e71921] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
      </label>

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
          onClick={() => {
            setActiveTab("reservas");
            setDishSearch("");
          }}
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

      <section
        aria-labelledby="report-totals-title"
        className="rounded-2xl border border-white/10 bg-[#101010] p-4 sm:p-5"
      >
        <div className="mb-4">
          <h2 id="report-totals-title" className="text-sm font-black uppercase tracking-wider text-white">
            Totales según los filtros
          </h2>
        </div>
        <div className={`grid gap-3 ${totals.length > 2 ? "sm:grid-cols-2 xl:grid-cols-4" : "sm:grid-cols-2"}`}>
          {totals.map((item) => (
            <article key={item.label} className="rounded-xl border border-white/[0.08] bg-white/[0.035] p-4">
              <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
                {item.label}
              </p>
              <p className="mt-2 text-2xl font-black text-white">
                {loading ? "—" : item.value}
              </p>
            </article>
          ))}
        </div>
      </section>

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
              ? "Todavía no hay pedidos ni reservas cancelados dentro del período seleccionado."
              : `Todavía no hay ${activeTab} finalizados dentro del período seleccionado.`}
          </p>
        )}

        <div className="grid gap-4">
        {activeTab === "pedidos" &&
            paginatedOrders.map((order) => (
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
            paginatedReservations.map((reservation) => (
              <DetailCard
                key={reservation.id}
                title={reservation.nombre || "Cliente"}
                subtitle={`Finalizada: ${reservation.finalizado_at
                  ? formatDateTime(reservation.finalizado_at)
                  : formatReservationDate(reservation.fecha)}`}
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
        {activeTab !== "cancelados" && !loading && (
          <Pagination page={currentPage} pageCount={pageCount} onPageChange={setPage} />
        )}
      </AdminSection>
    </PageShell>
  );
}
