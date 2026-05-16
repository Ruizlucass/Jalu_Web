import Navbar from "../components/Navbar.jsx";
import RegisterForm from "../components/RegisterForm.jsx";

export default function Register() {
  return (
    <main className="app page-shell">
      <Navbar />
      <section className="section page-panel">
        <span className="eyebrow">Club Jalu</span>
        <h1>Crear cuenta</h1>
        <RegisterForm />
      </section>
    </main>
  );
}
