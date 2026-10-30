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

export default function Orders({
  panelType = "admin",
}) {
  const config =
    panelConfigs[panelType] || panelConfigs.admin;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [cancelCandidate, setCancelCandidate] = useState(null);
  const [error, setError] = useState("");
  const [activityDate] = useActivityDate();

  useEffect(() => {
    cargarPedidos(activityDate);
  }, [activityDate]);

  async function cargarPedidos(date = activityDate) {
    setLoading(true);
    setError("");
    const { start, end } = activityRangeBounds("day", date);

    const { data, error: queryError } =
      await supabase
        .from("pedidos")
        .select("*")
        .neq("estado", "finalizado")
        .neq("estado", "cancelado")
        .gte("created_at", start)
        .lt("created_at", end)
        .order("created_at", {
          ascending: false,
        });

    if (queryError) {
      console.error(
        "Error cargando pedidos:",
        queryError
      );

      setError(
        "No se pudieron cargar los pedidos."
      );

      setLoading(false);
      return;
    }

    setOrders(data || []);
    setLoading(false);
  }

  async function cambiarEstado(
    order,
    nextStatus
  ) {
    const action =
      nextStatus === "confirmado"
        ? "confirmar"
        : "finalizar";

    const accepted = window.confirm(
      `¿Seguro que querés ${action} el pedido de ${
        order.nombre || "este cliente"
      }?`
    );

    if (!accepted) return;


    setUpdatingId(order.id);
    setError("");

    const updatePayload = { estado: nextStatus };
    if (nextStatus === "finalizado") {
      // El medio de pago ya lo eligió el cliente al realizar el pedido.
      // El panel administrativo solo registra el cobro según esa elección.
      const medioPago = order.medio_pago;
      const total = Number(order.total) || 0;
      updatePayload.pago_efectivo = medioPago === "efectivo" ? total : 0;
      updatePayload.pago_transferencia = medioPago === "transferencia" ? total : 0;
      updatePayload.pagado_at = new Date().toISOString();
      updatePayload.finalizado_at = new Date().toISOString();
    }

    const { error: updateError } =
      await supabase
        .from("pedidos")
        .update(updatePayload)
        .eq("id", order.id);

    if (updateError) {
      console.error(
        "Error actualizando pedido:",
        updateError
      );

      setError(
        "No se pudo actualizar el pedido. Revisá los permisos y políticas de Supabase."
      );

      setUpdatingId(null);
      return;
    }

    if (nextStatus === "finalizado") {
      setOrders((current) =>
        current.filter(
          (item) => item.id !== order.id
        )
      );
    } else {
      setOrders((current) =>
        current.map((item) =>
          item.id === order.id
            ? {
                ...item,
                estado: nextStatus,
              }
            : item
        )
      );
    }

    setUpdatingId(null);
  }

  async function cancelarPedido(order) {
    setUpdatingId(order.id);
    setError("");

    const { data: { session } } = await supabase.auth.getSession();
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

    setOrders((current) => current.filter((item) => item.id !== order.id));
    setCancelCandidate(null);
    setUpdatingId(null);
  }

  return (
    <PageShell
      eyebrow="Pedidos"
      title="Pedidos del día"
      description="Acá se muestran los pedidos recibidos hoy. Al finalizar el turno, marcá cada pedido como finalizado para guardarlo en el historial."
    >
      <AdminSection
        eyebrow={config.label}
        title={`Pedidos de hoy (${orders.length})`}
        action={
          loading
            ? "Actualizando..."
            : "Actualizar"
        }
        onAction={cargarPedidos}
        actionDisabled={loading}
      >
        {loading && (
          <p className="text-sm font-bold text-neutral-500">
            Cargando pedidos...
          </p>
        )}

        {error && (
          <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-300">
            {error}
          </p>
        )}

        {!loading &&
          orders.length === 0 && (
            <p className="rounded-lg border border-white/5 bg-white/[0.03] p-5 text-sm font-bold text-neutral-500">
              No hay pedidos activos. Los finalizados
              están en Reportes y los cancelados en
              Cancelados.
            </p>
          )}

        <div className="grid gap-4">
          {orders.map((order) => {
            const status =
              order.estado || "pendiente";

            const isUpdating =
              updatingId === order.id;

            const actions = [];

            if (status === "pendiente") {
              actions.push({
                label: isUpdating
                  ? "Confirmando..."
                  : "Confirmar pedido",

                onClick: () =>
                  cambiarEstado(
                    order,
                    "confirmado"
                  ),

                disabled: isUpdating,
              });
            }

            if (status === "confirmado") {
              actions.push({
                label: isUpdating
                  ? "Finalizando..."
                  : "Marcar finalizado",

                onClick: () =>
                  cambiarEstado(
                    order,
                    "finalizado"
                  ),

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
              <div key={order.id} className="grid gap-3">
              <DetailCard
                key={order.id}
                title={`Pedido #${String(
                  order.id
                ).slice(0, 8)} · ${
                  order.nombre || "Cliente"
                }`}
                subtitle={`Registrado: ${formatDate(
                  order.created_at
                )}`}
                status={status}
                fields={[
                  {
                    label: "Teléfono",
                    value: order.telefono,
                  },
                  {
                    label: "Email",
                    value: order.email,
                  },
                  {
                    label: "Sucursal",
                    value: order.sucursal,
                  },
                  {
                    label: "Entrega",
                    value:
                      order.tipo_entrega ===
                      "delivery"
                        ? "Delivery"
                        : "Take Away",
                  },
                  {
                    label: "Medio de pago elegido por el cliente",
                    value: order.medio_pago === "transferencia" ? "Transferencia" : order.medio_pago === "efectivo" ? "Efectivo" : "No seleccionado",
                  },
                  {
                    label: "Dirección",
                    value:
                      order.tipo_entrega ===
                      "delivery"
                        ? order.direccion
                        : "Retira en sucursal",
                  },
                  {
                    label: "Total",
                    value: formatMoney(
                      order.total
                    ),
                  },
                ]}
                descriptionLabel="Productos incluidos, importes y observaciones"
                description={
                  [
                    order.descripcion,
                    order.observaciones,
                  ]
                    .filter(Boolean)
                    .join("\n\n") || null
                }
                actions={actions}
              />
              </div>
            );
          })}
        </div>
      </AdminSection>

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