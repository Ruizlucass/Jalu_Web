import RegisterForm from "./RegisterForm.jsx";

export default function RegisterModal({ onClose, onLogin }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#111111] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-2xl text-gray-400 transition hover:text-white"
          aria-label="Cerrar"
        >
          ×
        </button>

        <div className="mb-7">
          <h2 className="text-3xl font-black text-white">
            Crear cuenta
          </h2>

          <p className="mt-2 text-sm text-gray-400">
            Registrate para comenzar a usar Jalu.
          </p>
        </div>

        <RegisterForm onLogin={onLogin} />
      </div>
    </div>
  );
}