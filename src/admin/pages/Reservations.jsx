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
  const [cancelCandidate, setCancelCandidate] = useState(null);
  const [error, setError] = useState("");
  const [activityDate] = useActivityDate();

  useEffect(() => {
    cargarReservas(activityDate);
  }, [activityDate]);

  async function cargarReservas(date = activityDate) {
    setLoading(true);
    setError("");

    const { start, end, startDate, endDate } = activityRangeBounds("day", date);
    const [createdTodayResult, scheduledTodayResult] = await Promise.all([
      supabase
        .from("reservas")
        .select("*")
        .neq("estado", "finalizado")
        .neq("estado", "cancelado")
        .gte("created_at", start)
        .lt("created_at", end),
      supabase
        .from("reservas")
        .select("*")
        .neq("estado", "finalizado")
        .neq("estado", "cancelado")
        .gte("fecha", startDate)
        .lt("fecha", endDate),
    ]);

    if (createdTodayResult.error || scheduledTodayResult.error) {
      console.error(
        "Error cargando reservas:",
        createdTodayResult.error || scheduledTodayResult.error
      );
      setError("No se pudieron cargar las reservas.");
      setLoading(false);
      return;
    }

    const uniqueReservations = new Map();
    [...(createdTodayResult.data || []), ...(scheduledTodayResult.data || [])]
      .forEach((reservation) => uniqueReservations.set(reservation.id, reservation));

    setReservations(
      [...uniqueReservations.values()].sort((a, b) => {
        const dateComparison = String(a.fecha || "").localeCompare(String(b.fecha || ""));
        return dateComparison || String(a.hora || "").localeCompare(String(b.hora || ""));
      })
    );
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

  async function cancelarReserva(reservation) {
    setUpdatingId(reservation.id);
    setError("");

    const { data: { session } } = await supabase.auth.getSession();
    const { error: updateError } = await supabase
      .from("reservas")
      .update({
        estado: "cancelado",
        cancelado_at: new Date().toISOString(),
        cancelado_por: session?.user?.email || "Personal Jalu",
      })
      .eq("id", reservation.id);

    if (updateError) {
      console.error("Error cancelando reserva:", updateError);
      setError("No se pudo cancelar la reserva.");
      setUpdatingId(null);
      return;
    }

    setReservations((current) => current.filter((item) => item.id !== reservation.id));
    setCancelCandidate(null);
    setUpdatingId(null);
  }

  return (
    <PageShell
      eyebrow="Reservas"
      title="Reservas del día"
      description="Se muestran las reservas recibidas hoy y las programadas para hoy. Al finalizar el turno, marcá las atendidas como finalizadas para guardarlas en el historial."
    >
      <AdminSection
        eyebrow={config.label}
        title={`Reservas de hoy (${reservations.length})`}
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

            actions.push({
              label: "Cancelar reserva",
              onClick: () => setCancelCandidate(reservation),
              disabled: isUpdating,
              variant: "danger",
            });

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

      {cancelCandidate && (
        <DoubleConfirmModal
          key={cancelCandidate.id}
          title={`¿Cancelar la reserva de ${cancelCandidate.nombre || "este cliente"}?`}
          description="La reserva dejará la lista activa y quedará guardada en la pestaña Cancelados."
          onClose={() => setCancelCandidate(null)}
          onConfirm={() => cancelarReserva(cancelCandidate)}
          isProcessing={updatingId === cancelCandidate.id}
        />
      )}
    </PageShell>
  );
}
