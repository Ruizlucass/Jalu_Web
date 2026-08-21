import { useState } from "react";

import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import { auth } from "../firebase";

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
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          form.email,
          form.password
        );

      await updateProfile(userCredential.user, {
        displayName: form.name,
      });

      console.log(
        "USUARIO REGISTRADO:",
        userCredential.user
      );

      if (onSuccess) {
        onSuccess(userCredential.user);
      }
    } catch (error) {
      console.error(error);

      switch (error.code) {
        case "auth/email-already-in-use":
          setError("Ya existe una cuenta con ese correo.");
          break;

        case "auth/invalid-email":
          setError("El correo electrónico no es válido.");
          break;

        case "auth/weak-password":
          setError("La contraseña es demasiado débil.");
          break;

        case "auth/network-request-failed":
          setError(
            "No se pudo conectar con Firebase. Revisá tu conexión."
          );
          break;

        default:
          setError("Ocurrió un error al crear la cuenta.");
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
          className="w-full rounded-lg border border-white/10 bg-[#1b1b1b] px-4 py-3 text-white outline-none transition focus:border-orange-500"
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
          className="w-full rounded-lg border border-white/10 bg-[#1b1b1b] px-4 py-3 text-white outline-none transition focus:border-orange-500"
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
          className="w-full rounded-lg border border-white/10 bg-[#1b1b1b] px-4 py-3 text-white outline-none transition focus:border-orange-500"
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
          className="w-full rounded-lg border border-white/10 bg-[#1b1b1b] px-4 py-3 text-white outline-none transition focus:border-orange-500"
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
        className="w-full rounded-lg bg-orange-500 py-3 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
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