import RegisterForm from "../components/RegisterForm.jsx";

export default function Register() {
  return (
    <main className="min-h-screen bg-[#080808] px-4 py-32 text-white">
      <div className="mx-auto w-full max-w-md">
        <h1 className="mb-2 text-3xl font-black">
          Crear cuenta
        </h1>

        <p className="mb-8 text-gray-400">
          Registrate para comenzar a usar Jalu.
        </p>

        <RegisterForm />
      </div>
    </main>
  );
}