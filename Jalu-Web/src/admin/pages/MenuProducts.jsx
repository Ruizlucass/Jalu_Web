import { menuItems, panelConfigs } from "../data/adminData.js";
import { AdminSection, DataRow, PageShell } from "../components/AdminUi.jsx";

export default function MenuProducts({ panelType = "admin" }) {
  const config = panelConfigs[panelType] || panelConfigs.admin;

  return (
    <PageShell
      eyebrow="Menu"
      title="Modificar menu / productos"
      description="Vista preparada para editar nombres, categorias, precios y visibilidad del menu."
    >
      <AdminSection eyebrow={config.label} title="Productos del menu" action="Nuevo producto">
        <div className="grid gap-3">
          {menuItems.map((item) => (
            <DataRow
              key={item.id}
              title={item.name}
              meta={`${item.category} - ${item.price}`}
              status={item.status}
            />
          ))}
        </div>
      </AdminSection>
    </PageShell>
  );
}
