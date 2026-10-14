export const ORDER_CANCELLATION_WINDOW_MS =
  5 * 60 * 1000;

export const RESERVATION_CANCELLATION_WINDOW_MS =
  60 * 60 * 1000;

export function getCancellationRemainingMs(
  createdAt,
  requestType,
  now = Date.now()
) {
  if (!createdAt) return 0;

  const createdTime = new Date(createdAt).getTime();

  const limit =
    requestType === "reserva"
      ? RESERVATION_CANCELLATION_WINDOW_MS
      : ORDER_CANCELLATION_WINDOW_MS;

  return Math.max(
    0,
    createdTime + limit - now
  );
}

export function canCancelRequest(
  request,
  requestType,
  now = Date.now()
) {
  if (!request) return false;

  if (request.estado !== "pendiente") {
    return false;
  }

  return (
    getCancellationRemainingMs(
      request.created_at,
      requestType,
      now
    ) > 0
  );
}

export function formatRemainingTime(ms) {
  if (ms <= 0) return "0:00";

  const totalSeconds = Math.ceil(ms / 1000);

  const hours = Math.floor(
    totalSeconds / 3600
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );

  const seconds =
    totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}