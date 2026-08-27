import { panelConfigs, promotions } from "../data/adminData.js";
import { AdminSection, DataRow, PageShell } from "../components/AdminUi.jsx";

export default function Promotions({ panelType = "admin" }) {
  const config = panelConfigs[panelType] || panelConfigs.admin;

  return (
    <PageShell
      eyebrow="Ofertas"
      title="Agregar ofertas / promociones"
      description="Vista visual para crear, programar y revisar promociones de Jalu."
    >
      <AdminSection eyebrow={config.label} title="Promociones" action="Nueva oferta">
        <div className="grid gap-3">
          {promotions.map((promo) => (
            <DataRow
              key={promo.id}
              title={promo.name}
              meta={promo.detail}
              status={promo.status}
            />
          ))}
        </div>
      </AdminSection>
    </PageShell>
  );
}
