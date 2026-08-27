import { panelConfigs, reservations } from "../data/adminData.js";
import { AdminSection, DataRow, PageShell } from "../components/AdminUi.jsx";

export default function Reservations({ panelType = "admin" }) {
  const config = panelConfigs[panelType] || panelConfigs.admin;

  return (
    <PageShell
      eyebrow="Reservas"
      title="Reservas"
      description="Vista para revisar reservas por horario, cliente y sucursal."
    >
      <AdminSection eyebrow={config.label} title="Reservas recientes" action="Nueva reserva">
        <div className="grid gap-3">
          {reservations.map((reservation) => (
            <DataRow
              key={reservation.id}
              title={reservation.name}
              meta={`${reservation.people} - ${reservation.branch}`}
              status={reservation.time}
            />
          ))}
        </div>
      </AdminSection>
    </PageShell>
  );
}
