import { useCallback, useEffect, useMemo, useState } from "react";
import { panelConfigs } from "../data/adminData.js";
import { AdminSection, PageShell } from "../components/AdminUi.jsx";
import { supabase } from "../../supabase.js";

const money = (value) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const dateTime = (value) => {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

const reservationDate = (value) => {
  if (!value) return "Sin fecha";
  const [year, month, day] = String(value).split("-").map(Number);
  if (!year || !month || !day) return String(value);
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(
    new Date(year, month - 1, day, 12)
  );
};

const localDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

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
      // Se usan las mismas tablas que ya consultan los módulos Pedidos y Reservas.
      const [ordersResult, reservationsResult] = await Promise.all([
        supabase.from("pedidos").select("*").order("created_at", { ascending: false }),
        supabase.from("reservas").select("*").order("fecha", { ascending: true }).order("hora", { ascending: true }),
      ]);

      const errors = [];
      if (ordersResult.error) {
        console.error("Error cargando pedidos para el Dashboard:", ordersResult.error);
        errors.push(`pedidos: ${ordersResult.error.message || "error de consulta"}`);
      }
      if (reservationsResult.error) {
        console.error("Error cargando reservas para el Dashboard:", reservationsResult.error);
        errors.push(`reservas: ${reservationsResult.error.message || "error de consulta"}`);
      }

      setOrders(ordersResult.error ? [] : ordersResult.data || []);
      setReservations(reservationsResult.error ? [] : reservationsResult.data || []);
      if (errors.length) {
        setError(`No se pudieron cargar todos los datos de Supabase (${errors.join("; ")}). Revisá la consola del navegador y las políticas de acceso (RLS).`);
      }
      setLastUpdated(new Date());
    } catch (unexpectedError) {
      console.error("Error inesperado cargando el Dashboard:", unexpectedError);
      setError("Ocurrió un error al consultar Supabase. Revisá la configuración y la consola del navegador.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const todayKey = localDateKey(new Date());
  const monthPrefix = todayKey.slice(0, 7);

  const stats = useMemo(() => {
    const ordersToday = orders.filter((order) =>
      String(order.created_at || "").slice(0, 10) === todayKey
    );
    const pendingOrders = orders.filter((order) =>
      ["pendiente", "confirmado"].includes(String(order.estado || "").toLowerCase())
    );
    const completedThisMonth = orders.filter((order) =>
      String(order.estado || "").toLowerCase() === "finalizado" &&
      String(order.created_at || "").slice(0, 7) === monthPrefix
    );
    const monthlySales = completedThisMonth.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const pendingReservations = reservations.filter((reservation) =>
      String(reservation.estado || "").toLowerCase() !== "finalizado" &&
      String(reservation.estado || "").toLowerCase() !== "cancelado" &&
      String(reservation.fecha || "") >= todayKey
    );
    return { ordersToday: ordersToday.length, pendingOrders: pendingOrders.length, monthlySales, pendingReservations };
  }, [orders, reservations, todayKey, monthPrefix]);

  const salesByDay = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(12, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));
      const key = localDateKey(date);
      return {
        key,
        label: new Intl.DateTimeFormat("es-AR", { weekday: "short" }).format(date),
        total: 0,
      };
    });
    const byDate = new Map(days.map((day) => [day.key, day]));
    orders.forEach((order) => {
      if (String(order.estado || "").toLowerCase() !== "finalizado" || !order.created_at) return;
      const day = byDate.get(String(order.created_at).slice(0, 10));
      if (day) day.total += Number(order.total || 0);
    });
    return days;
  }, [orders]);

  const maxSales = Math.max(1, ...salesByDay.map((day) => day.total));
  const nextReservations = reservations
    .filter((reservation) =>
      String(reservation.estado || "").toLowerCase() !== "finalizado" &&
      String(reservation.estado || "").toLowerCase() !== "cancelado" &&
      String(reservation.fecha || "") >= todayKey
    )
    .slice(0, 5);
  const latestOrders = orders.slice(0, 5);

  const cards = [
    { title: "Pedidos de hoy", value: stats.ordersToday, detail: "Pedidos registrados hoy", color: "text-white" },
    { title: "Ventas del mes", value: money(stats.monthlySales), detail: "Pedidos finalizados este mes", color: "text-emerald-400" },
    { title: "Pedidos por atender", value: stats.pendingOrders, detail: "Pendientes o confirmados", color: "text-amber-300" },
    { title: "Reservas pendientes", value: stats.pendingReservations.length, detail: "Desde hoy en adelante", color: "text-white" },
  ];

  return (
    <PageShell eyebrow={config.label} title={config.title} description="Resumen operativo con datos consultados en Supabase.">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold text-neutral-500">
          {lastUpdated ? `Última actualización: ${dateTime(lastUpdated.toISOString())}` : "Todavía no se actualizaron los datos"}
        </p>
        <button type="button" onClick={loadDashboard} disabled={loading} className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50">
          {loading ? "Actualizando..." : "Actualizar datos"}
        </button>
      </div>

      {error && (
        <div role="alert" className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Estadísticas principales">
        {cards.map((card) => (
          <article key={card.title} className="rounded-xl border border-white/10 bg-[#151515] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
            <p className="text-sm font-bold text-neutral-400">{card.title}</p>
            <p className={`mt-3 break-words text-3xl font-black ${card.color}`}>{loading ? "…" : card.value}</p>
            <p className="mt-2 text-xs text-neutral-500">{card.detail}</p>
          </article>
        ))}
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <AdminSection eyebrow="Últimos 7 días" title="Ventas de pedidos finalizados">
          {loading ? <p className="text-sm text-neutral-400">Cargando ventas…</p> : (
            <div className="grid gap-4">
              {salesByDay.map((day) => (
                <div key={day.key} className="grid grid-cols-[42px_minmax(0,1fr)_100px] items-center gap-3">
                  <span className="text-xs font-bold capitalize text-neutral-400">{day.label}</span>
                  <div className="h-3 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-[#e71921]" style={{ width: `${day.total ? Math.max(3, (day.total / maxSales) * 100) : 0}%` }} />
                  </div>
                  <span className="text-right text-xs font-bold text-white">{money(day.total)}</span>
                </div>
              ))}
            </div>
          )}
          <p className="mt-4 text-xs leading-5 text-neutral-500">El cálculo usa la fecha de creación del pedido y suma el total cuando su estado es “finalizado”.</p>
        </AdminSection>

        <AdminSection eyebrow="Agenda" title="Próximas reservas" action="Ver reservas" onAction={() => { window.location.href = `${config.basePath}/reservas`; }}>
          {loading ? <p className="text-sm text-neutral-400">Cargando reservas…</p> : nextReservations.length === 0 ? (
            <p className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-neutral-400">No hay próximas reservas pendientes o confirmadas.</p>
          ) : (
            <div className="grid gap-3">
              {nextReservations.map((reservation) => (
                <div key={reservation.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-bold text-white">{reservation.nombre || "Cliente"}</p>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold text-neutral-300">{reservation.estado || "pendiente"}</span>
                  </div>
                  <p className="mt-2 text-sm text-neutral-300">{reservationDate(reservation.fecha)} · {reservation.hora || "Horario sin definir"}</p>
                  <p className="mt-1 text-xs text-neutral-500">{reservation.personas || "—"} personas · {reservation.sucursal || "Sucursal sin indicar"}</p>
                </div>
              ))}
            </div>
          )}
        </AdminSection>
      </div>

      <div className="mt-6">
        <AdminSection eyebrow="Actividad reciente" title="Últimos pedidos" action="Ver pedidos" onAction={() => { window.location.href = `${config.basePath}/pedidos`; }}>
          {loading ? <p className="text-sm text-neutral-400">Cargando pedidos…</p> : latestOrders.length === 0 ? (
            <p className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-neutral-400">Todavía no hay pedidos registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead><tr className="border-b border-white/10 text-xs uppercase tracking-wide text-neutral-500"><th className="px-3 py-3">Pedido</th><th className="px-3 py-3">Cliente</th><th className="px-3 py-3">Fecha</th><th className="px-3 py-3">Total</th><th className="px-3 py-3">Estado</th></tr></thead>
                <tbody>
                  {latestOrders.map((order) => (
                    <tr key={order.id} className="border-b border-white/5 last:border-0">
                      <td className="px-3 py-3 font-bold text-white">#{String(order.id).slice(0, 8)}</td>
                      <td className="px-3 py-3 text-neutral-300">{order.nombre || "Cliente"}</td>
                      <td className="px-3 py-3 text-neutral-400">{dateTime(order.created_at)}</td>
                      <td className="px-3 py-3 text-neutral-300">{money(order.total)}</td>
                      <td className="px-3 py-3"><span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold text-neutral-300">{order.estado || "pendiente"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminSection>
      </div>
    </PageShell>
  );
}
