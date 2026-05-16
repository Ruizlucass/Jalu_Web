import Navbar from "../components/Navbar.jsx";
import LoginForm from "../components/LoginForm.jsx";

export default function Login() {
  return (
    <main className="app page-shell">
      <Navbar />
      <section className="section page-panel">
        <span className="eyebrow">Club Jalu</span>
        <h1>Ingresar</h1>
        <LoginForm />
      </section>
    </main>
  );
}
