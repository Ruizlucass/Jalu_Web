import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

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
      const userCredential = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      console.log("USUARIO LOGUEADO:", userCredential.user);

      if (onSuccess) {
        onSuccess(userCredential.user);
      }
    } catch (error) {
      console.error(error);

      switch (error.code) {
        case "auth/invalid-credential":
          setError("El correo o la contraseña son incorrectos.");
          break;

        case "auth/user-not-found":
          setError("No existe una cuenta con ese correo.");
          break;

        case "auth/wrong-password":
          setError("La contraseña es incorrecta.");
          break;

        case "auth/invalid-email":
          setError("El correo electrónico no es válido.");
          break;

        case "auth/network-request-failed":
          setError(
            "No se pudo conectar con Firebase. Revisá tu conexión."
          );
          break;

        default:
          setError("Ocurrió un error al iniciar sesión.");
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
          autoComplete="current-password"
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