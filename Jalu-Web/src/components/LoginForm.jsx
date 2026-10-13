import { useState } from "react";
import { supabase } from "../supabase.js";

export default function LoginForm({ onSuccess }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = ({ target }) => {
    setForm({
      ...form,
      [target.name]: target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) {
        throw error;
      }

      console.log("USUARIO LOGUEADO:", data.user);

      if (onSuccess) {
        onSuccess(data.user);
      }
    } catch (error) {
      console.error(error);

      switch (error.message) {
        case "Invalid login credentials":
          setError("El correo o la contraseña son incorrectos.");
          break;

        case "Email not confirmed":
          setError("Primero tenés que confirmar tu correo electrónico.");
          break;

        case "Invalid email":
          setError("El correo electrónico no es válido.");
          break;

        default:
          if (
            error.message?.toLowerCase().includes("fetch") ||
            error.message?.toLowerCase().includes("network")
          ) {
            setError(
              "No se pudo conectar con el servicio de autenticación. Revisá tu conexión."
            );
          } else {
            setError("Ocurrió un error al iniciar sesión.");
          }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-300">
          Correo electrónico
        </label>

        <input
          name="email"
          type="email"
          placeholder="ejemplo@gmail.com"
          value={form.email}
          onChange={handleChange}
          autoComplete="email"
          required
          className="w-full rounded-lg border border-white/10 bg-[#1b1b1b] px-4 py-3 text-white outline-none transition focus:border-[#e71921] focus:shadow-[0_0_0_3px_rgba(231,25,33,0.16)]"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-300">
          Contraseña
        </label>

        <input
          name="password"
          type="password"
          placeholder="********"
          value={form.password}
          onChange={handleChange}
          autoComplete="current-password"
          required
          className="w-full rounded-lg border border-white/10 bg-[#1b1b1b] px-4 py-3 text-white outline-none transition focus:border-[#e71921] focus:shadow-[0_0_0_3px_rgba(231,25,33,0.16)]"
        />
      </div>

      {error && (
        <p className="text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[#e71921] py-3 font-bold text-white shadow-[0_14px_32px_rgba(231,25,33,0.28)] transition hover:bg-[#ff2a33] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Ingresando..." : "Ingresar"}
      </button>

      <button
        type="button"
        className="w-full text-sm text-gray-400 transition hover:text-white"
      >
        ¿Olvidaste tu contraseña?
      </button>
    </form>
  );
}