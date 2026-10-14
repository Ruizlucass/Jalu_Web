import { useEffect, useState } from "react";
import { panelConfigs } from "../data/adminData.js";
import {
  AdminSection,
  DetailCard,
  PageShell,
} from "../components/AdminUi.jsx";
import { supabase } from "../../supabase.js";

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
  const [error, setError] = useState("");

  useEffect(() => {
    cargarPedidos();
  }, []);

  async function cargarPedidos() {
    setLoading(true);
    setError("");

    const { data, error: queryError } =
      await supabase
        .from("pedidos")
        .select("*")
        .neq("estado", "finalizado")
        .neq("estado", "cancelado")
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

    const { error: updateError } =
      await supabase
        .from("pedidos")
        .update({
          estado: nextStatus,
        })
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

  return (
    <PageShell
      eyebrow="Pedidos"
      title="Pedidos activos"
      description="Confirmá pedidos, revisá todos sus datos y finalizalos cuando hayan sido entregados."
    >
      <AdminSection
        eyebrow={config.label}
        title={`Cola de pedidos (${orders.length})`}
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
              están en Finalizados y los cancelados en
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

            return (
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
                descriptionLabel="Descripción del pedido y observaciones"
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
            );
          })}
        </div>
      </AdminSection>
    </PageShell>
  );
}