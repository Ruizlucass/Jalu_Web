import { useEffect } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function AuthModal({
  open,
  mode,
  setMode,
  onClose,
}) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#121212] p-8 shadow-2xl animate-[fadeIn_.25s_ease]"
        >

          <button
            onClick={onClose}
            className="absolute right-5 top-4 text-3xl text-gray-400 transition hover:text-white"
          >
            ×
          </button>

          <h2 className="mb-6 text-center text-3xl font-black text-white">

            {mode === "login"
              ? "Iniciar sesión"
              : "Crear cuenta"}

          </h2>

          {mode === "login"
            ? <LoginForm />
            : <RegisterForm />}

          <div className="mt-6 text-center text-sm text-gray-400">

            {mode === "login" ? (
              <>
                ¿No tienes cuenta?

                <button
                  onClick={() => setMode("register")}
                  className="ml-2 font-bold text-orange-500 hover:text-orange-400"
                >
                  Registrarse
                </button>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?

                <button
                  onClick={() => setMode("login")}
                  className="ml-2 font-bold text-orange-500 hover:text-orange-400"
                >
                  Iniciar sesión
                </button>
              </>
            )}

          </div>

        </div>

      </div>
    </>
  );
}