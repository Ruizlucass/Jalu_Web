import { useEffect, useState } from "react";
import { panelConfigs } from "../data/adminData.js";
import { AdminSection, DetailCard, PageShell } from "../components/AdminUi.jsx";
import { supabase } from "../../supabase.js";

function formatCreatedAt(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatReservationDate(value) {
  if (!value) return "—";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "full" }).format(
    new Date(year, month - 1, day, 12)
  );
}

export default function Reservations({ panelType = "admin" }) {
  const config = panelConfigs[panelType] || panelConfigs.admin;
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarReservas();
  }, []);

  async function cargarReservas() {
    setLoading(true);
    setError("");

    const { data, error: queryError } = await supabase
      .from("reservas")
      .select("*")
      .neq("estado", "finalizado")
      .order("fecha", { ascending: true })
      .order("hora", { ascending: true });

    if (queryError) {
      console.error("Error cargando reservas:", queryError);
      setError("No se pudieron cargar las reservas.");
      setLoading(false);
      return;
    }

    setReservations(data || []);
    setLoading(false);
  }

  async function cambiarEstado(reservation, nextStatus) {
    const action = nextStatus === "confirmado" ? "confirmar" : "finalizar";
    const accepted = window.confirm(
      `¿Seguro que querés ${action} la reserva de ${
        reservation.nombre || "este cliente"
      }?`
    );

    if (!accepted) return;

    setUpdatingId(reservation.id);
    setError("");

    const { error: updateError } = await supabase
      .from("reservas")
      .update({ estado: nextStatus })
      .eq("id", reservation.id);

    if (updateError) {
      console.error("Error actualizando reserva:", updateError);
      setError(
        "No se pudo actualizar la reserva. Revisá que hayas ejecutado la migración de Supabase."
      );
      setUpdatingId(null);
      return;
    }

    if (nextStatus === "finalizado") {
      setReservations((current) =>
        current.filter((item) => item.id !== reservation.id)
      );
    } else {
      setReservations((current) =>
        current.map((item) =>
          item.id === reservation.id ? { ...item, estado: nextStatus } : item
        )
      );
    }

    setUpdatingId(null);
  }

  return (
    <PageShell
      eyebrow="Reservas"
      title="Reservas activas"
      description="Revisá fecha, horario, cantidad de personas y comentarios antes de confirmar cada reserva."
    >
      <AdminSection
        eyebrow={config.label}
        title={`Reservas pendientes y confirmadas (${reservations.length})`}
        action={loading ? "Actualizando..." : "Actualizar"}
        onAction={cargarReservas}
        actionDisabled={loading}
      >
        {loading && <p className="text-sm font-bold text-neutral-500">Cargando reservas...</p>}

        {error && (
          <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-300">
            {error}
          </p>
        )}

        {!loading && reservations.length === 0 && (
          <p className="rounded-lg border border-white/5 bg-white/[0.03] p-5 text-sm font-bold text-neutral-500">
            No hay reservas activas. Las finalizadas están guardadas en la sección Finalizados.
          </p>
        )}

        <div className="grid gap-4">
          {reservations.map((reservation) => {
            const status = reservation.estado || "pendiente";
            const isUpdating = updatingId === reservation.id;
            const actions = [];

            if (status === "pendiente") {
              actions.push({
                label: isUpdating ? "Confirmando..." : "Confirmar reserva",
                onClick: () => cambiarEstado(reservation, "confirmado"),
                disabled: isUpdating,
              });
            }

            if (status === "confirmado") {
              actions.push({
                label: isUpdating ? "Finalizando..." : "Marcar finalizada",
                onClick: () => cambiarEstado(reservation, "finalizado"),
                disabled: isUpdating,
                variant: "success",
              });
            }

            return (
              <DetailCard
                key={reservation.id}
                title={reservation.nombre || "Cliente"}
                subtitle={`Registrada: ${formatCreatedAt(reservation.created_at)}`}
                status={status}
                fields={[
                  { label: "Fecha", value: formatReservationDate(reservation.fecha) },
                  { label: "Hora", value: reservation.hora?.slice(0, 5) },
                  {
                    label: "Personas",
                    value: `${reservation.personas || 0} personas`,
                  },
                  { label: "Sucursal", value: reservation.sucursal },
                  { label: "Teléfono", value: reservation.telefono },
                  { label: "Email", value: reservation.email },
                ]}
                descriptionLabel="Descripción y comentarios de la reserva"
                description={reservation.comentarios}
                actions={actions}
              />
            );
          })}
        </div>
      </AdminSection>
    </PageShell>
  );
}
