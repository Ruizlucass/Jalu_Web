import LoginForm from "../components/LoginForm.jsx";

export default function Login() {
  return (
    <main className="min-h-screen bg-[#080808] px-4 py-32 text-white">
      <div className="mx-auto w-full max-w-md">
        <h1 className="mb-2 text-3xl font-black">
          Iniciar sesión
        </h1>

        <p className="mb-8 text-gray-400">
          Ingresá a tu cuenta de Jalu.
        </p>

        <LoginForm />
      </div>
    </main>
  );
}