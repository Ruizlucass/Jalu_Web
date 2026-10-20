export default function ConfirmRequestModal({
  open,
  title,
  description,
  fields = [],
  confirmLabel = "Confirmar",
  loading = false,
  onCancel,
  onConfirm,
}) {
  if (!open) {
    return null;
  }

  function handleCancelar() {
    if (loading) {
      return;
    }

    if (typeof onCancel === "function") {
      onCancel();
    }
  }

  function handleConfirmar() {
    if (loading) {
      return;
    }

    if (typeof onConfirm === "function") {
      onConfirm();
    }
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-black/80 px-4 py-4 backdrop-blur-sm sm:items-center sm:py-6"
      onMouseDown={(e) => {
        // Si toca fuera del modal, también cancela
        if (e.target === e.currentTarget) {
          handleCancelar();
        }
      }}
    >
      <div className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto overscroll-contain rounded-3xl border border-white/10 bg-[#111111] p-6 text-white shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:p-8">
        
        {/* TÍTULO */}
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#e71921]">
            Confirmación
          </p>

          <h2 className="mt-3 text-3xl font-black">
            {title}
          </h2>

          {description && (
            <p className="mt-3 leading-6 text-gray-400">
              {description}
            </p>
          )}
        </div>

        {/* RESUMEN */}
        <div className="mt-7 space-y-3">
          {fields
            .filter(
              (field) =>
                field.value !== undefined &&
                field.value !== null &&
                String(field.value).trim() !== ""
            )
            .map((field, index) => (
              <div
                key={`${field.label}-${index}`}
                className="rounded-2xl border border-white/10 bg-[#090909] p-4"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {field.label}
                </p>

                <p className="mt-1 whitespace-pre-wrap break-words font-semibold text-gray-200">
                  {String(field.value)}
                </p>
              </div>
            ))}
        </div>

        {/* AVISO */}
        <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4">
          <p className="text-sm font-semibold leading-6 text-yellow-200">
            Revisá bien los datos antes de confirmar.
            Una vez registrada la solicitud, solamente
            podrás cancelarla durante el tiempo permitido.
          </p>
        </div>

        {/* BOTONES */}
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          
          {/* CANCELAR */}
          <button
            type="button"
            disabled={loading}
            onClick={handleCancelar}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3.5 font-bold text-gray-300 transition hover:border-white/30 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>

          {/* CONFIRMAR */}
          <button
            type="button"
            disabled={loading}
            onClick={handleConfirmar}
            className="rounded-xl bg-[#e71921] px-5 py-3.5 font-black text-white transition hover:bg-[#ff252d] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Registrando..."
              : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
