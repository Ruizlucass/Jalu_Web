import { useEffect, useState } from "react";
import { panelConfigs } from "../data/adminData.js";
import {
  AdminSection,
  DataRow,
  PageShell,
} from "../components/AdminUi.jsx";
import { supabase } from "../../supabase.js";

export default function Reservations({ panelType = "admin" }) {
  const config = panelConfigs[panelType] || panelConfigs.admin;

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarReservas();
  }, []);

  async function cargarReservas() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("reservas")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando reservas:", error);
      setError("No se pudieron cargar las reservas.");
      setLoading(false);
      return;
    }

    setReservations(data || []);
    setLoading(false);
  }

  return (
    <PageShell
      eyebrow="Reservas"
      title="Reservas"
      description="Vista para revisar reservas por horario, cliente y sucursal."
    >
      <AdminSection
        eyebrow={config.label}
        title="Reservas recientes"
        action="Actualizar"
        onAction={cargarReservas}
      >
        {loading && (
          <p className="text-sm text-neutral-500">
            Cargando reservas...
          </p>
        )}

        {error && (
          <p className="text-sm text-red-500">
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          reservations.length === 0 && (
            <p className="text-sm text-neutral-500">
              Todavía no hay reservas registradas.
            </p>
          )}

        <div className="grid gap-3">
          {reservations.map((reservation) => (
            <DataRow
              key={reservation.id}
              title={reservation.nombre || "Cliente"}
              meta={`${
                reservation.personas || "-"
              } personas - ${
                reservation.sucursal || "Sin sucursal"
              }`}
              status={
                reservation.hora ||
                reservation.estado ||
                "pendiente"
              }
            />
          ))}
        </div>
      </AdminSection>
    </PageShell>
  );
}