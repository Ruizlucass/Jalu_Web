import { orders, panelConfigs } from "../data/adminData.js";
import { AdminSection, DataRow, PageShell } from "../components/AdminUi.jsx";

export default function Orders({ panelType = "admin" }) {
  const config = panelConfigs[panelType] || panelConfigs.admin;

  return (
    <PageShell
      eyebrow="Pedidos"
      title="Pedidos"
      description="Vista preparada para seguir el estado de pedidos del salon, delivery y WhatsApp."
    >
      <AdminSection eyebrow={config.label} title="Cola de pedidos" action="Actualizar">
        <div className="grid gap-3">
          {orders.map((order) => (
            <DataRow
              key={order.id}
              title={`${order.id} - ${order.customer}`}
              meta={`${order.channel} - ${order.total}`}
              status={order.status}
            />
          ))}
        </div>
      </AdminSection>
    </PageShell>
  );
}
