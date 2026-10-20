import { useEffect } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function AuthModal({
  open,
  mode,
  setMode,
  onClose,
  onSuccess,
}) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
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

      
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-4">
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-[#e71921]/25 bg-[#121212] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.55),0_0_45px_rgba(231,25,33,0.14)] animate-[fadeIn_.25s_ease] sm:max-h-[calc(100dvh-2rem)] sm:p-8"
        >
         
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-5 top-4 text-3xl text-gray-400 transition hover:text-white"
          >
            ×
          </button>

         
          <h2 className="mb-6 pr-8 text-center text-2xl font-black text-white sm:text-3xl">
            {mode === "login"
              ? "Iniciar sesión"
              : "Crear cuenta"}
          </h2>

         
          {mode === "login" ? (
            <LoginForm onSuccess={onSuccess} />
          ) : (
            <RegisterForm
              onLogin={() => setMode("login")}
              onSuccess={onSuccess}
            />
          )}

         
          <div className="mt-6 text-center text-sm text-gray-400">
            {mode === "login" ? (
              <>
                ¿No tenés cuenta?

                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="ml-2 font-bold text-[#e71921] transition hover:text-[#ff2a33]"
                >
                  Registrarse
                </button>
              </>
            ) : (
              <>
                ¿Ya tenés cuenta?

                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="ml-2 font-bold text-[#e71921] transition hover:text-[#ff2a33]"
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
