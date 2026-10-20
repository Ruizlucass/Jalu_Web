
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../../supabase.js";
import { panelConfigs } from "../data/adminData.js";
import { PageShell } from "../components/AdminUi.jsx";
import { downloadPdf } from "../utils/downloadPdf.js";
import { FaFilePdf } from "react-icons/fa";

const moneyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("es-AR");
const statusColors = {
  pendiente: "#ff7278",
  confirmado: "#e71921",
  finalizado: "#a80f17",
  cancelado: "#66666b",
  otros: "#d43a40",
};

function formatMoney(value) {
  return moneyFormatter.format(Number(value) || 0);
}

function formatDateTime(value) {
  if (!value) return "Fecha no disponible";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function reportRange(period) {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (period === "week") {
    const daysSinceMonday = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - daysSinceMonday);
  }

  const end = new Date(start);
  end.setDate(end.getDate() + (period === "week" ? 7 : 1));
  const endDay = new Date(end);
  endDay.setDate(endDay.getDate() - 1);

  const formatDate = (date) => new Intl.DateTimeFormat("es-AR", {
    dateStyle: "long",
  }).format(date);

  return {
    start,
    end,
    startKey: localDateKey(start),
    endKey: localDateKey(end),
    label: period === "week"
      ? `${formatDate(start)} al ${formatDate(endDay)}`
      : formatDate(start),
    fileKey: localDateKey(start),
  };
}

function occursInRange(value, start, end) {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date >= start && date < end;
}

function summarizeReportStatuses(records) {
  const counts = new Map();
  records.forEach((record) => {
    const status = String(record.estado || "pendiente").toLowerCase();
    counts.set(status, (counts.get(status) || 0) + 1);
  });
  return [...counts.entries()].map(([status, count]) => `${status}: ${numberFormatter.format(count)}`);
}

function isFinalized(status) {
  return String(status || "").toLowerCase() === "finalizado";
}

function isCancelled(status) {
  return String(status || "").toLowerCase() === "cancelado";
}

function summarizeStatuses(records) {
  const counts = new Map();
  records.forEach((record) => {
    const status = String(record.estado || "pendiente").toLowerCase();
    counts.set(status, (counts.get(status) || 0) + 1);
  });

  return [...counts.entries()]
    .sort(([first], [second]) => first.localeCompare(second, "es"))
    .map(([label, value]) => ({
      label,
      value,
      color: statusColors[label] || statusColors.otros,
    }));
}

function DonutCard({ title, caption, items, loading }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const radius = 43;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <section className="overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#191919] via-[#121212] to-[#0d0d0d] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.35)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#ff5b62]">Distribución</p>
          <h2 className="mt-2 text-lg font-black text-white">{title}</h2>
          <p className="mt-1 text-xs font-medium text-gray-500">{caption}</p>
        </div>
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl border border-[#e71921]/20 bg-[#e71921]/10 text-[#ff5b62]" aria-hidden="true">◌</span>
      </div>

      {loading ? (
        <p className="mt-8 text-sm font-bold text-gray-500">Calculando distribución...</p>
      ) : total === 0 ? (
        <p className="mt-8 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-sm font-bold text-gray-500">Todavía no hay registros para mostrar.</p>
      ) : (
        <div className="mt-6 grid min-w-0 grid-cols-1 items-center gap-4 sm:grid-cols-[minmax(120px,0.9fr)_minmax(0,1.1fr)] sm:gap-6">
          <div className="relative mx-auto aspect-square w-full max-w-[176px]" role="img" aria-label={`${title}: ${items.map((item) => `${item.label} ${item.value}`).join(", ")}`}>
            <svg viewBox="0 0 112 112" className="h-full w-full -rotate-90 drop-shadow-[0_10px_24px_rgba(0,0,0,0.25)]" aria-hidden="true">
              <circle cx="56" cy="56" r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="12" />
              {items.map((item) => {
                const segment = total ? (item.value / total) * circumference : 0;
                const circle = (
                  <circle
                    key={item.label}
                    cx="56"
                    cy="56"
                    r={radius}
                    fill="none"
                    stroke={item.color}
                    strokeWidth="12"
                    strokeDasharray={`${segment} ${circumference - segment}`}
                    strokeDashoffset={-offset}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                );
                offset += segment;
                return circle;
              })}
            </svg>
            <div className="absolute inset-0 grid place-content-center text-center">
              <span className="text-3xl font-black tracking-tight text-white">{numberFormatter.format(total)}</span>
              <span className="mt-0.5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Total</span>
            </div>
          </div>
          <ul className="grid gap-3">
            {items.map((item) => (
              <li key={item.label} className="flex min-w-0 items-center gap-2.5">
                <span className="size-2.5 shrink-0 rounded-full shadow-[0_0_12px_currentColor]" style={{ backgroundColor: item.color, color: item.color }} aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate text-xs font-bold capitalize text-gray-400">{item.label}</span>
                <span className="text-sm font-black tabular-nums text-white">{numberFormatter.format(item.value)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function StatCard({ label, value, detail, symbol }) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#191919] to-[#101010] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.3)] transition duration-300 hover:-translate-y-1 hover:border-[#e71921]/35">
      <div className="pointer-events-none absolute -right-10 -top-12 size-36 rounded-full bg-[#e71921]/[0.08] blur-2xl transition group-hover:bg-[#e71921]/[0.15]" />
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-bold text-[#b9b9b9]">
          {label}
        </p>

        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#e71921]/25 bg-[#e71921]/10 text-lg font-black text-[#ff5b62]">
          {symbol}
        </span>
      </div>

      <p className="relative mt-5 break-words text-3xl font-black tracking-tight text-white sm:text-4xl">
        {value}
      </p>

      <p className="relative mt-2 text-xs font-medium leading-5 text-gray-500">
        {detail}
      </p>
    </article>
  );
}

function StatusPill({ status }) {
  const normalized = String(status || "pendiente").toLowerCase();

  const styles = {
    pendiente: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    confirmado: "border-sky-400/30 bg-sky-400/10 text-sky-300",
    finalizado: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    cancelado: "border-red-400/30 bg-red-400/10 text-red-300",
  };

  return (
    <span
      className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-[10px] font-black uppercase ${
        styles[normalized] ||
        "border-white/10 bg-white/5 text-gray-300"
      }`}
    >
      {normalized}
    </span>
  );
}

function EmptyState({ children }) {
  return (
    <p className="rounded-lg border border-white/5 bg-white/[0.03] p-4 text-sm font-bold text-neutral-500">
      {children}
    </p>
  );
}

export default function Dashboard({ panelType = "admin" }) {
  const config = panelConfigs[panelType] || panelConfigs.admin;

  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [ordersResult, reservationsResult] = await Promise.all([
        supabase
          .from("pedidos")
          .select(
            "id, estado, total, created_at, finalizado_at, cancelado_at, nombre, sucursal"
          )
          .order("created_at", { ascending: false }),

        supabase
          .from("reservas")
          .select(
            "id, estado, fecha, hora, personas, created_at, nombre, sucursal"
          )
          .order("fecha", { ascending: true })
          .order("hora", { ascending: true }),
      ]);

      if (ordersResult.error) {
        throw ordersResult.error;
      }

      if (reservationsResult.error) {
        throw reservationsResult.error;
      }

      setOrders(ordersResult.data || []);
      setReservations(reservationsResult.data || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error cargando el Dashboard:", err);

      setError(
        "No se pudieron cargar las estadísticas. Verificá la conexión con Supabase y los permisos de lectura de pedidos y reservas."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now);

    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const monthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const ordersToday = orders.filter((order) => {
      if (!order.created_at || isCancelled(order.estado)) {
        return false;
      }

      const created = new Date(order.created_at);

      return created >= today && created < tomorrow;
    }).length;

    const pendingOrders = orders.filter((order) => {
      const status = String(
        order.estado || "pendiente"
      ).toLowerCase();

      return status === "pendiente" || status === "confirmado";
    }).length;

    const pendingReservations = reservations.filter(
      (reservation) =>
        String(reservation.estado || "pendiente").toLowerCase() ===
        "pendiente"
    ).length;

    const finalizedThisMonth = orders.filter((order) => {
      if (!isFinalized(order.estado)) {
        return false;
      }

      const dateValue = order.finalizado_at || order.created_at;

      if (!dateValue) {
        return false;
      }

      const date = new Date(dateValue);

      return date >= monthStart && date <= now;
    });

    const revenueThisMonth = finalizedThisMonth.reduce(
      (total, order) => total + (Number(order.total) || 0),
      0
    );

    const chartDays = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(today);

      day.setDate(today.getDate() - (6 - index));

      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);

      const dayOrders = orders.filter((order) => {
        if (!isFinalized(order.estado)) {
          return false;
        }

        const dateValue = order.finalizado_at || order.created_at;

        if (!dateValue) {
          return false;
        }

        const date = new Date(dateValue);

        return date >= day && date < nextDay;
      });

      return {
        key: localDateKey(day),
        label: new Intl.DateTimeFormat("es-AR", {
          weekday: "short",
          day: "2-digit",
        }).format(day),
        revenue: dayOrders.reduce(
          (total, order) => total + (Number(order.total) || 0),
          0
        ),
        count: dayOrders.length,
      };
    });

    const maxRevenue = Math.max(
      ...chartDays.map((day) => day.revenue),
      1
    );

    return {
      ordersToday,
      pendingOrders,
      pendingReservations,
      revenueThisMonth,
      finalizedThisMonth: finalizedThisMonth.length,
      orderStatuses: summarizeStatuses(orders),
      reservationStatuses: summarizeStatuses(reservations),

      chartDays: chartDays.map((day) => ({
        ...day,
        height:
          day.revenue > 0
            ? Math.max((day.revenue / maxRevenue) * 100, 6)
            : 0,
      })),
    };
  }, [orders, reservations]);

  const recentOrders = useMemo(
    () => orders.slice(0, 6),
    [orders]
  );

  const upcomingReservations = useMemo(() => {
    const today = localDateKey();

    return reservations
      .filter((reservation) => {
        const status = String(
          reservation.estado || "pendiente"
        ).toLowerCase();

        return (
          reservation.fecha >= today &&
          status !== "finalizado" &&
          status !== "cancelado"
        );
      })
      .slice(0, 5);
  }, [reservations]);

  function descargarInforme(period) {
    const range = reportRange(period);
    const periodOrders = orders.filter((order) => {
      const status = String(order.estado || "pendiente").toLowerCase();
      const eventDate = status === "finalizado"
        ? order.finalizado_at || order.created_at
        : status === "cancelado"
          ? order.cancelado_at || order.created_at
          : order.created_at;
      return occursInRange(eventDate, range.start, range.end);
    });
    const periodReservations = reservations.filter((reservation) => {
      if (reservation.fecha) {
        return reservation.fecha >= range.startKey && reservation.fecha < range.endKey;
      }
      return occursInRange(reservation.created_at, range.start, range.end);
    });
    const finalizedOrders = periodOrders.filter((order) => isFinalized(order.estado));
    const finalizedRevenue = finalizedOrders.reduce(
      (sum, order) => sum + (Number(order.total) || 0),
      0
    );
    const reportTitle = period === "week" ? "Informe semanal del dashboard" : "Informe diario del dashboard";
    const lines = [
      `Periodo: ${range.label}`,
      `Generado: ${formatDateTime(new Date())}`,
      "",
      "RESUMEN",
      `Indicador del dashboard · Pedidos de hoy: ${numberFormatter.format(stats.ordersToday)}`,
      `Indicador del dashboard · Ventas del mes: ${formatMoney(stats.revenueThisMonth)}`,
      `Indicador del dashboard · Pedidos por atender: ${numberFormatter.format(stats.pendingOrders)}`,
      `Indicador del dashboard · Reservas pendientes: ${numberFormatter.format(stats.pendingReservations)}`,
      `Pedidos del periodo: ${numberFormatter.format(periodOrders.length)}`,
      ...summarizeReportStatuses(periodOrders).map((summary) => `Pedidos ${summary}`),
      `Ventas de pedidos finalizados en el periodo: ${formatMoney(finalizedRevenue)}`,
      `Pedidos pendientes o confirmados al generar el informe: ${numberFormatter.format(stats.pendingOrders)}`,
      `Reservas programadas en el periodo: ${numberFormatter.format(periodReservations.length)}`,
      ...summarizeReportStatuses(periodReservations).map((summary) => `Reservas ${summary}`),
      `Reservas pendientes al generar el informe: ${numberFormatter.format(stats.pendingReservations)}`,
      "",
      "VENTAS FINALIZADAS · ÚLTIMOS 7 DÍAS",
      ...stats.chartDays.map((day) => `${day.label}: ${formatMoney(day.revenue)} · ${numberFormatter.format(day.count)} pedidos`),
      "",
      "DETALLE DE PEDIDOS",
      ...(periodOrders.length
        ? periodOrders.map((order) => {
            const status = String(order.estado || "pendiente").toLowerCase();
            const eventDate = status === "finalizado"
              ? order.finalizado_at || order.created_at
              : status === "cancelado"
                ? order.cancelado_at || order.created_at
                : order.created_at;
            return `Pedido #${order.id} | ${order.nombre || "Cliente"} | ${order.sucursal || "Sin sucursal"} | ${status} | ${formatMoney(order.total)} | ${formatDateTime(eventDate)}`;
          })
        : ["No hubo pedidos en este periodo."]),
      "",
      "DETALLE DE RESERVAS",
      ...(periodReservations.length
        ? periodReservations.map((reservation) =>
            `Reserva #${reservation.id} | ${reservation.nombre || "Cliente"} | ${reservation.sucursal || "Sin sucursal"} | ${reservation.fecha || "Sin fecha"} ${String(reservation.hora || "").slice(0, 5)} | ${Number(reservation.personas) || 0} personas | ${String(reservation.estado || "pendiente").toLowerCase()}`
          )
        : ["No hubo reservas programadas en este periodo."]),
    ];

    downloadPdf({
      filename: `jalu-informe-${period === "week" ? "semanal" : "diario"}-${range.fileKey}.pdf`,
      title: reportTitle,
      subtitle: `Jalu Comidas Árabes · ${range.label}`,
      lines,
    });
  }

  return (
    <PageShell
      eyebrow={config.label}
      title={
        config.title === "Panel Superadmin"
          ? "Dashboard general"
          : "Dashboard"
      }
      description="Resumen de la actividad de Jalu Comidas Árabes con información obtenida de los pedidos y las reservas registrados."
    >
      <div className="flex min-w-0 flex-col items-stretch justify-between gap-3 rounded-2xl border border-white/[0.07] bg-gradient-to-r from-[#171717] to-[#101010] px-4 py-3 shadow-[0_12px_34px_rgba(0,0,0,0.28)] sm:flex-row sm:items-center sm:px-5">
        <p className="min-w-0 break-words text-xs font-bold text-gray-500">
          {lastUpdated
            ? `Última actualización: ${formatDateTime(lastUpdated)}`
            : "Las estadísticas se actualizan al cargar esta pantalla."}
        </p>

        <button
          type="button"
          onClick={loadDashboard}
          disabled={loading}
          className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-[#ff5b62]/30 bg-[#e71921] px-4 text-xs font-black uppercase text-white shadow-[0_8px_24px_rgba(231,25,33,0.22)] transition hover:bg-[#ff2a33] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {loading ? "Actualizando..." : "Actualizar estadísticas"}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-pink-400/25 bg-pink-400/[0.08] p-4 text-sm font-bold leading-6 text-pink-200"
        >
          {error}
        </div>
      )}

      <section
        aria-label="Indicadores principales"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4"
      >
        <StatCard
          label="Pedidos de hoy"
          value={
            loading ? "—" : numberFormatter.format(stats.ordersToday)
          }
          detail="Pedidos registrados hoy, sin contar los cancelados."
          symbol="↗"
        />

        <StatCard
          label="Ventas del mes"
          value={
            loading ? "—" : formatMoney(stats.revenueThisMonth)
          }
          detail="Suma de pedidos finalizados durante el mes actual."
          symbol="$"
        />

        <StatCard
          label="Pedidos por atender"
          value={
            loading ? "—" : numberFormatter.format(stats.pendingOrders)
          }
          detail="Pedidos pendientes o confirmados que aún no se finalizaron."
          symbol="▣"
        />

        <StatCard
          label="Reservas pendientes"
          value={
            loading
              ? "—"
              : numberFormatter.format(stats.pendingReservations)
          }
          detail="Reservas que todavía necesitan confirmación."
          symbol="◷"
        />
      </section>

      <section aria-label="Distribución por estado" className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
        <DonutCard
          title="Estado de pedidos"
          caption="Todos los pedidos cargados"
          items={stats.orderStatuses}
          loading={loading}
        />
        <DonutCard
          title="Estado de reservas"
          caption="Todas las reservas cargadas"
          items={stats.reservationStatuses}
          loading={loading}
        />
      </section>

      <section className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,1fr)]">
        <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#191919] via-[#121212] to-[#0d0d0d] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.35)] sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#ff5b62]">
                Rendimiento
              </p>

              <h2 className="mt-2 text-lg font-black text-white">
                Ventas de los últimos 7 días
              </h2>
            </div>

            <div className="text-right">
              <p className="text-2xl font-black text-white">
                {loading
                  ? "—"
                  : numberFormatter.format(stats.finalizedThisMonth)}
              </p>

              <p className="text-xs font-bold text-gray-500">
                Pedidos finalizados este mes
              </p>
            </div>
          </div>

          {loading ? (
            <p className="mt-8 text-sm font-bold text-gray-500">
              Calculando estadísticas...
            </p>
          ) : (
            <div className="mt-7">
              <div
                className="flex h-44 items-end gap-2 rounded-2xl border border-white/[0.06] bg-black/30 px-3 pb-2 pt-3 sm:gap-3"
                aria-label="Gráfico de ventas por día"
              >
                {stats.chartDays.map((day) => (
                  <div
                    key={day.key}
                    className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                    title={`${day.label}: ${formatMoney(day.revenue)} (${day.count} pedidos)`}
                  >
                    <span className="max-w-full truncate text-[10px] font-bold text-gray-300">
                      {day.revenue > 0
                        ? formatMoney(day.revenue)
                        : "—"}
                    </span>

                    <div className="flex h-32 w-full items-end overflow-hidden rounded-t-lg bg-white/[0.04]">
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-[#a80f17] via-[#e71921] to-[#ff777d] shadow-[0_0_20px_rgba(231,25,33,0.2)] transition-all"
                        style={{ height: `${day.height}%` }}
                      />
                    </div>

                    <span className="text-[10px] font-bold capitalize text-gray-500 sm:text-xs">
                      {day.label}
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-xs leading-5 text-gray-500">
                El gráfico suma únicamente pedidos finalizados.
                Los días sin ventas registradas aparecen sin barra.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#191919] via-[#121212] to-[#0d0d0d] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.35)] sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#ff5b62]">
                Agenda
              </p>

              <h2 className="mt-2 text-lg font-black text-white">
                Próximas reservas
              </h2>
            </div>

            <a
              href={`${config.basePath}/reservas`}
              className="rounded-full border border-[#e71921]/25 bg-[#e71921]/[0.07] px-3 py-2 text-[10px] font-black uppercase tracking-wider text-[#ff777d] transition hover:bg-[#e71921]/[0.14]"
            >
              Ver todas
            </a>
          </div>

          {loading ? (
            <p className="text-sm font-bold text-gray-500">
              Cargando reservas...
            </p>
          ) : upcomingReservations.length === 0 ? (
            <EmptyState>
              No hay reservas futuras pendientes o confirmadas.
            </EmptyState>
          ) : (
            <div className="grid gap-3">
              {upcomingReservations.map((reservation) => (
                <article
                  key={reservation.id}
                  className="rounded-2xl border border-white/[0.06] bg-black/25 p-3 transition hover:border-[#e71921]/20"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="font-black text-white">
                      {reservation.nombre || "Cliente"}
                    </p>

                    <StatusPill status={reservation.estado} />
                  </div>

                  <p className="mt-1 text-xs font-bold text-gray-400">
                    {reservation.fecha || "Fecha sin definir"}
                    {reservation.hora
                      ? ` · ${String(reservation.hora).slice(0, 5)}`
                      : ""}
                  </p>

                  <p className="mt-1 text-xs font-bold text-gray-500">
                    {Number(reservation.personas) || 0} personas
                    {reservation.sucursal
                      ? ` · ${reservation.sucursal}`
                      : ""}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#191919] via-[#121212] to-[#0d0d0d] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.35)] sm:p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#ff5b62]">
              Actividad reciente
            </p>

            <h2 className="mt-2 text-lg font-black text-white">
              Últimos pedidos
            </h2>
          </div>

          <a
            href={`${config.basePath}/pedidos`}
            className="rounded-full border border-[#e71921]/25 bg-[#e71921]/[0.07] px-3 py-2 text-[10px] font-black uppercase tracking-wider text-[#ff777d] transition hover:bg-[#e71921]/[0.14]"
          >
            Ir a pedidos
          </a>
        </div>

        {loading ? (
          <p className="text-sm font-bold text-gray-500">
            Cargando pedidos...
          </p>
        ) : recentOrders.length === 0 ? (
          <EmptyState>
            Todavía no hay pedidos registrados.
          </EmptyState>
        ) : (
        <div className="max-w-full overflow-x-auto overscroll-x-contain">
            <table className="w-full min-w-[600px] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-wider text-gray-500">
                  <th className="px-3 py-3">Pedido</th>
                  <th className="px-3 py-3">Cliente</th>
                  <th className="px-3 py-3">Fecha</th>
                  <th className="px-3 py-3">Total</th>
                  <th className="px-3 py-3">Estado</th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-white/[0.06] transition hover:bg-white/[0.025] last:border-0"
                  >
                    <td className="px-3 py-4 text-sm font-black text-white">
                      #{String(order.id).slice(0, 8)}
                    </td>

                    <td className="px-3 py-4 text-sm font-bold text-gray-300">
                      {order.nombre || "Cliente"}
                    </td>

                    <td className="px-3 py-4 text-xs font-bold text-gray-500">
                      {formatDateTime(order.created_at)}
                    </td>

                    <td className="px-3 py-4 text-sm font-black text-white">
                      {formatMoney(order.total)}
                    </td>

                    <td className="px-3 py-4">
                      <StatusPill status={order.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#191919] via-[#121212] to-[#0d0d0d] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.35)] sm:p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#ff5b62]">
          Reportes
        </p>
        <h2 className="mt-2 text-lg font-black text-white">
          Descargar información del dashboard
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
          Generá un PDF con los indicadores, los pedidos y las reservas del día o de la semana actual.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => descargarInforme("day")}
            disabled={loading || Boolean(error)}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#e71921] px-4 text-xs font-black uppercase text-white shadow-[0_8px_24px_rgba(231,25,33,0.2)] transition hover:bg-[#ff2a33] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaFilePdf aria-hidden="true" />
            Descargar PDF del día
          </button>
          <button
            type="button"
            onClick={() => descargarInforme("week")}
            disabled={loading || Boolean(error)}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#e71921]/50 bg-[#e71921]/10 px-4 text-xs font-black uppercase text-[#ff777d] transition hover:bg-[#e71921]/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaFilePdf aria-hidden="true" />
            Descargar PDF de la semana
          </button>
        </div>
      </section>
    </PageShell>
  );
}
