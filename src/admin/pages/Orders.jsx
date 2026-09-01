import { useEffect, useState } from "react";
import { panelConfigs } from "../data/adminData.js";
import {
  AdminSection,
  DataRow,
  PageShell,
} from "../components/AdminUi.jsx";
import { supabase } from "../../supabase.js";

export default function Orders({ panelType = "admin" }) {
  const config = panelConfigs[panelType] || panelConfigs.admin;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarPedidos();
  }, []);

  async function cargarPedidos() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando pedidos:", error);
      setError("No se pudieron cargar los pedidos.");
      setLoading(false);
      return;
    }

    setOrders(data || []);
    setLoading(false);
  }

  return (
    <PageShell
      eyebrow="Pedidos"
      title="Pedidos"
      description="Vista para revisar los pedidos realizados por los clientes."
    >
      <AdminSection
        eyebrow={config.label}
        title="Cola de pedidos"
        action="Actualizar"
        onAction={cargarPedidos}
      >
        {loading && (
          <p className="text-sm text-neutral-500">
            Cargando pedidos...
          </p>
        )}

        {error && (
          <p className="text-sm text-red-500">
            {error}
          </p>
        )}

        {!loading && !error && orders.length === 0 && (
          <p className="text-sm text-neutral-500">
            Todavía no hay pedidos registrados.
          </p>
        )}

        <div className="grid gap-3">
          {orders.map((order) => (
            <DataRow
              key={order.id}
              title={`Pedido #${order.id} - ${
                order.nombre || "Cliente"
              }`}
              meta={`${
                order.tipo_entrega || "Sin tipo"
              } - ${order.sucursal || "Sin sucursal"}`}
              status={order.estado || "pendiente"}
            />
          ))}
        </div>
      </AdminSection>
    </PageShell>
  );
}