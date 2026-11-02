
import { useEffect, useState } from "react";
import { panelConfigs } from "../data/adminData.js";
import {
  AdminSection,
  DetailCard,
  DoubleConfirmModal,
  PageShell,
} from "../components/AdminUi.jsx";
import { supabase } from "../../supabase.js";
import {
  activityRangeBounds,
  useActivityDate,
} from "../components/ActivityDateFilter.jsx";

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatMoney(value) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default function Orders({ panelType = "admin" }) {
  const config = panelConfigs[panelType] || panelConfigs.admin;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [cancelCandidate, setCancelCandidate] = useState(null);
  const [paymentCandidate, setPaymentCandidate] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [cashAmount, setCashAmount] = useState("");
  const [cardAmount, setCardAmount] = useState("");
  const [error, setError] = useState("");
  const [activityDate] = useActivityDate();

  useEffect(() => {
    cargarPedidos(activityDate);
  }, [activityDate]);

  async function cargarPedidos(date = activityDate) {
    setLoading(true);
    setError("");

    const { start, end } = activityRangeBounds("day", date);

    const { data, error: queryError } = await supabase
      .from("pedidos")
      .select("*")
      .neq("estado", "finalizado")
      .neq("estado", "cancelado")
      .gte("created_at", start)
      .lt("created_at", end)
      .order("created_at", { ascending: false });

    if (queryError) {
      console.error("Error cargando pedidos:", queryError);
      setError("No se pudieron cargar los pedidos.");
      setLoading(false);
      return;
    }

    setOrders(data || []);
    setLoading(false);
  }

  function abrirPago(order) {
    const total = Number(order.total) || 0;

    setPaymentCandidate(order);
    setPaymentMethod("efectivo");
    setCashAmount(String(total));
    setCardAmount("0");
    setError("");
  }

  function actualizarMetodo(method) {
    const total = Number(paymentCandidate?.total) || 0;

    setPaymentMethod(method);

    if (method === "efectivo") {
      setCashAmount(String(total));
      setCardAmount("0");
    } else if (method === "tarjeta") {
      setCashAmount("0");
      setCardAmount(String(total));
    } else {
      setCashAmount("");
      setCardAmount("");
    }
  }

  async function confirmarPago() {
    if (!paymentCandidate) return;

    const total = Number(paymentCandidate.total) || 0;
    const efectivo = Number(cashAmount) || 0;
    const tarjeta = Number(cardAmount) || 0;

    if (efectivo < 0 || tarjeta < 0) {
      setError("Los importes no pueden ser negativos.");
      return;
    }

    if (Math.abs(efectivo + tarjeta - total) > 0.01) {
      setError(
        `El pago debe coincidir con el total de ${formatMoney(total)}.`
      );
      return;
    }

    if (paymentMethod === "efectivo" && efectivo !== total) {
      setError("El importe en efectivo debe cubrir el total.");
      return;
    }

    if (paymentMethod === "tarjeta" && tarjeta !== total) {
      setError("El importe con tarjeta debe cubrir el total.");
      return;
    }

    const medioPago =
      efectivo > 0 && tarjeta > 0
        ? "mixto"
        : efectivo > 0
          ? "efectivo"
          : "tarjeta";

    setUpdatingId(paymentCandidate.id);
    setError("");

    const now = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("pedidos")
      .update({
        estado: "finalizado",
        medio_pago: medioPago,
        pago_efectivo: efectivo,
        pago_tarjeta: tarjeta,
        pagado_at: now,
        finalizado_at: now,
      })
      .eq("id", paymentCandidate.id);

    if (updateError) {
      console.error("Error registrando el pago:", updateError);
      setError("No se pudo registrar el pago. Revisá los permisos de Supabase.");
      setUpdatingId(null);
      return;
    }

    setOrders((current) =>
      current.filter((item) => item.id !== paymentCandidate.id)
    );

    setPaymentCandidate(null);
    setUpdatingId(null);
  }

  async function cambiarEstado(order, nextStatus) {
    const accepted = window.confirm(
      `¿Seguro que querés confirmar el pedido de ${
        order.nombre || "este cliente"
      }?`
    );

    if (!accepted) return;

    setUpdatingId(order.id);
    setError("");

    const { error: updateError } = await supabase
      .from("pedidos")
      .update({ estado: nextStatus })
      .eq("id", order.id);

    if (updateError) {
      console.error("Error actualizando pedido:", updateError);
      setError("No se pudo actualizar el pedido. Revisá los permisos de Supabase.");
      setUpdatingId(null);
      return;
    }

    setOrders((current) =>
      current.map((item) =>
        item.id === order.id
          ? { ...item, estado: nextStatus }
          : item
      )
    );

    setUpdatingId(null);
  }

  async function cancelarPedido(order) {
    setUpdatingId(order.id);
    setError("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { error: updateError } = await supabase
      .from("pedidos")
      .update({
        estado: "cancelado",
        cancelado_at: new Date().toISOString(),
        cancelado_por: session?.user?.email || "Personal Jalu",
      })
      .eq("id", order.id);

    if (updateError) {
      console.error("Error cancelando pedido:", updateError);
      setError("No se pudo cancelar el pedido.");
      setUpdatingId(null);
      return;
    }

    setOrders((current) =>
      current.filter((item) => item.id !== order.id)
    );

    setCancelCandidate(null);
    setUpdatingId(null);
  }

  const totalPayment =
    (Number(cashAmount) || 0) + (Number(cardAmount) || 0);

  return (
    <PageShell
      eyebrow="Pedidos"
      title="Pedidos del día"
      description="Administrá los pedidos y registrá el medio de pago al finalizar cada venta."
    >
      <AdminSection
        eyebrow={config.label}
        title={`Pedidos de hoy (${orders.length})`}
        action={loading ? "Actualizando..." : "Actualizar"}
        onAction={cargarPedidos}
        actionDisabled={loading}
      >
        {loading && (
          <p className="text-sm font-bold text-neutral-500">
            Cargando pedidos...
          </p>
        )}

        {error && !paymentCandidate && (
          <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-300">
            {error}
          </p>
        )}

        {!loading && orders.length === 0 && (
          <p className="rounded-lg border border-white/5 bg-white/[0.03] p-5 text-sm font-bold text-neutral-500">
            No hay pedidos activos. Los finalizados están en Reportes y los cancelados en Cancelados.
          </p>
        )}

        <div className="grid gap-4">
          {orders.map((order) => {
            const status = order.estado || "pendiente";
            const isUpdating = updatingId === order.id;
            const actions = [];

            if (status === "pendiente") {
              actions.push({
                label: isUpdating ? "Confirmando..." : "Confirmar pedido",
                onClick: () => cambiarEstado(order, "confirmado"),
                disabled: isUpdating,
              });
            }

            if (status === "confirmado") {
              actions.push({
                label: isUpdating ? "Procesando..." : "Registrar pago y finalizar",
                onClick: () => abrirPago(order),
                disabled: isUpdating,
                variant: "success",
              });
            }

            actions.push({
              label: "Cancelar pedido",
              onClick: () => setCancelCandidate(order),
              disabled: isUpdating,
              variant: "danger",
            });

            return (
              <DetailCard
                key={order.id}
                title={`Pedido #${String(order.id).slice(0, 8)} · ${
                  order.nombre || "Cliente"
                }`}
                subtitle={`Registrado: ${formatDate(order.created_at)}`}
                status={status}
                fields={[
                  { label: "Teléfono", value: order.telefono },
                  { label: "Email", value: order.email },
                  { label: "Sucursal", value: order.sucursal },
                  {
                    label: "Entrega",
                    value:
                      order.tipo_entrega === "delivery"
                        ? "Delivery"
                        : "Take Away",
                  },
                  {
                    label: "Dirección",
                    value:
                      order.tipo_entrega === "delivery"
                        ? order.direccion
                        : "Retira en sucursal",
                  },
                  {
                    label: "Total",
                    value: formatMoney(order.total),
                  },
                ]}
                descriptionLabel="Descripción del pedido y observaciones"
                description={
                  [order.descripcion, order.observaciones]
                    .filter(Boolean)
                    .join("\n\n") || null
                }
                actions={actions}
              />
            );
          })}
        </div>
      </AdminSection>

      {paymentCandidate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-lg rounded-3xl border border-white/10 bg-[#171717] p-6 shadow-2xl">
            <div className="mb-5">
              <p className="text-xs font-black uppercase tracking-widest text-[#ff5b62]">
                Registrar venta
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">
                Medio de pago
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                Pedido de {paymentCandidate.nombre || "Cliente"}
              </p>
              <p className="mt-3 text-3xl font-black text-white">
                {formatMoney(paymentCandidate.total)}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                ["efectivo", "Efectivo"],
                ["tarjeta", "Tarjeta"],
                ["mixto", "Combinado"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => actualizarMetodo(value)}
                  className={`rounded-xl border p-3 text-sm font-bold transition ${
                    paymentMethod === value
                      ? "border-[#e71921] bg-[#e71921]/20 text-white"
                      : "border-white/10 bg-white/[0.03] text-gray-400 hover:bg-white/[0.08]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-gray-300">
                <span>Efectivo ($)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={cashAmount}
                  disabled={paymentMethod === "tarjeta"}
                  onChange={(e) => setCashAmount(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-white outline-none focus:border-[#e71921] disabled:opacity-40"
                />
              </label>

              <label className="grid gap-2 text-sm font-bold text-gray-300">
                <span>Tarjeta ($)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={cardAmount}
                  disabled={paymentMethod === "efectivo"}
                  onChange={(e) => setCardAmount(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-white outline-none focus:border-[#e71921] disabled:opacity-40"
                />
              </label>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Total del pedido</span>
                <span>{formatMoney(paymentCandidate.total)}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm text-gray-400">
                <span>Total ingresado</span>
                <span>{formatMoney(totalPayment)}</span>
              </div>
              <div className="mt-3 flex justify-between border-t border-white/10 pt-3 font-black">
                <span className="text-gray-300">Diferencia</span>
                <span
                  className={
                    Math.abs(totalPayment - Number(paymentCandidate.total)) < 0.01
                      ? "text-emerald-400"
                      : "text-red-400"
                  }
                >
                  {formatMoney(Number(paymentCandidate.total) - totalPayment)}
                </span>
              </div>
            </div>

            {error && (
              <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm font-bold text-red-300">
                {error}
              </p>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setPaymentCandidate(null);
                  setError("");
                }}
                disabled={updatingId !== null}
                className="rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-gray-300 hover:bg-white/5"
              >
                Volver
              </button>

              <button
                type="button"
                onClick={confirmarPago}
                disabled={
                  updatingId !== null ||
                  Math.abs(totalPayment - Number(paymentCandidate.total)) > 0.01
                }
                className="rounded-xl bg-[#e71921] px-4 py-3 text-sm font-black text-white hover:bg-[#ff3038] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {updatingId === paymentCandidate.id
                  ? "Guardando..."
                  : "Confirmar pago"}
              </button>
            </div>
          </div>
        </div>
      )}

      {cancelCandidate && (
        <DoubleConfirmModal
          key={cancelCandidate.id}
          title={`¿Cancelar el pedido de ${cancelCandidate.nombre || "este cliente"}?`}
          description="El pedido dejará la lista activa y quedará guardado en la pestaña Cancelados."
          onClose={() => setCancelCandidate(null)}
          onConfirm={() => cancelarPedido(cancelCandidate)}
          isProcessing={updatingId === cancelCandidate.id}
        />
      )}
    </PageShell>
  );
}
