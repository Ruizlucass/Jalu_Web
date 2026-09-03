export const CANCEL_MINUTES = 5;

export function segundosParaCancelar(createdAt) {
  if (!createdAt) return 0;

  const creado = new Date(createdAt).getTime();
  const limite = creado + CANCEL_MINUTES * 60 * 1000;
  const restante = Math.floor((limite - Date.now()) / 1000);

  return Math.max(0, restante);
}

export function formatearTiempo(segundos) {
  const minutos = Math.floor(segundos / 60);
  const segundosRestantes = segundos % 60;

  return `${String(minutos).padStart(2, "0")}:${String(
    segundosRestantes
  ).padStart(2, "0")}`;
}