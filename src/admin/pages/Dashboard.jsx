
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../../supabase.js";
import { panelConfigs } from "../data/adminData.js";
import { PageShell } from "../components/AdminUi.jsx";

const moneyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("es-AR");

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

function isFinalized(status) {
  return String(status || "").toLowerCase() === "finalizado";
}

function isCancelled(status) {
  return String(status || "").toLowerCase() === "cancelado";
}

function StatCard({ label, value, detail, symbol }) {
  return (
    <article className="rounded-xl border border-white/10 bg-[#151515] p-5 transition hover:border-[#e71921]/50">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-bold text-[#b9b9b9]">
          {label}
        </p>

        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e71921]/10 text-lg font-black text-[#e71921]">
          {symbol}
        </span>
      </div>

      <p className="mt-4 break-words text-3xl font-black text-white sm:text-4xl">
        {value}
      </p>

      <p className="mt-2 text-xs font-bold leading-5 text-gray-500">
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
            "id, estado, total, created_at, finalizado_at, nombre, sucursal"
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-bold text-gray-500">
          {lastUpdated
            ? `Última actualización: ${formatDateTime(lastUpdated)}`
            : "Las estadísticas se actualizan al cargar esta pantalla."}
        </p>

        <button
          type="button"
          onClick={loadDashboard}
          disabled={loading}
          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#e71921] bg-[#e71921] px-4 text-xs font-black uppercase text-white transition hover:bg-[#ff2a33] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Actualizando..." : "Actualizar estadísticas"}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm font-bold leading-6 text-red-300"
        >
          {error}
        </div>
      )}

      <section
        aria-label="Indicadores principales"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
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

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">
        <div className="rounded-xl border border-white/10 bg-[#151515] p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#e71921]">
                Rendimiento
              </p>

              <h2 className="mt-2 text-lg font-black uppercase text-white">
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
            <p className="mt-8 text-sm font-bold text-neutral-500">
              Calculando estadísticas...
            </p>
          ) : (
            <div className="mt-7">
              <div
                className="flex h-44 items-end gap-2 sm:gap-3"
                aria-label="Gráfico de ventas por día"
              >
                {stats.chartDays.map((day) => (
                  <div
                    key={day.key}
                    className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                    title={`${day.label}: ${formatMoney(day.revenue)} (${day.count} pedidos)`}
                  >
                    <span className="max-w-full truncate text-[10px] font-bold text-gray-400">
                      {day.revenue > 0
                        ? formatMoney(day.revenue)
                        : "—"}
                    </span>

                    <div className="flex h-32 w-full items-end overflow-hidden rounded-t-md bg-white/[0.04]">
                      <div
                        className="w-full rounded-t-md bg-[#e71921] transition-all"
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

        <div className="rounded-xl border border-white/10 bg-[#151515] p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#e71921]">
                Agenda
              </p>

              <h2 className="mt-2 text-lg font-black uppercase text-white">
                Próximas reservas
              </h2>
            </div>

            <a
              href={`${config.basePath}/reservas`}
              className="text-xs font-black uppercase text-[#e71921] hover:text-white"
            >
              Ver todas
            </a>
          </div>

          {loading ? (
            <p className="text-sm font-bold text-neutral-500">
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
                  className="rounded-lg border border-white/5 bg-white/[0.03] p-3"
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

      <section className="rounded-xl border border-white/10 bg-[#151515] p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#e71921]">
              Actividad reciente
            </p>

            <h2 className="mt-2 text-lg font-black uppercase text-white">
              Últimos pedidos
            </h2>
          </div>

          <a
            href={`${config.basePath}/pedidos`}
            className="text-xs font-black uppercase text-[#e71921] hover:text-white"
          >
            Ir a pedidos
          </a>
        </div>

        {loading ? (
          <p className="text-sm font-bold text-neutral-500">
            Cargando pedidos...
          </p>
        ) : recentOrders.length === 0 ? (
          <EmptyState>
            Todavía no hay pedidos registrados.
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
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
                    className="border-b border-white/5 last:border-0"
                  >
                    <td className="px-3 py-4 text-sm font-black text-white">
                      #{String(order.id).slice(0, 8)}
                    </td>

                    <td className="px-3 py-4 text-sm font-bold text-gray-300">
                      {order.nombre || "Cliente"}
                    </td>

                    <td className="px-3 py-4 text-xs font-bold text-gray-400">
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
    </PageShell>
  );
}
