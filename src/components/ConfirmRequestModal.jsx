export default function ConfirmRequestModal({
  open,
  title,
  loading = false,
  onClose,
  onConfirm,
  children,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-[#111111] p-6 text-white shadow-2xl sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#e71921]">
          Confirmación
        </p>

        <h2 className="mt-2 text-3xl font-black">
          {title}
        </h2>

        <p className="mt-3 text-sm leading-6 text-gray-400">
          Revisá la información antes de continuar.
        </p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-[#090909] p-5">
          {children}
        </div>

        <div className="mt-5 rounded-2xl border border-[#e71921]/30 bg-[#e71921]/10 p-4">
          <p className="font-bold">
            Importante
          </p>

          <p className="mt-1 text-sm leading-6 text-gray-300">
            Una vez confirmado tendrás{" "}
            <strong className="text-white">
              5 minutos
            </strong>{" "}
            para cancelar desde{" "}
            <strong className="text-white">
              Mis solicitudes
            </strong>
            . Si Jalu confirma la solicitud antes, tampoco
            podrá cancelarse.
          </p>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="rounded-xl border border-white/10 px-5 py-3.5 font-bold transition hover:bg-white/5 disabled:opacity-50"
          >
            Volver
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="rounded-xl bg-[#e71921] px-5 py-3.5 font-black transition hover:bg-[#ff252d] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Registrando..."
              : "Sí, confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}