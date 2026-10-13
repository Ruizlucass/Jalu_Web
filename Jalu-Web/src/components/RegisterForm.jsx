import { useState } from "react";

import { supabase } from "../supabase.js";

export default function RegisterForm({
  onLogin,
  onSuccess,
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            name: form.name,
          },
        },
      });

      if (error) {
        throw error;
      }

      console.log(
        "USUARIO REGISTRADO:",
        data.user
      );

      if (onSuccess) {
        onSuccess(data.user);
      }
    } catch (error) {
      console.error(error);

      switch (error.message) {
        case "User already registered":
          setError("Ya existe una cuenta con ese correo.");
          break;

        case "Unable to validate email address: invalid format":
          setError("El correo electrónico no es válido.");
          break;

        case "Password should be at least 6 characters.":
          setError("La contraseña es demasiado débil.");
          break;

        default:
          setError(
            error.message || "Ocurrió un error al crear la cuenta."
          );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-300">
          Nombre
        </label>

        <input
          name="name"
          type="text"
          placeholder="Tu nombre"
          value={form.name}
          onChange={handleChange}
          autoComplete="name"
          required
          className="w-full rounded-lg border border-white/10 bg-[#1b1b1b] px-4 py-3 text-white outline-none transition focus:border-[#e71921] focus:shadow-[0_0_0_3px_rgba(231,25,33,0.16)]"
        />
      </div>

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
          autoComplete="new-password"
          required
          className="w-full rounded-lg border border-white/10 bg-[#1b1b1b] px-4 py-3 text-white outline-none transition focus:border-[#e71921] focus:shadow-[0_0_0_3px_rgba(231,25,33,0.16)]"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-300">
          Confirmar contraseña
        </label>

        <input
          name="confirmPassword"
          type="password"
          placeholder="********"
          value={form.confirmPassword}
          onChange={handleChange}
          autoComplete="new-password"
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
        {loading ? "Creando cuenta..." : "Crear cuenta"}
      </button>

      {onLogin && (
        <button
          type="button"
          onClick={onLogin}
          className="w-full text-sm text-gray-400 transition hover:text-white"
        >
          ¿Ya tenés una cuenta? Iniciá sesión
        </button>
      )}
    </form>
  );
}